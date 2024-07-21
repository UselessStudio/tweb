/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import {ButtonMenuItemOptions} from '../components/buttonMenu';
import IS_TOUCH_SUPPORTED from '../environment/touchSupport';
import findUpClassName from './dom/findUpClassName';
import mediaSizes from './mediaSizes';
import OverlayClickHandler from './overlayClickHandler';
import overlayCounter from './overlayCounter';

class ContextMenuController extends OverlayClickHandler {
  constructor() {
    super('menu', true);

    mediaSizes.addEventListener('resize', () => {
      if(this.element) {
        this.close();
      }

      /* if(openedMenu && (openedMenu.style.top || openedMenu.style.left)) {
        const rect = openedMenu.getBoundingClientRect();
        const {innerWidth, innerHeight} = window;

        console.log(innerWidth, innerHeight, rect);
      } */
    });
  }

  public isOpened() {
    return !!this.element;
  }

  private isOutOfRange(x: number, y: number,
                        {top, bottom, right, left}: {top: number, bottom: number, left: number, right: number}): boolean {
    const diffX = x >= right ? x - right : left - x;
    const diffY = y >= bottom ? y - bottom : top - y;
    return diffX >= 100 || diffY >= 100;
  }

  private onMouseMove = (e: MouseEvent) => {
    const element = findUpClassName(e.target, 'btn-menu-item');
    // const inner = (element as any)?.inner as ButtonMenuItemOptions['inner'];

    const inner = this.element.querySelector(".inner.btn-menu") as HTMLElement;
    if(element?.classList.contains("has-inner")) {
      inner.classList.add("active");
    }

    const {clientX, clientY} = e;
    const innerButton = this.element.querySelector(".btn-menu-item.has-inner");
    const innerRect = this.element.querySelector(".inner.active")?.getBoundingClientRect();
    if(innerButton && innerRect
      && this.isOutOfRange(clientX, clientY, innerButton.getBoundingClientRect())
      && this.isOutOfRange(clientX, clientY, innerRect)) {
      // console.log(innerButton.getBoundingClientRect());
      inner.classList.remove("active");
    }

    const rect = this.element.getBoundingClientRect();
    const fullRect = innerRect == null ? rect : {
      top: Math.min(rect.top, innerRect.top),
      bottom: Math.max(rect.bottom, innerRect.bottom),
      right: Math.max(rect.right, innerRect.right),
      left: Math.min(rect.left, innerRect.left)
    };

    if(this.isOutOfRange(clientX, clientY, fullRect)) {
      this.close();
      // openedMenu.parentElement.click();
    }
    // console.log('mousemove', diffX, diffY);
  };

  public close() {
    if(this.element) {
      this.element.classList.remove('active');
      this.element.parentElement.classList.remove('menu-open');

      if(this.element.classList.contains('night')) {
        const element = this.element;
        setTimeout(() => {
          if(element.classList.contains('active')) {
            return;
          }

          element.classList.remove('night');
        }, 400);
      }
    }

    super.close();

    if(!IS_TOUCH_SUPPORTED) {
      window.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  public openBtnMenu(element: HTMLElement, onClose?: () => void) {
    if(overlayCounter.isDarkOverlayActive) {
      element.classList.add('night');
    }

    super.open(element);

    this.element.classList.add('active', 'was-open');
    this.element.parentElement.classList.add('menu-open');

    if(onClose) {
      this.addEventListener('toggle', onClose, {once: true});
    }

    if(!IS_TOUCH_SUPPORTED) {
      window.addEventListener('mousemove', this.onMouseMove);
    }
  }
}

const contextMenuController = new ContextMenuController();
export default contextMenuController;
