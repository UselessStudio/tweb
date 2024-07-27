/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import type {AppInstance} from './mtproto/singleInstance';
import type {UserAuth} from './mtproto/mtproto_config';
import type {DcId} from '../types';
import {MOUNT_CLASS_TO} from '../config/debug';
import LocalStorageController from './localStorage';
import {DcAuthKey, DcServerSalt} from '../types';

type AuthValue = Partial<Record<PeerId | 'anonymous', string>>;

type AuthKeys = {
  [key in DcAuthKey]: AuthValue;
}

type ServerSalts = {
  [key in DcServerSalt]: AuthValue;
}

const sessionStorage = new LocalStorageController<AuthKeys & ServerSalts & {
  dc: DcId,
  accounts: Record<PeerId, UserAuth>,
  // user_auth: UserAuth,
  user_auth: PeerId,
  state_id: number,
  auth_key_fingerprint: string, // = dc${App.baseDcId}_auth_key.slice(0, 8)
  server_time_offset: number,
  xt_instance: AppInstance,
  kz_version: 'K' | 'Z',
  tgme_sync: {
    canRedirect: boolean,
    ts: number
  },
  k_build: number
}>(/* ['kz_version'] */);
MOUNT_CLASS_TO.appStorage = sessionStorage;
export default sessionStorage;
