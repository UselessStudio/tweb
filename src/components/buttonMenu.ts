/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import flatten from '../helpers/array/flatten';
import contextMenuController from '../helpers/contextMenuController';
import cancelEvent from '../helpers/dom/cancelEvent';
import {AttachClickOptions, attachClickEvent} from '../helpers/dom/clickEvent';
import findUpClassName from '../helpers/dom/findUpClassName';
import setInnerHTML from '../helpers/dom/setInnerHTML';
import ListenerSetter from '../helpers/listenerSetter';
import {_i18n, FormatterArguments, i18n, LangPackKey} from '../lib/langPack';
import CheckboxField from './checkboxField';
import {Document} from '../layer';
import {IS_MOBILE} from '../environment/userAgent';
import ripple from './ripple';
import Icon from './icon';
import RadioForm from './radioForm';
import wrapAttachBotIcon from './wrappers/attachBotIcon';
import callbackify from "../helpers/callbackify.js";
import ButtonMenuToggle from "./buttonMenuToggle.js";
import filterAsync from "../helpers/array/filterAsync.js";

type ButtonMenuItemInner = Omit<Parameters<typeof ButtonMenuSync>[0], 'listenerSetter' | 'buttons'> & {buttons: ButtonMenuItemOptionsVerifiable[]};
export type ButtonMenuItemOptions = {
  icon?: Icon,
  iconElement?: HTMLElement,
  rightElement?: HTMLElement,
  iconDoc?: Document.document,
  danger?: boolean,
  new?: boolean,
  className?: string,
  text?: LangPackKey,
  textArgs?: FormatterArguments,
  regularText?: Parameters<typeof setInnerHTML>[1],
  onClick: (e: MouseEvent | TouchEvent) => any,
  checkForClose?: () => boolean,
  element?: HTMLElement,
  textElement?: HTMLElement,
  options?: AttachClickOptions,
  checkboxField?: CheckboxField,
  noCheckboxClickListener?: boolean,
  keepOpen?: boolean,
  separator?: boolean | HTMLElement,
  separatorDown?: boolean,
  multiline?: boolean,
  secondary?: boolean,
  loadPromise?: Promise<any>,
  waitForAnimation?: boolean,
  radioGroup?: string,
  inner?: (() => MaybePromise<ButtonMenuItemInner>) | ButtonMenuItemInner
  /* , cancelEvent?: true */
};

export type ButtonMenuItemOptionsVerifiable = ButtonMenuItemOptions & {
  verify?: () => boolean | Promise<boolean>
};

function ButtonMenuItem(options: ButtonMenuItemOptions) {
  if(options.element) return [options.separator as HTMLElement, options.element].filter(Boolean);

  const {icon, iconDoc, className, text, onClick, checkboxField, noCheckboxClickListener, iconElement, rightElement} = options;
  const el = document.createElement('div');
  const iconSplitted = icon?.split(' ');
  el.className = 'btn-menu-item rp-overflow' +
    (iconSplitted?.length > 1 ? ' ' + iconSplitted.slice(1).join(' ') : '') +
    (className ? ' ' + className : '') +
    (options.danger ? ' danger' : '');

  if(IS_MOBILE) {
    ripple(el);
  }

  if(iconSplitted) {
    el.append(Icon(iconSplitted[0] as Icon, 'btn-menu-item-icon'));
  }

  let textElement = options.textElement;
  if(!textElement) {
    textElement = options.textElement = text ? i18n(text, options.textArgs) : document.createElement('span');
    if(options.regularText) {
      setInnerHTML(textElement, options.regularText);
      textElement.dir = '';
    }
  }

  if(iconDoc) {
    const iconElement = document.createElement('span');
    iconElement.classList.add('btn-menu-item-icon');
    el.append(iconElement);

    const isMobile = () => document.documentElement.classList.contains('is-mobile');

    options.loadPromise = wrapAttachBotIcon({
      doc: iconDoc,
      element: iconElement,
      size: 24,
      textColor: () => isMobile() ? 'secondary-text-color' : 'primary-text-color',
      strokeWidth: () => isMobile() ? .625 : .375
    });
  }

  if(iconElement) {
    iconElement.classList.add('btn-menu-item-icon', 'is-external');
    el.append(iconElement);
  }

  textElement.classList.add('btn-menu-item-text');
  el.append(textElement);

  if(options.new) {
    const badge = document.createElement('span');
    badge.classList.add('btn-menu-item-badge');
    _i18n(badge, 'New');
    el.append(badge);
  }

  const keepOpen = !!checkboxField || !!options.keepOpen;

  // * cancel mobile keyboard close
  onClick && attachClickEvent(el, /* CLICK_EVENT_NAME !== 'click' || keepOpen ? */ /* async */(e) => {
    cancelEvent(e);

    const menu = findUpClassName(e.target, 'btn-menu');
    if(menu && !menu.classList.contains('active')) {
      return;
    }

    // let closed = false;
    // if(!keepOpen && !options.checkForClose) {
    //   closed = true;
    //   contextMenuController.close();
    // }

    // wait for closing animation
    // if(options.waitForAnimation && rootScope.settings.animationsEnabled && !options.checkForClose) {
    //   await pause(125);
    // }

    onClick(e);
    if(options.checkForClose?.() === false) {
      return;
    }

    if(!keepOpen/*  && !closed */) {
      contextMenuController.close();
    }

    if(checkboxField && !noCheckboxClickListener/*  && result !== false */) {
      checkboxField.checked = checkboxField.input.type === 'radio' ? true : !checkboxField.checked;
    }
  }/*  : onClick */, options.options);

  if(checkboxField) {
    el.append(checkboxField.label);
  }

  if(options.separator === true || options.separatorDown) {
    options.separator = document.createElement('hr');
  }

  if(options.secondary) {
    el.classList.add('is-secondary');
    options.multiline = true;
  }

  if(options.multiline) {
    el.classList.add('is-multiline');
  }

  if(rightElement) {
    rightElement.classList.add('btn-menu-item-icon-right');
    el.append(rightElement);
  }

  if(options.inner) {
    el.append(Icon('next', 'btn-menu-item-icon', 'btn-menu-item-icon-right'));
    el.classList.add('has-inner');
    // (el as any).inner = options.inner;
    const inner = typeof options.inner === "function" ? options.inner() : options.inner;
    callbackify(inner, async (inner) => {
      const f = (b: (typeof inner.buttons[0])[]) =>
        filterAsync(b, (button) => button?.verify ? button.verify() ?? false : true);

      const menu = await ButtonMenu({
        ...inner,
        buttons: await f(inner.buttons),
      });
      menu.classList.add("inner");
      menu.classList.add("bottom-right");
      el.after(menu);
    })
  }

  const ret: HTMLElement[] = [options.element = el];

  if(options.separator) {
    ret[options.separatorDown ? 'push' : 'unshift'](options.separator as HTMLElement);
  }

  return ret.filter(Boolean);
}

export function ButtonMenuSync({listenerSetter, buttons, radioGroups}: {
  buttons: ButtonMenuItemOptions[],
  radioGroups?: {
    name: string,
    onChange: (value: string, e: Event) => any,
    checked: number // idx
  }[],
  listenerSetter?: ListenerSetter
}) {
  const el: HTMLElement = document.createElement('div');
  el.classList.add('btn-menu');

  if(radioGroups) {
    buttons.forEach((b) => {
      if(!b.radioGroup) {
        return;
      }

      b.checkboxField ??= new CheckboxField();
    });
  }

  if(listenerSetter) {
    buttons.forEach((b) => {
      (b.options ??= {}).listenerSetter = listenerSetter;
    });
  }

  const items = buttons.map(ButtonMenuItem);
  el.append(...flatten(items));

  if(radioGroups) {
    radioGroups.forEach((group) => {
      const elements = buttons.filter((button) => button.radioGroup === group.name);

      const hr = document.createElement('hr');
      elements[0].element.replaceWith(hr);

      const container = RadioForm(elements.map((e, idx) => {
        const input = e.checkboxField.input;
        input.type = 'radio';
        input.name = group.name;
        input.value = '' + +(idx === group.checked);
        input.checked = idx === group.checked;
        return {
          container: e.element,
          input: e.checkboxField.input
        };
      }), group.onChange);

      hr.before(container);
      container.append(hr);
    });
  }

  return el;
}

export default async function ButtonMenu(options: Parameters<typeof ButtonMenuSync>[0]) {
  const el = ButtonMenuSync(options);
  await Promise.all(options.buttons.map(({loadPromise}) => loadPromise));
  return el;
}
