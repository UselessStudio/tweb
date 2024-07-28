import RangeSelector from '../../rangeSelector';
import {LangPackKey, _i18n} from '../../../lib/langPack';

export class MediaEditorSelector {
  public container: HTMLDivElement;
  public valueContainer: HTMLElement;
  protected range: RangeSelector;
  protected writeValue: boolean;
  protected valueDiv: HTMLDivElement;

  public onChange: (value: number) => void;

  constructor(
    name: LangPackKey,
    step: number,
    initialValue: number,
    minValue: number,
    maxValue: number,
    writeValue = true,
    fillFromPercent?: number
  ) {
    const BASE_CLASS = 'media-editor-selector';
    this.container = document.createElement('div');
    this.container.classList.add(BASE_CLASS);

    this.writeValue = writeValue;

    const details = document.createElement('div');
    details.classList.add(BASE_CLASS + '-details');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add(BASE_CLASS + '-name');
    _i18n(nameDiv, name);

    const valueDiv = this.valueContainer = document.createElement('div');
    valueDiv.classList.add(BASE_CLASS + '-value');

    if(writeValue) {
      valueDiv.innerHTML = '' + initialValue;
    }

    details.append(nameDiv, valueDiv);
    this.valueDiv = valueDiv;

    this.range = new RangeSelector({
      step,
      min: minValue,
      max: maxValue,
      useTransform: !!fillFromPercent,
      fillFromPercent
    }, initialValue);
    this.range.setListeners();
    this.range.setHandlers({
      onScrub: (value: number) => {
        if(this.onChange) {
          this.onChange(value);
        }

        if(writeValue) {
          // console.log('font size scrub:', value);
          valueDiv.innerText = '' + value;
        }
      }
    });

    this.container.append(details, this.range.container);
  }

  public setProgress(progress: number) {
    this.range.setProgress(progress);

    if(this.writeValue) {
      // console.log('font size scrub:', value);
      this.valueDiv.innerText = '' + progress;
    }
  }
}
