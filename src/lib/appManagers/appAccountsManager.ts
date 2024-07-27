import rootScope from '../rootScope';
import sessionStorage from '../sessionStorage';
import {ApiUpdatesManager} from './apiUpdatesManager';
import {Chat, Dialog, InputPeer, Message, Peer, Update, Updates, User} from '../../layer';
import {AppManager} from './manager';
import {logger, LogTypes} from '../logger';
import {AnyDialog} from '../storages/dialogs';
import {MyMessage} from './appMessagesManager';
import {NULL_PEER_ID} from '../mtproto/mtproto_config';
import getPeerId from './utils/peers/getPeerId';

class AccountUpdatesManager extends ApiUpdatesManager {
  private dialogs: Record<PeerId, Dialog.dialog> = {};
  private accessHashes: Record<PeerId, string | number> = {};
  private outMessages: Record<PeerId, Record<number, MyMessage>> = {};

  constructor(private account: PeerId) {
    super();
  }
  saveUpdatesState() {}

  public setDialogs(dialogs: Dialog[]) {
    for(const dialog of dialogs) {
      if(dialog._ !== 'dialog') continue;
      this.dialogs[getPeerId(dialog.peer)] = dialog;
    }
  }

  public setUsers(users: User[]) {
    for(const user of users) {
      if(user._ !== 'user') continue;
      this.accessHashes[user.id.toPeerId()] = user.access_hash;
    }
  }

  public setChats(chats: Chat[]) {
    for(const chat of chats) {
      if(chat._ !== 'channel' && chat._ !== 'channelForbidden') continue;
      this.accessHashes[chat.id.toPeerId()] = chat.access_hash;
    }
  }

  public setMessages(messages: Message[]) {
    for(const message of messages) {
      if(message._ !== 'message') continue;
      if(message.pFlags.out) {
        const peer = getPeerId(message.peer_id);
        if(!(peer in this.outMessages)) {
          this.outMessages[peer] = {};
        }
        this.outMessages[peer][message.id] = message;
      }
    }
  }

  protected saveUpdateData(updateMessage: Updates.updates | Updates.updatesCombined, options: { override?: boolean }) {
    this.log('saving data', updateMessage);
    this.appUsersManager.saveApiUsers(updateMessage.users, options.override);
    // super.saveUpdateData(updateMessage, options);
    for(const user of updateMessage.users) {
      if(user._ !== 'user') continue;
      this.accessHashes[user.id.toPeerId()] = user.access_hash;
    }
    for(const chat of updateMessage.chats) {
      if(chat._ !== 'channel' && chat._ !== 'channelForbidden') {
        continue;
      }
      this.accessHashes[chat.id.toPeerId()] = chat.access_hash;
    }
  }

  attach() {
    this.apiManager.invokeApi('updates.getState', {}, {noErrorBox: true, forceAccount: this.account}).then((stateResult) => {
      this.updatesState.seq = stateResult.seq;
      this.updatesState.pts = stateResult.pts;
      this.updatesState.date = stateResult.date;
    });
  }

  async saveUpdate(update: Update) {
    const messageUpdates = ['updateNewDiscussionMessage', 'updateNewMessage', 'updateNewChannelMessage', 'updateMessageReactions'];
    if(messageUpdates.includes(update._) || (update._ === 'updateReadHistoryInbox' && update.still_unread_count === 0)) {
      await this.appAccountsManager.countUnread(this.account);
    }
    if(!messageUpdates.includes(update._)) return;
    if(update._ === 'updateMessageReactions') {
      this.handleReaction(update);
      return;
    }
    this.handleMessage(update as any);
  }

  private handleReaction(update: Update.updateMessageReactions) {
    const {peer, msg_id, top_msg_id, reactions} = update;
    const channelId = (peer as Peer.peerChannel).channel_id;
    const mid = this.appMessagesIdsManager.generateMessageId(msg_id, channelId);
    const peerId = this.appPeersManager.getPeerId(peer);
    const message: MyMessage = this.outMessages[peerId]?.[mid];

    this.log('reaction message', message);
    if(message?._ !== 'message') {
      return;
    }

    const recentReactions = reactions?.recent_reactions;
    const previousReactions = message.reactions;
    const previousRecentReactions = previousReactions?.recent_reactions;
    const isUnread = recentReactions?.some((reaction) => reaction.pFlags.unread);
    this.log('reaction', recentReactions, message);
    if(recentReactions?.length && message.pFlags.out) { // * if user added a reaction to our message
      const recentReaction = recentReactions[recentReactions.length - 1];
      if(this.appPeersManager.getPeerId(recentReaction.peer_id) !== this.account && isUnread) {
        this.getNotifyPeerSettings(peerId).then((peerTypeNotifySettings) => {
          if(/* muted ||  */!peerTypeNotifySettings.show_previews) return;
          this.appMessagesManager.notifyAboutMessage(message, {
            peerReaction: recentReaction,
            peerTypeNotifySettings
          });
        });
      }
    }
  }

  private async getNotifyPeerSettings(peerId: PeerId, threadId?: string) {
    const inputNotifyPeer = this.appPeersManager.getInputNotifyPeerById({
      peerId,
      threadId: threadId ? +threadId : undefined
    });
    if(inputNotifyPeer.peer._ === 'inputPeerChannel' || inputNotifyPeer.peer._ === 'inputPeerUser') {
      const id = (inputNotifyPeer.peer as InputPeer.inputPeerChannel).channel_id || (inputNotifyPeer.peer as InputPeer.inputPeerUser).user_id;
      this.log('hashes', this.accessHashes);
      inputNotifyPeer.peer.access_hash = this.accessHashes[id.toPeerId()];
    }

    return this.apiManager.invokeApi('account.getNotifySettings', {peer: inputNotifyPeer}, {forceAccount: this.account});
  }

  private async handleMessage(update: Update.updateNewDiscussionMessage | Update.updateNewMessage | Update.updateNewChannelMessage) {
    const message = update.message as MyMessage;
    const fromId = message.fromId;
    const messagePeer = this.appMessagesManager.getMessagePeer(message);
    this.appMessagesManager.saveMessages([message], {storage: this.appMessagesManager.createMessageStorage(messagePeer, 'history')});
    const threadKey = this.appMessagesManager.getThreadKey(message);
    const notifyPeer = threadKey || messagePeer.toString();

    const [_peerId, threadId] = notifyPeer.split('_');
    const peerId = _peerId.toPeerId();
    const isForum = this.appPeersManager.isForum(peerId);

    this.appMessagesManager.setMessageUnreadByDialog(message, this.dialogs[peerId]);

    const notifyPeerToHandle: {
      fwdCount: number,
      fromId: PeerId,
      topMessage?: MyMessage
    } = {
      fwdCount: 0,
      fromId: NULL_PEER_ID
    };

    if(notifyPeerToHandle.fromId !== fromId) {
      notifyPeerToHandle.fromId = fromId;
      notifyPeerToHandle.fwdCount = 0;
    }

    if((message as Message.message).fwd_from) {
      ++notifyPeerToHandle.fwdCount;
    }

    if(message.pFlags.out) {
      if(!(message.peerId in this.outMessages)) {
        this.outMessages[message.peerId] = {};
      }
      this.outMessages[message.peerId][message.mid] = message;
    }

    notifyPeerToHandle.topMessage = message;
    const peerTypeNotifySettings = await this.getNotifyPeerSettings(peerId, isForum ? threadId : undefined);

    const muted = this.appNotificationsManager.isMuted(peerTypeNotifySettings);
    const topMessage = notifyPeerToHandle.topMessage;
    if((muted && !topMessage.pFlags.mentioned) || topMessage.pFlags.out || !topMessage.pFlags.unread) {
      return;
    }

    this.appMessagesManager.notifyAboutMessage(topMessage, {
      toAccount: this.account,
      fwdCount: notifyPeerToHandle.fwdCount,
      peerTypeNotifySettings
    });
  }
}

export class AppAccountsManager extends AppManager {
  private unreadDialogs: Record<PeerId, number> = {};
  private updatesManagers: Record<PeerId, AccountUpdatesManager> = {};
  private log = logger('ACCOUNTS', LogTypes.Error | LogTypes.Warn | LogTypes.Log/*  | LogTypes.Debug */);

  constructor() {
    super();
  }

  public async attach() {
    const accounts = await sessionStorage.get('accounts');
    this.log('attaching', Object.keys(accounts));
    for(const account in accounts) {
      if(account.toPeerId() === rootScope.myId) continue;

      this.countUnread(account.toPeerId());

      const updateManager = new AccountUpdatesManager(account.toPeerId());
      updateManager.setManagers({
        apiManager: this.apiManager,
        appPeersManager: this.appPeersManager,
        appUsersManager: this.appUsersManager,
        appChatsManager: this.appChatsManager,
        appMessagesManager: this.appMessagesManager,
        appNotificationsManager: this.appNotificationsManager,
        appMessagesIdsManager: this.appMessagesIdsManager,
        appAccountsManager: this
      } as any);

      updateManager.attach();
      this.updatesManagers[account] = updateManager;
    }

    // rootScope.addEventListener('subaccount_update', ({account, message}) => {
    //   this.updatesManagers[account].processUpdateMessage(message);
    // })
  }

  public handleUpdate(account: PeerId, message: any) {
    this.updatesManagers[account].processUpdateMessage(message);
  }

  public getUnread(account: PeerId) {
    return this.unreadDialogs[account];
  }

  public async countUnread(account: PeerId) {
    const dialogs = await this.apiManager.invokeApi('messages.getDialogs', {
      folder_id: 0,
      offset_date: 0,
      offset_id: 0,
      offset_peer: this.appPeersManager.getInputPeerById(null),
      limit: 0,
      hash: '0'
    }, {noErrorBox: true, forceAccount: account});
    console.log(dialogs);
    if(dialogs._ === 'messages.dialogs') {
      this.updatesManagers[account].setDialogs(dialogs.dialogs);
      this.updatesManagers[account].setUsers(dialogs.users);
      this.updatesManagers[account].setMessages(dialogs.messages);
      this.updatesManagers[account].setChats(dialogs.chats);
      this.unreadDialogs[account] = AppAccountsManager.countUnreadDialogs(dialogs.dialogs as AnyDialog[]);
    }
    return this.unreadDialogs[account];
  }

  public static countUnreadDialogs(dialogs: AnyDialog[]) {
    return dialogs.map(dialog => dialog._ === 'dialog' &&
      ((dialog.unread_count + dialog.unread_mentions_count + dialog.unread_reactions_count) > 0 ||
        dialog.pFlags.unread_mark)).filter(Boolean).length;
  }
}
// const appAccountsManager = new AppAccountsManager();
// MOUNT_CLASS_TO.appAccountsManager = appAccountsManager;
// export default appAccountsManager;
