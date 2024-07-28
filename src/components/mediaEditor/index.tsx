import './mediaEdtior.scss';

import PopupElement from '../popups';
import {IconTsx} from '../iconTsx';
import {Tabs} from '../sidebarRight/tabs/boosts';
import {createEffect, createSignal, For, JSX, JSXElement, onCleanup, onMount, splitProps} from 'solid-js';
import {MediaEditorSelector} from './mediaEditorSelector/mediaEditorSelector';
import {i18n, LangPackKey} from '../../lib/langPack';
import Scrollable from '../scrollable';
import classNames from '../../helpers/string/classNames';
import ColorPicker from '../colorPicker';
import ripple from '../ripple';
import {brushItems, BrushSelector} from './brushItems';
import StickersTab from './stickers/Stickers';
import rootScope from '../../lib/rootScope';
import {EmoticonsDropdown, EMOTICONSSTICKERGROUP} from '../emoticonsDropdown';
import {PaintingInfo, PaintingLayer} from './brushItems';
import {Document} from '../../layer';
import SuperStickerRenderer from '../emoticonsDropdown/tabs/SuperStickerRenderer';
import LazyLoadQueue from '../lazyLoadQueue';
import {applyBrightnessContrast} from './effects/applyBrightnessContrast';
import {applySaturation} from './effects/applySaturation';
import {textRenderer} from './textRenderer';


class Editor {
  workSpaceEditorElement: HTMLElement;
  editorElement: HTMLElement;
  textsLayer: TextsLayer;
  mediaObjectUrl: string;
  image: HTMLImageElement;
  effectsCanvas: HTMLCanvasElement;
  initialWidth: number;
  initialHeight: number;
  resizeObserver: ResizeObserver;
  paintingLayer: PaintingLayer;
  paintingLayerCanvas: HTMLCanvasElement;
  paintingInfo: { size: number, color: string} = {
    size: 20,
    color: '#ffffff'
  }
  stickersLayer: StickersLayer
  effects: MediaEditorEffects = getDefaultEffects();

  constructor({
    editorElement
  }: {
    editorElement: HTMLElement
  }) {
    this.editorElement = editorElement;
    this.paintingLayerCanvas = document.createElement('canvas');
  }

  public setMediaObjectUrl(url: string) {
    this.mediaObjectUrl = url;
  }

  private resize = () => {
    const {width: editorElementWidth, height: editorElementHeight} = this.editorElement.getBoundingClientRect();

    const heightPerWidth = this.initialHeight / this.initialWidth;
    const heightPerWidthForContainer = editorElementHeight / editorElementWidth;

    let newHeight: number;
    let newWidth: number;

    if(heightPerWidth == 1) {
      const {width, height} = this.workSpaceEditorElement.getBoundingClientRect();

      if(width < height) {
        newHeight = editorElementWidth;
        newWidth = editorElementWidth;
      } else {
        newHeight = editorElementHeight;
        newWidth = editorElementHeight;
      }
    }

    if(heightPerWidth > heightPerWidthForContainer) {
      newHeight = editorElementHeight;
      newWidth = this.initialWidth * (editorElementHeight / this.initialHeight);
    } else {
      newHeight = this.initialHeight * (editorElementWidth / this.initialWidth);
      newWidth = editorElementWidth;
    }

    this.workSpaceEditorElement.style.width = this.image.style.width = `${newWidth}px`;
    this.workSpaceEditorElement.style.height = this.image.style.height = `${newHeight}px`;

    const {width: workSpaceEditorWidth, height: workSpaceEditorHeight} = this.workSpaceEditorElement.getBoundingClientRect();
    const top = editorElementHeight / 2 - workSpaceEditorHeight / 2;
    const left = editorElementWidth / 2 - workSpaceEditorWidth / 2;

    this.workSpaceEditorElement.style.top = `${top}px`;
    this.workSpaceEditorElement.style.left = `${left}px`;
  }

  public addSticker(sticker: Document.document) {
    this.stickersLayer.addSticker(sticker);
  }

  public addText() {
    this.textsLayer.addTextBlock();
  }

  public init(url: string) {
    this.mediaObjectUrl = url;
    this.workSpaceEditorElement = document.createElement('div');
    this.workSpaceEditorElement.style.maxWidth = '100%';
    this.workSpaceEditorElement.style.maxHeight = '100%';
    this.workSpaceEditorElement.style.position = 'absolute';
    this.workSpaceEditorElement.style.overflow = 'clip';

    this.editorElement.append(this.workSpaceEditorElement);

    this.effectsCanvas = document.createElement('canvas');

    this.image = document.createElement('img');
    this.image.src = url;

    this.stickersLayer = new StickersLayer(this.workSpaceEditorElement);
    this.textsLayer = new TextsLayer(this.workSpaceEditorElement);

    return new Promise((resolve) => {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });

      this.image.onload = () => {
        this.effectsCanvas.style.position = 'relative';
        this.effectsCanvas.style.left = '0px';
        this.effectsCanvas.style.top = '0px';

        this.paintingLayerCanvas.style.position = 'absolute';
        this.paintingLayerCanvas.style.left = this.paintingLayerCanvas.style.left = '0px';
        this.paintingLayerCanvas.style.width = this.paintingLayerCanvas.style.height = '100%';
        this.paintingLayerCanvas.style.background = 'transparent';
        this.paintingLayerCanvas.style.zIndex = '2';
        this.paintingLayerCanvas.height = this.image.height * 2;
        this.paintingLayerCanvas.width = this.image.width * 2;

        this.workSpaceEditorElement.append(this.paintingLayerCanvas);

        this.resizeObserver.observe(this.editorElement);
        this.initialHeight = this.image.height;
        this.initialWidth = this.image.width;
        this.workSpaceEditorElement.append(this.effectsCanvas);

        this.resize();

        this.redrawEffects();
        resolve(this.workSpaceEditorElement);
      }
    })
  }

  public disableTextsLayer() {
    if(!this.textsLayer) {
      return;
    }
    this.textsLayer.disableLayer();
  }

  public enableTextsLayer() {
    if(!this.textsLayer) {
      return;
    }
    this.textsLayer.enableLayer();
  }

  public disableStickersLayer() {
    if(!this.stickersLayer) {
      return;
    }
    this.stickersLayer.disableLayer();
  }

  public enableStickersLayer() {
    if(!this.stickersLayer) {
      return;
    }
    this.stickersLayer.enableLayer();
  }

  public detachPaintingLayer() {
    if(this.paintingLayer) {
      this.paintingLayer.detach();
    }
  }

  public attachPaintingLayer(paintingLayer: PaintingLayer) {
    this.detachPaintingLayer();
    this.paintingLayer = paintingLayer;

    paintingLayer.attach({
      canvas: this.paintingLayerCanvas,
      renderedElement: this.effectsCanvas
    });
  }

  public setEffects(effects: MediaEditorEffects) {
    this.effects = effects;
    this.redrawEffects();
  }

  private redrawEffects() {
    this.effectsCanvas.width = this.image.width;
    this.effectsCanvas.height = this.image.height;
    const ctx = this.effectsCanvas.getContext('2d');
    ctx.drawImage(this.image, 0, 0);
    applyBrightnessContrast(ctx, this.effects.brightness, this.effects.contrast);
    applySaturation(ctx, this.effects.saturation);
  }

  public setPaintingInfo({size, color}: PaintingInfo) {
    this.paintingInfo.size = size || this.paintingInfo.size;
    this.paintingInfo.color = color || this.paintingInfo.color;

    if(this.paintingLayer) {
      this.paintingLayer.setPaintingInfo({size, color});
    }
  }

  public destroy() {
    this.resizeObserver.disconnect();
  }

  public async process(): Promise<Blob> {
    this.detachPaintingLayer()

    const canvas = document.createElement('canvas');
    canvas.width = this.initialWidth;
    canvas.height = this.initialHeight;

    const context = canvas.getContext('2d');
    context.drawImage(this.effectsCanvas, 0, 0, this.initialWidth, this.initialHeight);
    context.drawImage(this.paintingLayerCanvas, 0, 0, this.initialWidth, this.initialHeight);

    this.stickersLayer.proccess(canvas);
    await this.textsLayer.proccess(canvas);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1);
    })
  }
}

export const SimpleScrollableYTsx = (props: {
  children: JSX.Element,
  onScrolledBottom?: () => void,
  onScrolledTop?: () => void,
} & JSX.HTMLAttributes<HTMLDivElement>) => {
  const [, rest] = splitProps(props, ['onScrolledBottom', 'onScrolledTop']);
  let container: HTMLDivElement;
  let resizeObserver: ResizeObserver;
  const ret = (
    <div ref={container} {...rest}>
      {props.children}
    </div>
  );

  const scrollable = new Scrollable(undefined, undefined, undefined, undefined, container);
  scrollable.onScrolledBottom = props.onScrolledBottom;
  scrollable.onScrolledTop = props.onScrolledTop;

  onMount(() => {
    if(container.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        container.style.height = getComputedStyle(container.parentElement).height;
      });

      resizeObserver.observe(container.parentElement);
    }
  })

  onCleanup(() => {
    scrollable.destroy();

    if(resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  return ret;
};

const MediaEditorRangeItem = ({
  name,
  getValue,
  setValue,
  step,
  min,
  max,
  fillFromMiddle,
  getColor
}: {
  name: string,
  getValue: () => number,
  setValue: (value: number) => void,
  step: number,
  min: number,
  max: number,
  fillFromMiddle?: boolean,
  getColor?: () => string
}) => {
  const initialValue = getValue();
  const selector = new MediaEditorSelector(
    `MediaEditorRangeItem${name[0].toUpperCase() + name.slice(1)}` as LangPackKey,
    step,
    getValue() as number,
    min,
    max,
    true,
    fillFromMiddle ? 50 : 0
  );
  selector.onChange = setValue;

  createEffect(() => {
    selector.setProgress(getValue());
  });

  createEffect(() => {
    if(getColor) {
      selector.container.style.setProperty('--primary-color', getColor())
    }
  })

  return (
    <div class={classNames(initialValue !== getValue() && 'media-editor-range-item-active')}>
      {selector.container}
    </div>
  )
}

export const useListTarget = (items: Array<any>) => {
  const [getItems, setItems] = createSignal(items);
  const [getTarget, setTarget] = createSignal('');

  createEffect(() => {
    const target = getTarget();

    if(target) {
      const index = items.findIndex(({value}) => {
        return value.toLowerCase() === target.toLowerCase();
      })

      if(index > -1) {
        const newBrushItems = [...items];
        newBrushItems[index] = {...items[index], active: true};
        setItems(newBrushItems);
      }
    }
  })

  return {getItems, setItems, setTarget, getTarget};
}

const colors = ['#FFFFFF', '#FE4438', '#FF8901', '#FFD60A', '#33C759', '#62E5E0', '#0A84FF', '#BD5CF3'];

export const MediaEditorColorPicker = ({
  getColor,
  onSetColor,
  getIsColorPickerActive,
  setIsColorPickerActive
}: {
  getColor?: () => string,
  onSetColor?: (color: string) => void,
  getIsColorPickerActive?: () => boolean,
  setIsColorPickerActive?: (active: boolean) => void,
}) => {
  const colorPicker = new ColorPicker();
  const slider = colorPicker.container.querySelector('.color-picker-sliders');
  const box = colorPicker.container.querySelector('.color-picker-box');
  const inputs = colorPicker.container.querySelector('.color-picker-inputs');

  const colorsDiv = document.createElement('div');
  colorsDiv.classList.add('media-editor-color-picker-color-btns');
  for(const color of colors) {
    const colorBtn = document.createElement('button');
    colorsDiv.append(colorBtn);
    colorBtn.classList.add('media-editor-color-picker-color-btn');
    colorBtn.style.backgroundColor = color;
    colorBtn.onclick = () => {
      onSetColor(color);
    }
    ripple(colorBtn);
  }
  colorsDiv.classList.add('hide');
  colorPicker.container.append(colorsDiv);

  const activeBtnColor = (color: string) => {
    const activeBtn = colorsDiv.querySelector('.active');

    if(activeBtn) {
      activeBtn.classList.remove('active');
    }

    const index = colors.indexOf(color.toUpperCase());

    if(index > -1) {
      colorsDiv.children[index].classList.add('active');
    }
  };

  const image = document.createElement('img');
  image.src = '/assets/img/rainbow_round.png';
  image.classList.add('media-editor-color-picker-color-btn-color-picker-img');

  const colorBtn = document.createElement('button');

  const openColorPicker = () => {
    colorBtn.classList.add('active');
    colorsDiv.classList.add('hide');
    slider.classList.remove('hide');
    inputs.classList.remove('hide');
    box.classList.remove('hide');
    colorPicker.container.style.height = 'unset';
  };

  const openColorsButtons = () => {
    colorBtn.classList.remove('active');
    colorsDiv.classList.remove('hide');
    slider.classList.add('hide');
    inputs.classList.add('hide');
    box.classList.add('hide');
    colorPicker.container.style.height = '24px';
  }

  colorBtn.onclick = () => {
    if(getIsColorPickerActive()) {
      setIsColorPickerActive(false);
      return;
    }

    setIsColorPickerActive(true);
  }
  colorBtn.classList.add('media-editor-color-picker-color-btn-color-picker');
  colorBtn.append(image);
  ripple(colorBtn);
  colorPicker.container.append(colorBtn);

  colorPicker.container.querySelector('.color-picker > svg').setAttribute('viewBox', '');
  colorPicker.container.querySelector('.color-picker-sliders > svg').setAttribute('viewBox', '');

  createEffect(() => {
    if(getIsColorPickerActive()) {
      colorPicker.setColor(getColor());
    }

    activeBtnColor(getColor());
  });

  createEffect(() => {
    if(getIsColorPickerActive()) {
      openColorPicker();
    } else {
      openColorsButtons();
    }
  })

  onMount(() => {
    colorPicker.onChange = ({hex}) => onSetColor(hex);
  });

  return (
    <div class={'media-editor-color-picker'}>
      {colorPicker.container}
    </div>
  )
}

const useColorPicker = () => {
  const [getColor, setColor] = createSignal<string>(colors[0]);
  const [getIsColorPickerActive, setIsColorPickerActive] = createSignal<boolean>(false);

  return {
    getColor,
    setColor,
    getIsColorPickerActive,
    setIsColorPickerActive
  }
}

const StickersController = ({
  setSticker
}: {
  setSticker?: (sticker: Document.document) => any
}) => {
  let ref: HTMLDivElement;
  const tab = new StickersTab({
    managers: rootScope.managers,
    onStickerClick: setSticker
  });
  onMount(() => {
    tab.emoticonsDropdown = new EmoticonsDropdown({
      customParentElement: ref
    })
    tab.init()
    tab.onOpened();
    tab.content.style.height = '800px';
  })

  return (
    <div ref={ref} class='media-editor-stickers' style={{'height': '100%', 'position': 'relative', 'overflow': 'hidden'}}>
      {tab.container}
    </div>
  )
}

interface MediaEditorEffects {
  enhance: number,
  brightness: number,
  contrast: number,
  saturation: number,
  warmth: number,
  fade: number,
  highlights: number,
  shadows: number,
  vignette: number,
  grain: number,
  sharpen: number
}

interface EffectDefault {
  value: keyof MediaEditorEffects,
  max: number,
  min: number,
  default: number,
  fillFromMiddle: boolean,
  step: number,
}
const effectsDefault: EffectDefault[] = [
  {
    value: 'enhance',
    min: 0,
    max: 100,
    default: 0,
    fillFromMiddle: false,
    step: 1
  },
  {
    value: 'brightness',
    min: -100,
    max: 100,
    default: 0,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'contrast',
    min: -100,
    max: 100,
    default: 0,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'saturation',
    min: -100,
    max: 100,
    default: 0,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'warmth',
    min: -100,
    max: 100,
    default: 0,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'fade',
    min: 0,
    max: 100,
    default: 0,
    fillFromMiddle: false,
    step: 1
  },
  {
    value: 'highlights',
    min: -100,
    max: 100,
    default: 0,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'shadows',
    min: -100,
    max: 100,
    default: 0,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'vignette',
    min: 0,
    max: 100,
    default: 0,
    fillFromMiddle: false,
    step: 1
  },
  {
    value: 'grain',
    min: 0,
    max: 100,
    default: 0,
    fillFromMiddle: false,
    step: 1
  },
  {
    value: 'sharpen',
    min: 0,
    max: 100,
    default: 0,
    fillFromMiddle: false,
    step: 1
  }
];

const getDefaultEffects = () => {
  return effectsDefault.reduce((prev, current) => {
    return {
      ...prev,
      [current.value]: current.default
    }
  }, {}) as MediaEditorEffects;
}

export const EffectsController = ({onEffectsUpdated}: { onEffectsUpdated: (eff: MediaEditorEffects) => void }) => {
  const [effects, setEffects] = createSignal<MediaEditorEffects>(getDefaultEffects());

  createEffect(() => {
    onEffectsUpdated(effects());
  })

  return (
    <SimpleScrollableYTsx class={'media-editor-container-toolbar-section media-editor-container-toolbar-effects'}>
      <For each={effectsDefault}>
        {(item, index) => (
          <MediaEditorRangeItem
            name={item.value}
            getValue={() => effects()[item.value]}
            setValue={(value) => {
              setEffects((prev) => {
                return {
                  ...prev,
                  [item.value]: value
                }
              })
            }}
            min={item.min}
            max={item.max}
            step={1}
            fillFromMiddle={item.fillFromMiddle}
          />
        )}
      </For>
    </SimpleScrollableYTsx>
  )
}

const usePaintController = () => {
  const [getBrash, setBrash] = createSignal(brushItems[0].value);
  const [getBrashSize, setBrashSize] = createSignal<number>(20);
  const {getColor, setColor, getIsColorPickerActive, setIsColorPickerActive} = useColorPicker();

  return {
    getColor,
    setColor,
    getIsColorPickerActive,
    setIsColorPickerActive,
    getBrash,
    setBrash,
    getBrashSize,
    setBrashSize
  }
}

export const PaintController = ({
  getRenderPicker,
  getColor,
  setColor,
  getIsColorPickerActive,
  setIsColorPickerActive,
  getBrash,
  setBrash,
  getBrashSize,
  setBrashSize
} : {
  getRenderPicker:() => boolean,
  getColor: () => string,
  setColor: (color: string) => void,
  getIsColorPickerActive: () => boolean,
  setIsColorPickerActive: (isActive: boolean) => void,
  getBrash: () => string,
  setBrash: (color: string) => void,
  getBrashSize: () => number,
  setBrashSize: (size: number) => void,
}) => {
  return (
    <SimpleScrollableYTsx class={'media-editor-container-toolbar-section media-editor-container-toolbar-effects'}>
      {getRenderPicker() && <MediaEditorColorPicker
        getColor={getColor}
        onSetColor={setColor}
        getIsColorPickerActive={getIsColorPickerActive}
        setIsColorPickerActive={setIsColorPickerActive}
      />}
      <div class={'media-editor-container-size-range'}>
        <MediaEditorRangeItem
          name={'size'}
          getValue={getBrashSize}
          setValue={setBrashSize}
          min={12}
          max={72}
          fillFromMiddle={false}
          step={2}
          getColor={getColor}
        />
      </div>
      <BrushSelector setBrash={setBrash} getBrash={getBrash} />
    </SimpleScrollableYTsx>
  )
}

const fonts = [
  {
    value: 'roboto',
    font: 'roboto',
    active: false
  },
  {
    value: 'typewriter',
    font: 'type writer',
    active: false
  },
  {
    value: 'avenirNext',
    font: 'avenir next',
    active: false
  },
  {
    value: 'couriernew',
    font: 'courier new',
    active: false
  },
  {
    value: 'noteworthy',
    font: 'noteworthy',
    active: false
  },
  {
    value: 'georgia',
    font: 'georgia',
    active: false
  },
  {
    value: 'papyrus',
    font: 'papyrus',
    active: false
  },
  {
    value: 'snellRoundhand',
    font: 'snell roundhand',
    active: false
  }
]

const alignItems = [
  {
    value: 'left',
    icon: () => <IconTsx style={{'font-size': '22px'}} icon={'align_left'} />,
    active: false
  },
  {
    value: 'center',
    icon: () => <IconTsx style={{'font-size': '22px'}} icon={'align_centre'} />,
    active: false
  },
  {
    value: 'right',
    icon: () => <IconTsx style={{'font-size': '22px'}} icon={'align_right'} />,
    active: false
  }
]

const fontDecoration = [
  {
    value: 'filled',
    icon: () => <IconTsx icon={'text_fill_color'} />,
    active: false
  },
  {
    value: 'stroke',
    icon: () => <IconTsx icon={'text_border_color'} />,
    active: false
  },
  {
    value: 'highlight',
    icon: () => <IconTsx icon={'text_background_color'} />,
    active: false
  }
]

export const TextController = ({
  getRenderPicker,
  getColorPickerColor,
  setColorPickerColor,
  getIsColorPickerActive,
  setIsColorPickerActive,
  getFontSize, setFontSize,
  getFontsItems,
  setTargetFontItem,
  getAlignItems,
  setTargetAlignItem,
  getFontDecorationItems, setTargetFontDecoration
}: {
  getRenderPicker: () => boolean
  getColorPickerColor: () => string,
  setColorPickerColor: (color: string) => void,
  getIsColorPickerActive: () => boolean,
  setIsColorPickerActive: (color: boolean) => void,
  getFontSize: () => number,
  setFontSize: (size: number) => void,
  getFontsItems: () => Array<{ value: string, active: boolean }>,
  setTargetFontItem: (value: string) => void,
  getAlignItems: () => Array<{ value: string, active: boolean, icon: () => JSXElement }>,
  setTargetAlignItem: (value: string) => void
  getFontDecorationItems: () => Array<{ value: string, active: boolean, icon: () => JSXElement }>,
  setTargetFontDecoration: (decoration: string) => void
}) => {
  // const {getColor, setColor, getIsColorPickerActive, setIsColorPickerActive} = useColorPicker();
  // const [getSize, setSize] = createSignal(24);
  // const {getItems: getFontsItems, setTarget} = useListTarget(fonts);
  // const {getItems: getAlignItems, setTarget: setTargetAlignItem} = useListTarget(alignItems);
  // const {getItems: getFontDecoration, setTarget: setTargetFontDecoration} = useListTarget(fontDecoration);

  return (
    <SimpleScrollableYTsx
      class={'media-editor-container-toolbar-section media-editor-container-toolbar-effects'}
    >
      {getRenderPicker() && <MediaEditorColorPicker
        getColor={getColorPickerColor}
        onSetColor={setColorPickerColor}
        getIsColorPickerActive={getIsColorPickerActive}
        setIsColorPickerActive={setIsColorPickerActive}
      />}
      <div class={'media-editor-text-controls'}>
        <div class={'media-editor-row-list'}>
          <For each={getAlignItems()}>
            {(item) => (
              <div
                class={classNames('media-editor-row-list-item', item.active && 'active')}
                onClick={() => setTargetAlignItem(item.value)}
              >
                <div class={'media-editor-row-list-item-icon'}>
                  <item.icon/>
                </div>
              </div>
            )}
          </For>
        </div>
        <div class={'media-editor-row-list'}>
          <For each={getFontDecorationItems()}>
            {(item) => (
              <div
                class={classNames('media-editor-row-list-item', item.active && 'active')}
                onClick={() => setTargetFontDecoration(item.value)}
              >
                <div class={'media-editor-row-list-item-icon'}>
                  <item.icon/>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class={'media-editor-container-size-range'}>
        <MediaEditorRangeItem
          name={'size'}
          getValue={getFontSize}
          setValue={setFontSize}
          min={12}
          max={72}
          fillFromMiddle={false}
          step={2}
          getColor={getColorPickerColor}
        />
      </div>
      <div class={'media-editor-list'}>
        <div class={'media-editor-header'}>
          {i18n('Edit')}
        </div>
        <For each={getFontsItems()}>
          {(item) => (
            <div
              class={classNames('media-editor-list-item', item.active && 'active')}
              onClick={() => setTargetFontItem(item.value)}
            >
              <span class={'media-editor-list-item-text'}>
                {item.value}
              </span>
            </div>
          )}
        </For>
      </div>
    </SimpleScrollableYTsx>
  )
}

// class Draggable {
//   isDragging: boolean;
//   target: HTMLElement;

//   constructor(traget: ) {

//   }

//   function startDragging() {
//     this.isDragging = true;
//   }

//   function dragging() {
//     this.isDragging = true;
//   }
// }

const aspectRatioItems = [
  {
    value: 'free',
    icon: () => <IconTsx icon={'aspect_ratio_free'}/>,
    active: false
  },
  {
    value: 'original',
    icon: () => <IconTsx icon={'aspect_ratio_original'}/>,
    active: false
  },
  {
    value: 'square',
    icon: () => <IconTsx icon={'aspect_ratio_square'}/>,
    active: false
  },
  {
    value: '3x2',
    icon: () => <IconTsx icon={'aspect_ratio_3x2'}/>,
    active: false
  },
  {
    value: '2x3',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'aspect_ratio_3x2'}/>,
    active: false
  },
  {
    value: '4x3',
    icon: () => <IconTsx icon={'aspect_ratio_4x3'} />,
    active: false
  },
  {
    value: '3x4',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'aspect_ratio_4x3'} />,
    active: false
  },
  {
    value: '5x4',
    icon: () => <IconTsx icon={'aspect_ratio_5x4'} />,
    active: false
  },
  {
    value: '4x5',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'aspect_ratio_5x4'} />,
    active: false
  },
  {
    value: '7x5',
    icon: () => <IconTsx icon={'aspect_ratio_7x5'} />,
    active: false
  },
  {
    value: '5x7',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'aspect_ratio_7x5'} />,
    active: false
  },
  {
    value: '16x9',
    icon: () => <IconTsx icon={'aspect_ratio_16x9'} />,
    active: false
  },
  {
    value: '9x16',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'aspect_ratio_16x9'} />,
    active: false
  }
];

const ScreenAspectRatioController = () => {
  const [getAspectRatioItems, setAspectRatioItems] = createSignal(aspectRatioItems);
  const [getTarget, setTarget] = createSignal('');

  createEffect(() => {
    const target = getTarget();

    if(target) {
      const index = aspectRatioItems.findIndex(({value}) => {
        return value.toLowerCase() === target.toLowerCase();
      })

      if(index > -1) {
        const newBrushItems = [...aspectRatioItems];
        newBrushItems[index] = {...aspectRatioItems[index], active: true};
        setAspectRatioItems(newBrushItems);
      }
    }
  });

  return (
    <SimpleScrollableYTsx class={'media-editor-container-toolbar-section media-editor-container-toolbar-effects'}>
      <div class={'media-editor-aspect-ratio-selector'}>
        <div class={'media-editor-header'}>
          {i18n('MediaEditor.tool')}
        </div>
        <For each={getAspectRatioItems().slice(0, 3)}>
          {(item) => (
            <div
              class={classNames('media-editor-aspect-ratio-selector-item', item.active && 'active')}
              onClick={() => setTarget(item.value)}
            >
              <div class={'media-editor-aspect-ratio-selector-item-icon'}>
                <item.icon />
              </div>
              <span class={'media-editor-aspect-ratio-selector-item-text'}>
                {item.value}
              </span>
            </div>
          )}
        </For>
        <div class={'media-editor-aspect-ratio-selector-specific-items'}>
          <For each={getAspectRatioItems().slice(3)}>
            {(item) => (
              <div
                class={classNames('media-editor-aspect-ratio-selector-item', item.active && 'active')}
                onClick={() => setTarget(item.value)}
              >
                <div class={'media-editor-aspect-ratio-selector-item-icon'}>
                  <item.icon />
                </div>
                <span class={'media-editor-aspect-ratio-selector-item-text'}>
                  {item.value}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </SimpleScrollableYTsx>
  )
}

export const ResizerElement = () => {
  return (
    <div class='media-editor-resizable'>
      <div class='resizers'>
        <div class='resizer top-left'></div>
        <div class='resizer top-right'></div>
        <div class='resizer bottom-left'></div>
        <div class='resizer bottom-right'></div>
      </div>
    </div>
  )
}

export class Transformable {
  attachTo: HTMLElement;
  box: HTMLElement;
  boxWrapper: HTMLElement;
  rightMid: HTMLElement;
  leftMid: HTMLElement;
  topMid: HTMLElement;
  bottomMid: HTMLElement;
  leftTop: HTMLElement;
  rightTop: HTMLElement;
  rightBottom: HTMLElement;
  leftBottom: HTMLElement;
  rotateRightTop: HTMLElement;
  rotateLeftTop: HTMLElement;
  rotateRightBottom: HTMLElement;
  rotateLeftBottom: HTMLElement;
  resizableElement: HTMLElement;
  boxContent: HTMLElement;

  currentDegree: number = 0;
  degreeOffset: number = 0;
  degreeCenter = {x: 0, y: 0};

  aspectRatio: number;
  minWidth: number;
  minHeight: number;
  width: number;
  height: number;
  x: number;
  y: number;

  initialWidth: number;
  initialHeight: number;
  initialLeft: number;
  initialTop: number;
  initialMinWidth: number;
  initialMinHeight: number;

  attachToInitialWidth: number;
  attachToInitialHeight: number;

  highlight: HTMLElement;
  highlightBlur: HTMLElement;

  public onChange: (options?: {
    left: number,
    top: number,
    width: number,
    height: number,
    rotation: number,
    containerWidth: number,
    containerHeight: number
  }) => void;

  private initElements() {
    this.box = document.createElement('div');
    this.boxWrapper = document.createElement('div');
    this.boxWrapper.classList.add('media-editor-transformable-wrapper');
    this.box.classList.add('media-editor-transformable-box');
    this.box.style.position = 'absolute';
    this.box.style.zIndex = '20';
    this.box.style.display = 'flex';
    this.boxWrapper.append(this.box);

    this.rightMid = document.createElement('div');
    this.rightMid.classList.add('media-editor-transformable-box-right-mid');
    this.leftMid = document.createElement('div');
    this.leftMid.classList.add('media-editor-transformable-box-left-mid');
    this.topMid = document.createElement('div');
    this.topMid.classList.add('media-editor-transformable-box-top-mid');
    this.bottomMid = document.createElement('div');
    this.bottomMid.classList.add('media-editor-transformable-box-bottom-mid');

    this.leftTop = document.createElement('div');
    this.leftTop.classList.add('media-editor-transformable-box-left-top');
    this.rightTop = document.createElement('div');
    this.rightTop.classList.add('media-editor-transformable-box-right-top');
    this.rightBottom = document.createElement('div');
    this.rightBottom.classList.add('media-editor-transformable-box-right-bottom');
    this.leftBottom = document.createElement('div');
    this.leftBottom.classList.add('media-editor-transformable-box-left-bottom');

    this.rotateRightTop = document.createElement('div');
    this.rotateRightTop.classList.add('media-editor-transformable-box-rotate-right-top');
    this.rotateLeftTop = document.createElement('div');
    this.rotateLeftTop.classList.add('media-editor-transformable-box-rotate-left-top');
    this.rotateRightBottom = document.createElement('div');
    this.rotateRightBottom.classList.add('media-editor-transformable-box-rotate-right-bottom');
    this.rotateLeftBottom = document.createElement('div');
    this.rotateLeftBottom.classList.add('media-editor-transformable-box-rotate-left-bottom');

    this.resizableElement = document.createElement('div');
    this.resizableElement.classList.add('media-editor-transformable-box-resize');

    this.boxContent = document.createElement('div');
    this.boxContent.classList.add('media-editor-transformable-box-content');

    this.box.append(
      this.resizableElement,
      this.rotateRightTop,
      this.rotateLeftTop,
      this.rotateRightBottom,
      this.rotateLeftBottom,
      this.leftTop,
      this.rightTop,
      this.rightBottom,
      this.leftBottom,
      this.boxContent
    );
  }

  public enableHighlight() {
    this.highlightBlur = document.createElement('div');
    this.highlightBlur.style.position = 'absolute';
    this.highlightBlur.style.top = this.highlightBlur.style.left = '0';
    this.highlightBlur.style.width = this.highlightBlur.style.height = '100%';
    this.highlightBlur.style.background = '#D9D9D9';
    this.highlightBlur.style.opacity = '0.3';
    this.highlightBlur.style.pointerEvents = 'none';
    this.highlight = document.createElement('div');
    this.highlight.style.zIndex = '30';
    this.highlight.style.position = 'absolute';
    this.highlight.style.top = this.highlight.style.left = '0';
    this.highlight.style.width = this.highlight.style.height = '100%';
    this.highlight.style.background = 'white';
    this.highlight.style.opacity = '0.3';
    this.highlight.style.pointerEvents = 'none';

    this.attachTo.append(this.highlightBlur);
    this.box.append(this.highlight);
  }

  public disableHighlight() {
    if(!this.highlightBlur) return;

    this.highlightBlur.remove();
    this.highlight.remove();
  }

  public disable() {
    this.resizableElement.style.display = 'none';
    this.leftTop.style.display = 'none';
    this.rightTop.style.display = 'none';
    this.rightBottom.style.display = 'none';
    this.leftBottom.style.display = 'none';
    this.boxWrapper.style.pointerEvents = 'none';
  }

  public enable() {
    this.resizableElement.style.display = 'flex';
    this.leftTop.style.display = 'unset';
    this.rightTop.style.display = 'unset';
    this.rightBottom.style.display = 'unset';
    this.leftBottom.style.display = 'unset';
    this.boxWrapper.style.pointerEvents = 'unset';
  }

  private rotation(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const angle = Math.atan2(event.clientY - this.degreeCenter.y, event.clientX - this.degreeCenter.x) + Math.PI / 2;

    this.currentDegree = angle * 180 / Math.PI - this.degreeOffset;
    this.boxWrapper.style.transform = `rotate(${this.currentDegree}deg)`;

    if(this.onChange) {
      this.onChange(this.getCurrnetTransform());
    }
  }

  public getCurrnetTransform() {
    function getCurrentRotation(el: HTMLElement) {
      var st = window.getComputedStyle(el, null);
      var tm = st.getPropertyValue('-webkit-transform') ||
            st.getPropertyValue('-moz-transform') ||
            st.getPropertyValue('-ms-transform') ||
            st.getPropertyValue('-o-transform') ||
            st.getPropertyValue('transform')
      'none';
      if(tm != 'none') {
        var values = tm.split('(')[1].split(')')[0].split(',');
        var angle = Math.round(Math.atan2(+values[1], +values[0]) * (180 / Math.PI));
        return (angle < 0 ? angle + 360 : angle);
      }
      return 0;
    }
    const attachToBox = this.attachTo.getBoundingClientRect();

    return {
      left: +this.boxWrapper.style.left.replace('px', ''),
      top: +this.boxWrapper.style.top.replace('px', ''),
      width: this.boxContent.clientWidth,
      height: this.boxContent.clientHeight,
      rotation: getCurrentRotation(this.boxWrapper),
      containerWidth: attachToBox.width,
      containerHeight: attachToBox.height
    }
  }

  public init({
    attachTo,
    children,
    options
  }: {
    attachTo: HTMLElement,
    children: HTMLElement,
    offsetX?: number,
    offsetY?: number,
    options?: {
      minWidth: number;
      minHeight: number;
      width: number,
      height: number,
      left: number,
      top: number,
      aspectRatio?: number
    }
  }) {
    const {
      minWidth = 200,
      minHeight = 200,
      width = 200,
      height = 200,
      left = attachTo?.clientLeft + attachTo?.clientWidth / 2,
      top = attachTo?.clientTop + attachTo?.clientHeight / 2,
      aspectRatio
    } = options || {};

    this.aspectRatio = aspectRatio;
    this.minWidth = this.initialMinWidth = minWidth;
    this.minHeight = this.initialMinHeight = minHeight;
    this.initialWidth = width;
    this.initialHeight = height;
    this.initialLeft = left;
    this.initialTop = top;

    this.attachToInitialHeight = attachTo?.getBoundingClientRect().height;
    this.attachToInitialWidth = attachTo?.getBoundingClientRect().width;

    this.initElements();

    let initX: number;
    let initY: number;
    let mousePressX: number;
    let mousePressY: number;
    let initW: number;
    let initH: number;
    let initRotate: number;

    this.attachTo = attachTo;
    this.attachTo.append(this.boxWrapper);
    this.boxContent.append(children);

    const repositionElement = (x: number, y: number, save = true) => {
      this.boxWrapper.style.left = x + 'px';
      this.boxWrapper.style.top = y + 'px';

      if(this.onChange) {
        this.onChange(this.getCurrnetTransform());
      }

      if(save) {
        this.x = x;
        this.y = y;
      }
    }

    const resize = (w: number, h: number, save: boolean = true) => {
      this.box.style.width = (this.aspectRatio ? h * this.aspectRatio : w) + 'px';
      this.box.style.height = h + 'px';

      if(save) {
        this.width = (this.aspectRatio ? h * this.aspectRatio : w);
        this.height = h;
      }

      if(this.onChange) {
        this.onChange(this.getCurrnetTransform());
      }

      this.resizableElement.style.backgroundImage = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='${(this.aspectRatio ? h * this.aspectRatio : w) + 8}' height='${h + 8}' x='2' y='2' fill='none' stroke='hsla(0, 0%, 100%, 0.2)' stroke-width='2' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`;
    }

    function getCurrentRotation(el: HTMLElement) {
      var st = window.getComputedStyle(el, null);
      var tm = st.getPropertyValue('-webkit-transform') ||
            st.getPropertyValue('-moz-transform') ||
            st.getPropertyValue('-ms-transform') ||
            st.getPropertyValue('-o-transform') ||
            st.getPropertyValue('transform')
      'none';
      if(tm != 'none') {
        var values = tm.split('(')[1].split(')')[0].split(',');
        var angle = Math.round(Math.atan2(+values[1], +values[0]) * (180 / Math.PI));
        return (angle < 0 ? angle + 360 : angle);
      }
      return 0;
    }

    this.boxWrapper.addEventListener('mousedown', (event: MouseEvent) => {
      if((event.target as HTMLElement).className.indexOf('dot') > -1) {
        return;
      }

      initX = this.boxWrapper.offsetLeft;
      initY = this.boxWrapper.offsetTop;
      mousePressX = event.x;
      mousePressY = event.y;

      function eventMoveHandler(event: MouseEvent) {
        repositionElement(initX + (event.clientX - mousePressX),
          initY + (event.clientY - mousePressY));
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', eventMoveHandler, false);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', eventMoveHandler, false);
      document.addEventListener('mouseup', onMouseUp, false);
    }, false);

    var rightMid = this.rightMid;
    var leftMid = this.leftMid;
    var topMid = this.topMid;
    var bottomMid = this.bottomMid;

    var leftTop = this.leftTop;
    var rightTop = this.rightTop;
    var rightBottom = this.rightBottom;
    var leftBottom = this.leftBottom;

    const resizeObserver = new ResizeObserver((() => {
      const attachToBox = this.attachTo.getBoundingClientRect();

      const deltaWidth = attachToBox.width / this.attachToInitialWidth;
      const deltaHeight = attachToBox.height / this.attachToInitialHeight;
      this.minHeight = this.initialMinHeight * deltaHeight;
      this.minWidth = this.initialMinWidth * deltaWidth;

      repositionElement(this.x * deltaWidth, this.y * deltaHeight, false)
      resize(this.width * deltaWidth, this.height * deltaHeight, false);
    }).bind(this));
    resizeObserver.observe(this.attachTo);

    const resizeHandler = (event: MouseEvent, left = false, top = false, xResize = false, yResize = false) => {
      initX = (event.target as HTMLElement).offsetLeft;
      initY = (event.target as HTMLElement).offsetTop;
      mousePressX = event.clientX;
      mousePressY = event.clientY;

      initW = this.box.offsetWidth;
      initH = this.box.offsetHeight;

      initRotate = getCurrentRotation(this.boxWrapper);
      var initRadians = initRotate * Math.PI / 180;
      var cosFraction = Math.cos(initRadians);
      var sinFraction = Math.sin(initRadians);
      const eventMoveHandler = (event: MouseEvent) => {
        var hDiff = (event.clientY - mousePressY);
        var wDiff = (event.clientX - mousePressX);

        var rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
        var rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

        var newW = initW, newH = initH, newX = initX, newY = initY;

        if(yResize) {
          if(top) {
            newH = initH - rotatedHDiff;
            if(newH < this.minHeight) {
              newH = this.minHeight;
              rotatedHDiff = initH - this.minHeight;
            }
          } else {
            newH = initH + rotatedHDiff;
            if(newH < this.minHeight) {
              newH = this.minHeight;
              rotatedHDiff = this.minHeight - initH;
            }
          }
          newX -= 0.5 * rotatedHDiff * sinFraction;
          newY += 0.5 * rotatedHDiff * cosFraction;
        }

        if(xResize) {
          if(left) {
            newW = initW - rotatedWDiff;

            if(this.aspectRatio) {
              newW = this.aspectRatio * newH;
              rotatedWDiff = initW - newW;
            } else if(newW < this.minWidth) {
              newW = this.minWidth;
              rotatedWDiff = initW - this.minWidth;
            }
          } else {
            newW = initW + rotatedWDiff;

            if(this.aspectRatio) {
              newW = this.aspectRatio * newH;
              rotatedWDiff = newW - initW;
            } else if(newW < this.minWidth) {
              newW = this.minWidth;
              rotatedWDiff = this.minWidth - initW;
            }
          }
          newX += 0.5 * rotatedWDiff * cosFraction;
          newY += 0.5 * rotatedWDiff * sinFraction;
        }

        resize(newW, newH);
        repositionElement(newX, newY);
      }

      window.addEventListener('mousemove', eventMoveHandler, false);
      window.addEventListener('mouseup', function eventEndHandler() {
        window.removeEventListener('mousemove', eventMoveHandler, false);
        window.removeEventListener('mouseup', eventEndHandler);
      }, false);
    }


    rightMid.addEventListener('mousedown', e => resizeHandler(e, false, false, true, false));
    leftMid.addEventListener('mousedown', e => resizeHandler(e, true, false, true, false));
    topMid.addEventListener('mousedown', e => resizeHandler(e, false, true, false, true));
    bottomMid.addEventListener('mousedown', e => resizeHandler(e, false, false, false, true));
    leftTop.addEventListener('mousedown', e => resizeHandler(e, true, true, true, true));
    rightTop.addEventListener('mousedown', e => resizeHandler(e, false, true, true, true));
    rightBottom.addEventListener('mousedown', e => resizeHandler(e, false, false, true, true));
    leftBottom.addEventListener('mousedown', e => resizeHandler(e, true, false, true, true));

    [this.rotateRightTop, this.rotateLeftBottom, this.rotateRightBottom, this.rotateLeftTop].map((element) => {
      element.addEventListener('mousedown', (event) => {
        event.stopPropagation();

        initX = this.rotateRightTop.offsetLeft;
        initY = this.rotateRightTop.offsetTop;
        mousePressX = event.clientX;
        mousePressY = event.clientY;

        var arrow = this.box;
        var arrowRects = arrow.getBoundingClientRect();
        var arrowX = arrowRects.left + arrowRects.width / 2;
        var arrowY = arrowRects.top + arrowRects.height / 2;

        this.degreeCenter = {x: arrowX, y: arrowY}
        this.degreeOffset = (Math.atan2(event.clientY - this.degreeCenter.y, event.clientX - this.degreeCenter.x) + Math.PI / 2) * 180 / Math.PI - this.currentDegree;

        const rotation = this.rotation.bind(this);

        const eventEndHandler =() => {
          window.removeEventListener('mousemove', rotation, false);
          window.removeEventListener('mouseup', eventEndHandler);
        }

        window.addEventListener('mousemove', rotation, false);
        window.addEventListener('mouseup', eventEndHandler, false);
      }, false);
    })

    resize(this.initialMinWidth, this.initialMinHeight);
    repositionElement(this.initialLeft, this.initialTop);
  }
}

type TextBlokState = {
  size: number,
  color: string,
  type: 'stroke' | 'highlight' | 'filled',
  align: 'left' | 'center' | 'right',
  font: string
}

class TextsLayer {
  appendTo: HTMLElement;
  textBlocks: Array<{
    id: string,
    transformable: Transformable,
    textBlock: HTMLTextAreaElement,
    state: TextBlokState
  }>
  attachTo: HTMLElement;
  target: HTMLElement;
  subscribe: () => void

  targetBlockId: string

  public onTargetBlockSet: (block?: {
    transformable: Transformable,
    textBlock: HTMLTextAreaElement,
    state: TextBlokState
  }) => void

  private getTargetBlock = () => {
    return this.textBlocks.find((block) => this.targetBlockId === block.id)
  }

  public setTargetBlock(id?: string) {
    if(this.getTargetBlock()) {
      this.getTargetBlock().transformable.disableHighlight()
    }

    this.targetBlockId = id;

    if(!this.targetBlockId) {
      return;
    }

    const newTarget = this.textBlocks.find((block) => id === block.id);

    if(!newTarget) {
      return;
    }

    newTarget.transformable.enableHighlight()
    if(this.onTargetBlockSet) {
      console.log(newTarget.state);
      this.onTargetBlockSet({
        transformable: newTarget.transformable,
        state: newTarget.state,
        textBlock: newTarget.textBlock
      });
    }
  }

  constructor(attachTo: HTMLElement) {
    this.attachTo = attachTo;
    this.target = document.createElement('div');
    this.target.style.position = 'absolute';
    this.target.style.width = '100%';
    this.target.style.height = '100%';
    this.target.style.zIndex = '15';
    this.textBlocks = [];
    this.attachTo.append(this.target);
    this.disableLayer();
  }

  public setTextBlockStyle({
    size,
    color,
    type,
    align,
    font
  }: {
    size: number,
    color: string,
    type: 'stroke' | 'highlight' | 'filled',
    align: 'left' | 'center' | 'right',
    font: string
  }) {
    const target = this.getTargetBlock();

    if(!target) {
      return;
    }

    const index = this.textBlocks.findIndex(() => f)

    target.textBlock.style.textAlign = align;
    target.textBlock.style.color = color;
    target.textBlock.style.fontSize = `${size}px`;
    target.textBlock.style.fontFamily = font;
  }

  public addTextBlock() {
    const textBlock = document.createElement('textarea');
    textBlock.style.minWidth = '100%';
    textBlock.style.minHeight = '100%';
    textBlock.style.zIndex = '10';
    textBlock.classList.add('media-editor-textblock');
    textBlock.oninput = (e) => e.stopPropagation();
    const state: TextBlokState = {
      size: 20,
      color: '#FFFFFF',
      type: 'filled',
      align: 'center',
      font: 'Roboto'
    }

    const transformable = new Transformable();
    transformable.init({
      attachTo: this.target,
      children: textBlock,
      options: {
        minHeight: 40,
        minWidth: 200,
        width: 40,
        height: 20,
        left: this.target?.clientLeft + this.target?.clientWidth / 2,
        top: this.target?.clientTop + this.target?.clientHeight / 2
      }
    });
    transformable.boxContent.style.padding = '8px'

    const id = '#' + Date.now();
    this.textBlocks.push({
      id: id,
      textBlock,
      transformable,
      state
    });

    this.subscribe = () => {
      this.setTargetBlock();
      window.removeEventListener('mousedown', this.subscribe)
    }

    textBlock.onfocus = () => {
      this.setTargetBlock(id);
      window.addEventListener('mousedown', this.subscribe)
      transformable.attachTo.onmousedown = ((e: MouseEvent) => {
        e.stopPropagation();
      }).bind(this);
    }

    this.setTargetBlock(textBlock.id)
    textBlock.focus();
  }

  public async proccess(canvas: HTMLCanvasElement) {
    if(!this.textBlocks.length) {
      return;
    }

    const context = canvas.getContext('2d');

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const attachToWidth = this.attachTo.getBoundingClientRect().width;
    const attachToHeight = this.attachTo.getBoundingClientRect().height;

    const deltaWidth = canvasWidth / attachToWidth;
    const deltaHeight = canvasHeight / attachToHeight;

    for(const textBlock of this.textBlocks) {
      const {width, height, left, top, rotation} = textBlock.transformable.getCurrnetTransform();

      const textCanvas = document.createElement('canvas');
      textCanvas.width = width;
      textCanvas.height = height;

      textRenderer(textCanvas, textBlock.textBlock.value, {})

      const targetWidth = textCanvas.width * deltaWidth;
      const targetHeight = textCanvas.height * deltaHeight;

      const targetLeft = left * deltaWidth - targetWidth / 2;
      const targetTop = top * deltaHeight - targetHeight / 2;

      context.save();
      context.translate(targetLeft + targetWidth / 2, targetTop + targetHeight / 2);
      context.rotate(rotation * (Math.PI / 180));
      context.translate(- targetLeft - targetWidth / 2, - targetTop - targetHeight / 2);
      context.drawImage(textCanvas, targetLeft, targetTop, targetWidth, targetHeight);
      context.restore();
    }
  }

  private removeEmptyLayers = () => {
    this.textBlocks = this.textBlocks.filter((textBlock) => {
      if(!textBlock.textBlock.value) {
        textBlock.textBlock.remove();
        return false;
      }

      return true;
    })
  }

  public disableLayer() {
    this.textBlocks.forEach(el => el.transformable.disable());
    this.target.style.pointerEvents = 'none';

    if(this.subscribe) {
      this.subscribe();
    }
  }

  public enableLayer() {
    this.removeEmptyLayers();
    this.textBlocks.forEach(el => el.transformable.enable());
    this.target.style.pointerEvents = 'unset';
  }
}

class StickersLayer {
  appendTo: HTMLElement;
  stickers: Array<{
    sticker: Document.document,
    transformable: Transformable,
    stickerEl: HTMLElement
  }>
  attachTo: HTMLElement;
  target: HTMLElement;
  stickerRenderer: SuperStickerRenderer;

  constructor(attachTo: HTMLElement) {
    this.stickers = [];
    this.attachTo = attachTo;
    this.target = document.createElement('div');
    this.target.style.position = 'absolute';
    this.target.style.width = '100%';
    this.target.style.height = '100%';
    this.target.style.zIndex = '20';
    this.attachTo.append(this.target);
    this.stickerRenderer = new SuperStickerRenderer({
      managers: rootScope.managers,
      group: EMOTICONSSTICKERGROUP,
      regularLazyLoadQueue: new LazyLoadQueue(1),
      visibleRenderOptions: {
        width: 250,
        height: 250
      }
    });
    this.disableLayer();
  }

  public addSticker(sticker: Document.document) {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    const transformable = new Transformable();
    transformable.init({
      attachTo: this.target,
      children: container,
      options: {
        minHeight: 200,
        minWidth: 200,
        width: 300,
        height: 300,
        left: this.target?.clientLeft + this.target?.clientWidth / 2,
        top: this.target?.clientTop + this.target?.clientHeight / 2,
        aspectRatio: 1
      }
    });

    const stickerEl = this.stickerRenderer.renderSticker(sticker);
    container.append(stickerEl);

    this.stickers.push({
      sticker: sticker,
      transformable,
      stickerEl
    });
  }

  public proccess(canvas: HTMLCanvasElement) {
    if(!this.stickers.length) {
      return;
    }

    const context = canvas.getContext('2d');

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const attachToWidth = this.attachTo.getBoundingClientRect().width;
    const attachToHeight = this.attachTo.getBoundingClientRect().height;

    const deltaWidth = canvasWidth / attachToWidth;
    const deltaHeight = canvasHeight / attachToHeight;

    this.stickers.forEach((sticker) => {
      const {width, height, left, top, rotation} = sticker.transformable.getCurrnetTransform();
      const img = sticker.stickerEl.querySelector('canvas') || sticker.stickerEl.querySelector('img') as HTMLCanvasElement | HTMLImageElement;

      const targetWidth = width * deltaWidth;
      const targetHeight = height * deltaHeight;

      const targetLeft = left * deltaWidth - targetWidth / 2;
      const targetTop = top * deltaHeight - targetHeight / 2;

      context.save();
      context.translate(targetLeft + targetWidth / 2, targetTop + targetHeight / 2);
      context.rotate(rotation * (Math.PI / 180));
      context.translate(- targetLeft - targetWidth / 2, - targetTop - targetHeight / 2);
      context.drawImage(img, targetLeft, targetTop, targetWidth, targetHeight);
      context.restore();
    })
  }

  public disableLayer() {
    this.stickers.forEach(el => el.transformable.disable());
    this.target.style.pointerEvents = 'none';
  }

  public enableLayer() {
    this.stickers.forEach(el => el.transformable.enable());
    this.target.style.pointerEvents = 'unset';
  }
}

export const MediaEditor = ({
  close,
  url
}: {
  close: (blob?: Blob) => void,
  url: string
}) => {
  const {getColor, setColor, getIsColorPickerActive, setIsColorPickerActive, getBrash, setBrash, setBrashSize, getBrashSize} = usePaintController();

  const {getColor: getColorPickerColor, setColor: setColorPickerColor, getIsColorPickerActive: getIsTextColorPickerActive, setIsColorPickerActive: setIsTextColorPickerActive} = useColorPicker();
  const [getSize, setSize] = createSignal(24);
  const {getItems: getFontsItems, setTarget, getTarget: font} = useListTarget(fonts);
  const {getItems: getAlignItems, setTarget: setTargetAlignItem, getTarget: align} = useListTarget(alignItems);
  const {getItems: getFontDecoration, setTarget: setTargetFontDecoration, getTarget: type} = useListTarget(fontDecoration);

  const [tab, setTab] = createSignal(0);
  let mediaEditorRef: HTMLDivElement;
  let editor: Editor;

  onMount(() => {
    editor = new Editor({editorElement: mediaEditorRef});
    editor.init(url);
  })

  onCleanup(() => {
    editor.destroy();
  })

  const getIsPaintControllerOpen = () => tab() === 3;

  createEffect(() => {
    const brush = brushItems.find(({value}) => value === getBrash())

    if(brush && getIsPaintControllerOpen()) {
      const layer = new brush.Layer() as unknown as PaintingLayer;
      editor.attachPaintingLayer(layer);
      editor.setPaintingInfo({
        color: getColor(),
        size: getBrashSize()
      });
    } else {
      editor.detachPaintingLayer();
    }
  });

  createEffect(() => {
    editor.setPaintingInfo({
      color: getColor(),
      size: getBrashSize()
    })
  })

  createEffect(() => {
    if(tab() === 3 && !editor.textsLayer.onTargetBlockSet) {
      editor.textsLayer.onTargetBlockSet = (state) => {
        const {
          size,
          color,
          type,
          align,
          font
        } = state.state
        setSize(size);
        setColorPickerColor(color);
        setTargetFontDecoration(type);
        setTargetAlignItem(align);
        setTarget(font)
      }
    }
  })

  createEffect(() => {
    if(tab() === 4) {
      editor.enableStickersLayer();
    } else {
      editor.disableStickersLayer();
    }
  })

  createEffect(() => {
    if(tab() === 2) {
      editor.enableTextsLayer();
      editor.addText();
    } else {
      editor.disableTextsLayer();
    }
  });

  createEffect(() => {
    if(!editor.textsLayer) return;

    const f = font()

    editor.textsLayer.setTextBlockStyle({
      font: fonts.find((v) => f === v.font).font,
      size: getSize(),
      color: getColorPickerColor(),
      align: align(),
      type: type()
    } as any)
  })

  const onProcess = async() => {
    const blob = await editor.process();
    close(blob);
  }

  const onAddSticker = (sticker: Document.document) => {
    editor.addSticker(sticker);
  }

  return (
    <div class={'media-editor-container'}>
      <div class={'media-editor-container-workspace'}>
        <div ref={mediaEditorRef} class={'media-editor-container-workspace-editor'}>

        </div>
      </div>
      <div class={'media-editor-container-toolbar'} onMouseDown={(e) => e.stopPropagation()}>
        <div class={'media-editor-container-toolbar-header'}>
          <div class={'media-editor-container-toolbar-header-btn-close'}>
            <button class={'btn-icon'} onClick={() => close()}>
              <IconTsx icon={'close'}/>
            </button>
          </div>
          <div class={'media-editor-container-toolbar-header-title'}>
            {i18n('Edit')}
          </div>
          <div class={'media-editor-container-toolbar-header-nav-btns'}>
            <button class={'btn-icon'}>
              <IconTsx icon={'undo'}/>
            </button>
            <button class={'btn-icon'}>
              <IconTsx icon={'redo'}/>
            </button>
          </div>
        </div>
        <Tabs
          tab={tab}
          onChange={setTab}
          class="media-editor-container-toolbar"
          menu={[
            <IconTsx icon={'ranges'} class={'btn-icon'}/>,
            <IconTsx icon={'crop'} class={'btn-icon'}/>,
            <IconTsx icon={'text'} class={'btn-icon'}/>,
            <IconTsx icon={'brush'} class={'btn-icon'}/>,
            <IconTsx icon={'smile'} class={'btn-icon'}/>
          ]}
          content={[
            <EffectsController onEffectsUpdated={e => editor.setEffects(e)} />,
            <ScreenAspectRatioController />,
            <TextController
              getColorPickerColor={getColorPickerColor}
              setColorPickerColor={setColorPickerColor}
              getFontSize={getSize}
              setFontSize={setSize}
              getIsColorPickerActive={getIsTextColorPickerActive}
              setIsColorPickerActive={setIsTextColorPickerActive}
              getFontsItems={getFontsItems}
              setTargetFontItem={setTarget}
              getAlignItems={getAlignItems}
              setTargetAlignItem={setTargetAlignItem}
              getFontDecorationItems={getFontDecoration}
              setTargetFontDecoration={setTargetFontDecoration}
              getRenderPicker={() => tab() === 2}
            />,
            <PaintController
              getRenderPicker={() => tab() === 3}
              getColor={getColor}
              setColor={setColor}
              getIsColorPickerActive={getIsColorPickerActive}
              setIsColorPickerActive={setIsColorPickerActive}
              getBrash={getBrash}
              setBrash={setBrash}
              getBrashSize={getBrashSize}
              setBrashSize={setBrashSize}
            />,
            <> {tab() === 4 && <StickersController setSticker={onAddSticker} />} </>
          ]}
        />
      </div>
      <button onClick={onProcess} class="btn-circle media-editor-container-done-btn">
        <IconTsx icon={'check'}/>
      </button>
    </div>
  )
}

export const openMediaEditor: (url: string) => Promise<Blob | undefined> = (url) => {
  const mediaEditorPopup = new PopupElement('media-editor-popup', {body: true});

  return new Promise((resolve) => {
    const close = (blob: Blob) => {
      mediaEditorPopup.hide();
      resolve(blob);
    }
    mediaEditorPopup.show();

    mediaEditorPopup.appendSolid(() => <MediaEditor close={close} url={url}/>);
  })
}
