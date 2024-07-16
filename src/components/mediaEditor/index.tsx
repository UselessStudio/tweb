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
import {BrushSelector} from './brushItems';
import StickersTab from './stickers/Stickers';
import rootScope from '../../lib/rootScope';
import {EmoticonsDropdown} from '../emoticonsDropdown';


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

export const PaintController = ({
  getRenderPicker
} : {
  getRenderPicker:() => boolean
}) => {
  const {getColor, setColor, getIsColorPickerActive, setIsColorPickerActive} = useColorPicker();
  const [getSize, setSize] = createSignal(24);

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
          getValue={getSize}
          setValue={setSize}
          min={12}
          max={72}
          fillFromMiddle={false}
          step={2}
          getColor={getColor}
        />
      </div>
      <BrushSelector />
    </SimpleScrollableYTsx>
  )
}

export const TextController = ({
  getRenderPicker
}: {
  getRenderPicker: () => boolean
}) => {
  const [effects, setEffects] = createSignal<MediaEditorEffects>(getDefaultEffects());
  const {getColor, setColor, getIsColorPickerActive, setIsColorPickerActive} = useColorPicker();
  const [getSize, setSize] = createSignal(24);

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
          getValue={getSize}
          setValue={setSize}
          min={12}
          max={72}
          fillFromMiddle={false}
          step={2}
          getColor={getColor}
        />
      </div>
      {getColor()}
    </SimpleScrollableYTsx>
  )
}

const aspectRatioItems = [
  {
    value: 'free',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: 'original',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: 'square',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: '3x2',
    icon: () => <IconTsx icon={'tools'} />,
    active: false
  },
  {
    value: '2x3',
    icon: () => <IconTsx style={{transform: 'rotate(90deg)'}} icon={'tools'} />,
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
    console.log(target);

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
  close
}: {
  close: () => void
}) => {
  const [tab, setTab] = createSignal(0);

  return (
    <div class={'media-editor-container'}>
      <div class={'media-editor-container-workspace'}>
      </div>
      <div class={'media-editor-container-toolbar'}>
        <div class={'media-editor-container-toolbar-header'}>
          <div class={'media-editor-container-toolbar-header-btn-close'}>
            <button class={'btn-icon'} onClick={close}>
              <IconTsx icon={'close'}/>
            </button>
          </div>
          <div class={'media-editor-container-toolbar-header-title'}>
            Edit
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
            <PaintController getRenderPicker={() => tab() === 3} />,
            <StickersController />
          ]}
        />
      </div>
    </div>
  )
}

export const openMediaEditor = () => {
  const mediaEditorPopup = new PopupElement('media-editor-popup', {body: true});

  mediaEditorPopup.show();

  const close = () => {
    mediaEditorPopup.hide();
  }
  mediaEditorPopup.appendSolid(() => <MediaEditor close={close}/>);
}
