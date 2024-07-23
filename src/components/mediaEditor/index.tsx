import './mediaEdtior.scss';

import PopupElement from '../popups';
import {IconTsx} from '../iconTsx';
import {Tabs} from '../sidebarRight/tabs/boosts';
import {createEffect, createSignal, For, JSX, onCleanup, onMount, splitProps} from 'solid-js';
import {MediaEditorSelector} from './mediaEditorSelector/mediaEditorSelector';
import {i18n, LangPackKey} from '../../lib/langPack';
import Scrollable from '../scrollable';
import classNames from '../../helpers/string/classNames';
import ColorPicker from '../colorPicker';
import ripple from '../ripple';
import {brushItems, BrushSelector} from './brushItems';
import StickersTab from './stickers/Stickers';
import rootScope from '../../lib/rootScope';
import {EmoticonsDropdown} from '../emoticonsDropdown';
import {PaintingInfo, PaintingLayer} from './brushItems';

class Editor {
  workSpaceEditorElement: HTMLElement;
  editorElement: HTMLElement;
  mediaObjectUrl: string;
  image: HTMLImageElement;
  initialWidth: number;
  initialHeight: number;
  resizeObserver: ResizeObserver;
  paintingLayer: PaintingLayer;
  paintingLayerCanvas: HTMLCanvasElement;
  paintingInfo: { size: number, color: string} = {
    size: 20,
    color: '#ffffff'
  }

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

  public init(url: string) {
    this.mediaObjectUrl = url;
    this.workSpaceEditorElement = document.createElement('div');
    this.workSpaceEditorElement.style.maxWidth = '100%';
    this.workSpaceEditorElement.style.maxHeight = '100%';
    this.workSpaceEditorElement.style.position = 'absolute';

    this.editorElement.append(this.workSpaceEditorElement);

    this.image = document.createElement('img');
    this.image.src = url;

    return new Promise((resolve) => {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });

      this.image.onload = () => {
        this.image.style.position = 'absolute';
        this.image.style.left = '0px';
        this.image.style.top = '0px';

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
        this.workSpaceEditorElement.append(this.image);
        this.resize();
        resolve(this.workSpaceEditorElement);
      }
    })
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
      renderedElement: this.image
    });
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
    context.drawImage(this.image, 0, 0, this.initialWidth, this.initialHeight);
    context.drawImage(this.paintingLayerCanvas, 0, 0, this.initialWidth, this.initialHeight);

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

const StickersController = () => {
  let ref: HTMLDivElement;
  const tab = new StickersTab(rootScope.managers);
  onMount(() => {
    tab.emoticonsDropdown = new EmoticonsDropdown({
      customParentElement: ref
    })
    tab.init()
    tab.onOpened();
    tab.content.style.height = '800px';
  })

  return (
    <div ref={ref} id={'element'} style={{'height': '100%', 'position': 'relative', 'overflow': 'hidden'}}>
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
    min: 0,
    max: 100,
    default: 50,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'contrast',
    min: 0,
    max: 100,
    default: 50,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'saturation',
    min: 0,
    max: 100,
    default: 50,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'warmth',
    min: 0,
    max: 100,
    default: 50,
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
    min: 0,
    max: 100,
    default: 50,
    fillFromMiddle: true,
    step: 1
  },
  {
    value: 'shadows',
    min: 0,
    max: 100,
    default: 50,
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

export const EffectsController = () => {
  const [effects, setEffects] = createSignal<MediaEditorEffects>(getDefaultEffects());

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
            step={0.01}
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
    active: false
  },
  {
    value: 'typewriter',
    active: false
  },
  {
    value: 'avenirNext',
    active: false
  },
  {
    value: 'courierNew',
    active: false
  },
  {
    value: 'noteworthy',
    active: false
  },
  {
    value: 'georgia',
    active: false
  },
  {
    value: 'papyrus',
    active: false
  },
  {
    value: 'snellRoundhand',
    active: false
  }
]

const alignItems = [
  {
    value: 'left',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: 'center',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: 'right',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  }
]

const fontDecoration = [
  {
    value: 'color',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: 'border',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: 'background',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  }
]

export const TextController = ({
  getRenderPicker
}: {
  getRenderPicker: () => boolean
}) => {
  const [effects, setEffects] = createSignal<MediaEditorEffects>(getDefaultEffects());
  const {getColor, setColor, getIsColorPickerActive, setIsColorPickerActive} = useColorPicker();
  const [getSize, setSize] = createSignal(24);
  const {getItems: getFontsItems, setTarget} = useListTarget(fonts);
  const {getItems: getAlignItems, setTarget: setTargetAlignItem} = useListTarget(alignItems);
  const {getItems: getFontDecoration, setTarget: setTargetFontDecoration} = useListTarget(fontDecoration);

  return (
    <SimpleScrollableYTsx class={'media-editor-container-toolbar-section media-editor-container-toolbar-effects'}>
      {getRenderPicker() && <MediaEditorColorPicker
        getColor={getColor}
        onSetColor={setColor}
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
          <For each={getFontDecoration()}>
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
          getValue={getSize}
          setValue={setSize}
          min={12}
          max={72}
          fillFromMiddle={false}
          step={2}
          getColor={getColor}
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
              onClick={() => setTarget(item.value)}
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

class Draggable {
  isDragging: boolean;
  target: HTMLElement;

  constructor(traget: ) {

  }

  function startDragging() {
    this.isDragging = true;
  }

  function dragging() {
    this.isDragging = true;
  }
}

const aspectRatioItems = [
  {
    value: 'free',
    icon: () => <IconTsx icon={'tools'}/>,
    active: false
  },
  {
    value: 'original',
    icon: () => <IconTsx icon={'tools'}/>,
    active: false
  },
  {
    value: 'square',
    icon: () => <IconTsx icon={'tools'}/>,
    active: false
  },
  {
    value: '3x2',
    icon: () => <IconTsx icon={'tools'}/>,
    active: false
  },
  {
    value: '2x3',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'tools'}/>,
    active: false
  },
  {
    value: '4x3',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: '3x4',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'tools'} />,
    active: false
  },
  {
    value: '5x4',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: '4x5',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'tools'} />,
    active: false
  },
  {
    value: '7x5',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: '5x7',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'tools'} />,
    active: false
  },
  {
    value: '16x9',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: '9x16',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'tools'} />,
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
  })

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

export const MediaEditor = ({
  close,
  url
}: {
  close: (blob?: Blob) => void,
  url: string
}) => {
  const {getColor, setColor, getIsColorPickerActive, setIsColorPickerActive, getBrash, setBrash, setBrashSize, getBrashSize} = usePaintController();
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

  const onProcess = async() => {
    const blob = await editor.process();
    close(blob);
  }

  return (
    <div class={'media-editor-container'}>
      <div class={'media-editor-container-workspace'}>
        <div ref={mediaEditorRef} class={'media-editor-container-workspace-editor'}>

        </div>
      </div>
      <div class={'media-editor-container-toolbar'}>
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
              <IconTsx icon={'rotate_left'}/>
            </button>
            <button class={'btn-icon'}>
              <IconTsx icon={'rotate_right'}/>
            </button>
          </div>
        </div>
        <Tabs
          tab={tab}
          onChange={setTab}
          class="media-editor-container-toolbar"
          menu={[
            <IconTsx icon={'tools'} class={'btn-icon'}/>,
            <IconTsx icon={'fullscreen'} class={'btn-icon'}/>,
            <IconTsx icon={'textedit'} class={'btn-icon'}/>,
            <IconTsx icon={'edit'} class={'btn-icon'}/>,
            <IconTsx icon={'smile'} class={'btn-icon'}/>
          ]}
          content={[
            <EffectsController />,
            <ScreenAspectRatioController />,
            <TextController getRenderPicker={() => tab() === 2} />,
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
            <> {tab() === 4 && <StickersController />} </>
          ]}
        />
      </div>
      <button onClick={onProcess} class="btn-circle media-editor-container-done-btn">
        <IconTsx icon={'rotate_right'}/>
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
