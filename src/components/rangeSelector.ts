/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import attachGrabListeners, {GrabEvent} from '../helpers/dom/attachGrabListeners';
import clamp from '../helpers/number/clamp';
import safeAssign from '../helpers/object/safeAssign';
import I18n from '../lib/langPack';

export default class RangeSelector {
  public container: HTMLDivElement;
  protected filled: HTMLDivElement;
  protected seek: HTMLInputElement;

  public mousedown = false;
  protected rect: DOMRect;
  protected _removeListeners: () => void;

  private events: Partial<{
    // onMouseMove: ProgressLine['onMouseMove'],
    onMouseDown: RangeSelector['onMouseDown'],
    onMouseUp: RangeSelector['onMouseUp'],
    onScrub: (value: number) => void
  }> = {};

  protected decimals: number;

  protected step: number;
  protected min: number;
  protected max: number;
  protected withTransition = false;
  protected useTransform = false;
  protected vertical = false;
  protected fillFromPercent = 0;

  constructor(
    options: {
      step: RangeSelector['step'],
      min?: RangeSelector['min'],
      max?: RangeSelector['max'],
      withTransition?: RangeSelector['withTransition'],
      useTransform?: RangeSelector['useTransform'],
      vertical?: RangeSelector['vertical'],
      // supported only with withTransition
      fillFromPercent?: RangeSelector['fillFromPercent']
    },
    value = 0
  ) {
    safeAssign(this, options);

    this.container = document.createElement('div');
    this.container.classList.add('progress-line');

    // there is no sense in using transition with transform, because it is updating every frame
    if(this.useTransform) {
      this.container.classList.add('use-transform');
    } else if(this.withTransition) {
      this.container.classList.add('with-transition');
    }

    this.filled = document.createElement('div');
    this.filled.classList.add('progress-line__filled');

    const seek = this.seek = document.createElement('input');
    seek.classList.add('progress-line__seek');
    seek.type = 'range';
    seek.step = '' + this.step;
    this.setMinMax(this.min, this.max);
    seek.value = '' + value;

    if(value) {
      this.setProgress(value);
    } else if(value == 0) {
      this.setFilled(0);
    }

    const stepStr = '' + this.step;
    const index = stepStr.indexOf('.');
    this.decimals = index === -1 ? 0 : stepStr.length - index - 1;

    this.container.append(this.filled, seek);
  }

  public setMinMax(min?: number, max?: number) {
    this.min = min ?? (this.min ??= 0);
    this.max = max ?? (this.max ??= 0);
    this.seek.min = '' + min;
    this.seek.max = '' + max;
  }

  get value() {
    return +this.seek.value;
  }

  public setHandlers(events: RangeSelector['events']) {
    this.events = events;
  }

  protected onMouseMove = (event: GrabEvent) => {
    this.scrub(event);
  };

  protected onMouseDown = (event: GrabEvent) => {
    this.rect = this.container.getBoundingClientRect();
    this.mousedown = true;
    this.scrub(event);
    this.container.classList.add('is-focused');
    this.events?.onMouseDown && this.events.onMouseDown(event);
  };

  protected onMouseUp = (event: GrabEvent) => {
    this.mousedown = false;
    this.container.classList.remove('is-focused');
    this.events?.onMouseUp && this.events.onMouseUp(event);
  };

  public setListeners() {
    this.seek.addEventListener('input', this.onInput);
    this._removeListeners = attachGrabListeners(this.container, this.onMouseDown, this.onMouseMove, this.onMouseUp);
  }

  public onInput = () => {
    const value = +this.seek.value;
    this.setFilled(value);
    this.events?.onScrub && this.events.onScrub(value);
  };

  public setProgress(value: number) {
    this.setFilled(+this.seek.value); // clamp
    this.seek.value = '' + value;
  }

  public addProgress(value: number) {
    this.seek.value = '' + (+this.seek.value + value);
    this.setFilled(+this.seek.value); // clamp
  }

  public setFilled(value: number) {
    let percents = (value - this.min) / (this.max - this.min);
    percents = clamp(percents, 0, 1);

    // using scaleX and width even with vertical because it will be rotated
    if(this.useTransform) {
      if(this.fillFromPercent) {
        const scale = percents - this.fillFromPercent / 100 || -0.01;

        this.filled.style.left = `${this.fillFromPercent}%`;
        this.container.style.setProperty('--scale-range-selector', '' + scale);
        this.filled.style.scale = `${scale} 1 1`;
      } else {
        this.filled.style.transform = `scaleX(${percents})`;
      }
    } else {
      this.filled.style.width = (percents * 100) + '%';
    }
  }

  protected scrub(event: GrabEvent) {
    const rectMax = this.vertical ? this.rect.height : this.rect.width;
    let offsetAxisValue = clamp(
      this.vertical ?
        -(event.y - this.rect.bottom) :
        event.x - this.rect.left,
      0,
      rectMax
    );

    if(!this.vertical && I18n.isRTL) {
      offsetAxisValue = rectMax - offsetAxisValue;
    }

    let value = this.min + (offsetAxisValue / rectMax * (this.max - this.min));

    if((value - this.min) < ((this.max - this.min) / 2)) {
      value -= this.step / 10;
    }

    value = +value.toFixed(this.decimals);
    value = clamp(value, this.min, this.max);

    // this.seek.value = '' + value;
    // this.onInput();

    this.setProgress(value);
    this.events?.onScrub && this.events.onScrub(value);

    return value;
  }

  public removeListeners() {
    if(this._removeListeners) {
      this._removeListeners();
      this._removeListeners = null;
    }

    this.seek.removeEventListener('input', this.onInput);

    this.events = {};
  }
}
