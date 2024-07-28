import EmoticonsTabC from '../../emoticonsDropdown/tab';
import findUpClassName from '../../../helpers/dom/findUpClassName';
import mediaSizes from '../../../helpers/mediaSizes';
import {Document, MessagesAllStickers, StickerSet} from '../../../layer';
import {MyDocument} from '../../../lib/appManagers/appDocsManager';
import {AppManagers} from '../../../lib/appManagers/managers';
import wrapEmojiText from '../../../lib/richTextProcessor/wrapEmojiText';
import rootScope from '../../../lib/rootScope';
import {putPreloader} from '../../putPreloader';
import PopupStickers from '../../popups/stickers';
import findAndSplice from '../../../helpers/array/findAndSplice';
import VisibilityIntersector, {OnVisibilityChangeItem} from '../../visibilityIntersector';
import findUpAsChild from '../../../helpers/dom/findUpAsChild';
import forEachReverse from '../../../helpers/array/forEachReverse';
import PopupElement from '../../popups';
import apiManagerProxy from '../../../lib/mtproto/mtprotoworker';
import getStickerEffectThumb from '../../../lib/appManagers/utils/stickers/getStickerEffectThumb';
import StickersTabCategory, {EmoticonsTabStyles} from '../../emoticonsDropdown/category';
import {i18n} from '../../../lib/langPack';
import {onCleanup} from 'solid-js';
import SuperStickerRenderer from '../../emoticonsDropdown/tabs/SuperStickerRenderer';
import {EmoticonsDropdown, EMOTICONSSTICKERGROUP} from '../../emoticonsDropdown';
import findUpTag from '../../../helpers/dom/findUpTag';


type StickersTabItem = {element: HTMLElement, document: Document.document};
export default class StickersTab extends EmoticonsTabC<StickersTabCategory<StickersTabItem>, Document.document[]> {
  private stickerRenderer: SuperStickerRenderer;
  private onStickerClick: (document: Document.document) => void;

  constructor({
    managers,
    onStickerClick
  }: {
    managers: AppManagers,
    onStickerClick?: (document: Document.document) => void
  }) {
    super({
      managers,
      searchFetcher: async(value) => {
        if(!value) return [];
        return this.managers.appStickersManager.searchStickers(value);
      },
      groupFetcher: async(group) => {
        if(!group) return [];

        if(group._ === 'emojiGroupPremium') {
          return this.managers.appStickersManager.getPremiumStickers();
        }

        return this.managers.appStickersManager.getStickersByEmoticon({emoticon: group.emoticons, includeServerStickers: true});
      },
      processSearchResult: async({data: stickers, searching, grouping}) => {
        if(!stickers || (!searching && !grouping)) {
          return;
        }

        if(!stickers.length) {
          const span = i18n('NoStickersFound');
          span.classList.add('emoticons-not-found');
          return span;
        }

        const container = this.categoriesContainer.cloneNode(false) as HTMLElement;
        const category = this.createCategory({styles: EmoticonsTabStyles.Stickers});
        const promise = StickersTab.categoryAppendStickers(
          this,
          this.stickerRenderer,
          stickers.length,
          category,
          stickers
        );
        container.append(category.elements.container);

        let cleaned = false;
        onCleanup(() => {
          cleaned = true;
          category.middlewareHelper.destroy();
          this.clearCategoryItems(category, true);
        });

        await promise;

        if(!cleaned) {
          StickersTab._onCategoryVisibility(category, true);
        }

        return container;
      },
      // searchNoLoader: true,
      searchPlaceholder: 'SearchStickers',
      searchType: 'stickers'
    });

    if(onStickerClick) {
      this.onStickerClick = onStickerClick.bind(this);
    }
    this.container.classList.add('stickers-padding');
    this.content.id = 'content-stickers-media-editor';
  }

  private setFavedLimit(limit: number) {
    const category = this.categories['faved'];
    category.limit = limit;
  }

  public static _onCategoryVisibility = (category: StickersTabCategory<any>, visible: boolean) => {
    // scroll freezing probobility here. add this because of bug when scroll to top.
    // TODO: get order of visible category and not render if diff > n
    if(!visible) {
      return;
    }

    category.elements.items.replaceChildren(...(!visible ? [] : category.items.map(({element}) => element)));
  };

  private onCategoryVisibility = ({target, visible}: OnVisibilityChangeItem) => {
    const category = this.categoriesMap.get(target);
    StickersTab._onCategoryVisibility(category, visible);
  };

  public createStickerRenderer() {
    const superStickerRenderer = new SuperStickerRenderer({
      regularLazyLoadQueue: this.emoticonsDropdown.lazyLoadQueue,
      group: EMOTICONSSTICKERGROUP,
      managers: this.managers,
      intersectionObserverInit: {root: document.getElementById('element')}
    });

    const rendererLazyLoadQueue = superStickerRenderer.lazyLoadQueue;
    this.emoticonsDropdown.addLazyLoadQueueRepeat(
      rendererLazyLoadQueue,
      superStickerRenderer.processInvisible,
      this.middlewareHelper.get()
    );

    return superStickerRenderer;
  }

  public init() {
    super.init();
    /* stickersDiv.addEventListener('mouseover', (e) => {
      let target = e.target as HTMLElement;

      if(target.tagName === 'CANVAS') { // turn on sticker
        let animation = lottieLoader.getAnimation(target.parentElement, EMOTICONSSTICKERGROUP);

        if(animation) {
          // @ts-ignore
          if(animation.currentFrame === animation.totalFrames - 1) {
            animation.goToAndPlay(0, true);
          } else {
            animation.play();
          }
        }
      }
    }); */

    this.categoriesIntersector = new VisibilityIntersector(this.onCategoryVisibility, {root: document.getElementById('element')});

    this.scrollable.container.addEventListener('click', async(e) => {
      const target = findUpTag(e.target as HTMLElement, 'DIV');

      if(findUpClassName(e.target, 'category-title')) {
        const container = findUpClassName(target, 'emoji-category');
        const category = this.categoriesMap.get(container);
        if(category.local) {
          return;
        }

        PopupElement.createPopup(PopupStickers, {id: category.set.id, access_hash: category.set.access_hash}, false, this.emoticonsDropdown.chatInput).show();
        return;
      }


      if(!target?.dataset?.docId) {
        return;
      }
      if(this.onStickerClick) {
        this.onStickerClick(await this.managers.appDocsManager.getDoc(target?.dataset?.docId));
      }
    });

    this.menuOnClickResult = EmoticonsDropdown.menuOnClick(this as any, this.menu, this.scrollable, this.menuScroll as any);

    const preloader = putPreloader(this.content, true);

    const onCategoryStickers = (category: StickersTabCategory<StickersTabItem>, stickers: MyDocument[]) => {
      // if(category.id === 'faved' && category.limit && category.limit < stickers.length) {
      //   category.limit = stickers.length;
      // }

      if(category.limit) {
        stickers = stickers.slice(0, category.limit);
      }

      const ids = new Set(stickers.map((doc) => doc.id));
      forEachReverse(category.items, (item) => {
        if(!ids.has(item.document.id)) {
          this.deleteSticker(category, item.document, true);
        }
      });

      this.toggleLocalCategory(category, !!stickers.length);
      forEachReverse(stickers, (doc, idx) => {
        this.unshiftSticker(category, doc, true, idx);
      });
      this.spliceExceed(category);
      category.elements.container.classList.remove('hide');
    };

    const favedCategory = this.createLocalCategory({
      id: 'faved',
      title: 'FavoriteStickers',
      icon: 'savedmessages',
      styles: EmoticonsTabStyles.Stickers
    });

    const recentCategory = this.createLocalCategory({
      id: 'recent',
      title: 'Stickers.Recent',
      icon: 'recent',
      styles: EmoticonsTabStyles.Stickers
    });
    recentCategory.limit = 20;

    const promises = [
      Promise.all([
        this.managers.apiManager.getLimit('favedStickers'),
        this.managers.appStickersManager.getFavedStickersStickers()
      ]).then(([limit, stickers]) => {
        this.setFavedLimit(limit);
        onCategoryStickers(favedCategory, stickers);
      }),

      this.managers.appStickersManager.getRecentStickersStickers().then((stickers) => {
        onCategoryStickers(recentCategory, stickers);
      }),

      this.managers.appStickersManager.getAllStickers().then((res) => {
        for(const set of (res as MessagesAllStickers.messagesAllStickers).sets) {
          StickersTab.renderStickerSet(this, this.stickerRenderer, set, false);
        }
      })
    ];

    Promise.race(promises).finally(() => {
      preloader.remove();
    });

    Promise.all(promises).finally(() => {
      this.mounted = true;

      const favedCategory = this.categories['faved'];
      const recentCategory = this.categories['recent'];
      this.menuOnClickResult.setActive(favedCategory.items.length ? favedCategory : recentCategory);

      rootScope.addEventListener('stickers_installed', (set) => {
        if(!this.categories[set.id]) {
          StickersTab.renderStickerSet(this, this.stickerRenderer, set, true);
        }
      });
    });

    this.stickerRenderer = this.createStickerRenderer();

    rootScope.addEventListener('sticker_updated', ({type, document, faved}) => {
      // if(type === 'faved') {
      //   return;
      // }

      const category = this.categories[type === 'faved' ? 'faved' : 'recent'];
      if(category) {
        if(faved) {
          this.unshiftSticker(category, document);
        } else {
          this.deleteSticker(category, document);
        }
      }
    });

    rootScope.addEventListener('stickers_deleted', ({id}) => {
      const category = this.categories[id];
      this.deleteCategory(category);
    });

    rootScope.addEventListener('stickers_top', this.postponedEvent((id) => {
      const category = this.categories[id];
      if(category) {
        this.positionCategory(category, true);
        this.emoticonsDropdown.addEventListener('openAfterLayout', () => {
          this.menuOnClickResult.setActiveStatic(category);
        }, {once: true});
      }
    }));

    rootScope.addEventListener('stickers_order', ({type, order}) => {
      if(type !== 'stickers') {
        return;
      }

      order.forEach((id) => {
        const category = this.categories[id];
        if(category) {
          this.positionCategory(category, false);
        }
      });
    });

    rootScope.addEventListener('stickers_updated', ({type, stickers}) => {
      const category = this.categories[type === 'faved' ? 'faved' : 'recent'];
      if(category) {
        onCategoryStickers(category, stickers);
      }
    });

    rootScope.addEventListener('app_config', () => {
      this.managers.apiManager.getLimit('favedStickers').then((limit) => {
        this.setFavedLimit(limit);
      });
    });

    mediaSizes.addEventListener('resize', this.resizeCategories);

    this.attachHelpers({
      verifyRecent: (target) => !!findUpAsChild(target, this.categories['recent'].elements.items)
    });

    this.init = null;
  }

  public deleteCategory(category: StickersTabCategory<StickersTabItem>) {
    const ret = super.deleteCategory(category);
    if(ret) {
      this.clearCategoryItems(category);
    }

    return ret;
  }

  private clearCategoryItems(category: StickersTabCategory<StickersTabItem>, noUnmount?: boolean) {
    if(!noUnmount) category.elements.items.replaceChildren();
    category.items.splice(0, Infinity).forEach(({element}) => this.stickerRenderer.unobserveAnimated(element));
  }

  public deleteSticker(category: StickersTabCategory<StickersTabItem>, doc: MyDocument, batch?: boolean) {
    const item = findAndSplice(category.items, (item) => item.document.id === doc.id);
    if(item) {
      item.element.remove();
      this.stickerRenderer.unobserveAnimated(item.element);

      if(!batch) {
        this.onLocalCategoryUpdate(category);
      }
    }
  }

  public unshiftSticker(category: StickersTabCategory<StickersTabItem>, doc: MyDocument, batch?: boolean, idx?: number) {
    if(idx !== undefined) {
      const i = category.items[idx];
      if(i && i.document.id === doc.id) {
        return;
      }
    }

    let item = findAndSplice(category.items, (item) => item.document.id === doc.id);
    if(!item) {
      item = {
        element: this.stickerRenderer.renderSticker(doc, undefined, undefined, category.middlewareHelper.get()),
        document: doc
      };
    }

    category.items.unshift(item);
    category.elements.items.prepend(item.element);

    if(!batch) {
      this.spliceExceed(category);
    }
  }

  public unshiftRecentSticker(doc: MyDocument) {
    this.managers.appStickersManager.saveRecentSticker(doc.id);
  }

  public deleteRecentSticker(doc: MyDocument) {
    this.managers.appStickersManager.saveRecentSticker(doc.id, true);
  }

  public onOpened() {
    this.resizeCategories();
  }

  public destroy() {
    this.stickerRenderer.destroy();
    super.destroy();
  }

  public static categoryAppendStickers(
    tab: EmoticonsTabC<any>,
    stickerRenderer: SuperStickerRenderer,
    count: number,
    category: StickersTabCategory<StickersTabItem>,
    promise: MaybePromise<MyDocument[]>
  ) {
    const {container} = category.elements;

    category.setCategoryItemsHeight(count);
    container.classList.remove('hide');

    return Promise.all([
      promise,
      apiManagerProxy.isPremiumFeaturesHidden()
    ]).then(([documents, isPremiumFeaturesHidden]) => {
      const isVisible = tab.isCategoryVisible(category);

      const elements = documents.map((document) => {
        if(isPremiumFeaturesHidden && getStickerEffectThumb(document)) {
          return;
        }

        const element = stickerRenderer.renderSticker(document, undefined, undefined, category.middlewareHelper.get());
        category.items.push({document, element});
        return element;
      }).filter(Boolean);

      if(isVisible) {
        category.elements.items.append(...elements);
      }
    });
  }

  public static async renderStickerSet(
    tab: EmoticonsTabC<any>,
    stickerRenderer: SuperStickerRenderer,
    set: StickerSet.stickerSet,
    prepend?: boolean
  ) {
    const category = tab.createCategory({
      stickerSet: set,
      title: wrapEmojiText(set.title),
      styles: EmoticonsTabStyles.Stickers
    });
    const {menuTabPadding} = category.elements;

    const promise = tab.managers.appStickersManager.getStickerSet(set);
    this.categoryAppendStickers(
      tab,
      stickerRenderer,
      set.count,
      category,
      promise.then((stickerSet) => stickerSet.documents as MyDocument[])
    );

    if(prepend !== undefined) {
      tab.positionCategory(category, prepend);
    }

    tab.renderStickerSetThumb({
      set,
      menuTabPadding,
      middleware: category.middlewareHelper.get()
    });
  }
}
