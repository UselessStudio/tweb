export function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');

  const copy = document.createElement('canvas').getContext('2d');
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const l = pixels.data.length;

  let y;

  const bound: any = {top: null, left: null, right: null, bottom: null};

  // for every pixel in there
  for(let i = 0; i < l; i += 4) {
    // if the alpha value isn't ZERO (transparent pixel)
    if(pixels.data[i + 3] !== 0) {
      // find its coordinates
      y = ~~(i / 4 / canvas.width);

      // store/update those coordinates
      // inside our bounding box Object

      if(bound.top === null) {
        bound.top = y;
      }

      // if (bound.left === null) {
      //   bound.left = x;
      // } else if (x < bound.left) {
      //   bound.left = x;
      // }
      //
      // if (bound.right === null) {
      //   bound.right = x;
      // } else if (bound.right < x) {
      //   bound.right = x;
      // }

      if(bound.bottom === null) {
        bound.bottom = y;
      } else if(bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }

  // actual height and width of the text
  // (the zone that is actually filled with pixels)
  const trimHeight = bound.bottom - bound.top;
  const trimWidth = canvas.width; // do not trim horizontally

  // get the zone (trimWidth x trimHeight) as an ImageData
  // (Uint8ClampedArray of pixels) from our canvas
  const trimmed = ctx.getImageData(0, bound.top, trimWidth, trimHeight);

  // Draw back the ImageData into the canvas
  copy.canvas.width = trimWidth;
  copy.canvas.height = trimHeight;
  copy.putImageData(trimmed, 0, 0);

  // return the canvas element
  return copy.canvas;
}

export interface IFont {
  name: string;
  size: number;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IDrawTextResult {
  canvas: HTMLCanvasElement;
  cursor: IPoint;
  lines: string[];
}

export const TextAlign = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right'
};

/**
 * For a given string, returns a new string in which all the separate words (characters divided by a space) fit in the given width. Can add spaces into original words if they are too long.
 * @param {string} text
 * @param {number} availableWidth
 * @param {IFont} font
 * @returns {string}
 */
function splitIntoFittingWords(text: string, availableWidth: number, font: IFont): string {
  const splitResults: any = [];

  text.split(' ').forEach(word => {
    if(getTextWidth(word, font).width < availableWidth) {
      // word fits
      splitResults.push(word);
    } else {
      // word does not fit, split into characters
      groupText(word, '', availableWidth, font).forEach(entry => {
        splitResults.push(entry);
      });
    }
  });

  return splitResults.join(' ');
}

/**
 * Measures the width of a string for a given font.
 * @param {string} text
 * @param {IFont} font
 * @returns {number}
 */
function getTextWidth(text: string, font: IFont): TextMetrics {
  const testContext = document.createElement('canvas').getContext('2d');
  testContext.font = getCanvasFontProperty(font);

  return testContext.measureText(text);
}

/**
 * Groups a given string into fitting parts. What a part is is defined by the character to split the original string on.
 * @param {string} text
 * @param {string} splitOn
 * @param {number} availableWidth
 * @param {IFont} font
 * @returns {string[]}
 */
function groupText(text: string, splitOn: string, availableWidth: number, font: IFont): string[] {
  return text.split(splitOn).reduce((resultingLines, currentItem) => {
    if(resultingLines.length === 0) {
      resultingLines.push('');
    }
    const lastLine = resultingLines[resultingLines.length - 1];

    // test if the last line with the current word would fit
    const testLine = (lastLine.length > 0 ? lastLine + splitOn : lastLine) + currentItem;
    const testLineWidth = getTextWidth(testLine, font).width;
    if(
      testLineWidth > availableWidth &&
      !(resultingLines.length === 1 && resultingLines[0].length === 0)
    ) {
      // does not fit, create new line
      resultingLines.push(currentItem);
    } else {
      // add to current line
      resultingLines[resultingLines.length - 1] = testLine;
    }

    return resultingLines;
  }, []);
}

/**
 * Creates a canvas of the given width and renders the string into it
 * @param {string} text
 * @param {number} width
 * @param {string} fontName
 * @param {number} fontSize
 * @param {number} lineSpacing
 * @param {string} color
 * @param {boolean} strokeText
 * @param {string} align
 * @returns {IDrawTextResult}
 */
export function drawText({
  text,
  width,
  fontName,
  fontSize,
  lineSpacing = 0,
  color = 'white',
  strokeText = false,
  align = 'center'
}:{
  text: string,
  width: number,
  fontName: string,
  fontSize: number,
  lineSpacing?: number,
  color?: string,
  strokeText?: boolean,
  align?: string
}): IDrawTextResult {
  const alignModes = [TextAlign.LEFT, TextAlign.CENTER, TextAlign.RIGHT];
  if(alignModes.indexOf(align) === -1) {
    throw new Error(`Invalid alignMode (possible options: ${alignModes.join(',')})`);
  }

  // for now, just add spacing to fix fonts falling ut of view sometimes (at the bottom specifically)
  // padding will be removed by trimming canvas at the end
  const padding = {x: 20, y: fontSize * 2}; // todo this needs a better fix

  const font = createFont(fontName, fontSize);
  const lines = fitText(text, width - 2 * padding.x, fontName, fontSize);

  // create and init canvas
  const canvas = document.createElement('canvas');
  canvas.width = width; // + 2 * padding.x;
  canvas.height = lines.length * fontSize + (lines.length - 1) * lineSpacing + 2 * padding.y;

  const context = canvas.getContext('2d');
  context.font = getCanvasFontProperty(font);
  context.textAlign = align as CanvasTextAlign;
  context.textBaseline = 'top';
  context.fillStyle = color;
  context.strokeStyle = color;

  // draw lines
  let baseX: number;
  switch(align) {
    case TextAlign.RIGHT: {
      baseX = canvas.width - padding.x;
      break;
    }
    case TextAlign.LEFT: {
      baseX = padding.x;
      break;
    }
    case TextAlign.CENTER: {
      baseX = canvas.width * 0.5;
      break;
    }
  }
  let yOffset = 0;
  let cursor: IPoint = {
    x: canvas.width * 0.5,
    y: yOffset
  };
  lines.forEach(line => {
    if(strokeText) {
      context.strokeText(line, baseX, yOffset);
    } else {
      context.fillText(line, baseX, yOffset);
    }

    cursor = {
      x: canvas.width * 0.5 + 0.5 * getTextWidth(line, font).width,
      y: yOffset
    };

    yOffset += fontSize + lineSpacing;
  });

  return {
    lines,
    cursor,
    canvas: trimCanvas(canvas)
  };
}

/**
 * Breaks up a string into lines that fit within the supplied width.
 * @param {string} text
 * @param {number} width
 * @param {string} fontName
 * @param {number} fontSize
 * @returns {string[]}
 */
export function fitText(text: string, width: number, fontName: string, fontSize: number): string[] {
  const font = createFont(fontName, fontSize);
  const fittingWords = splitIntoFittingWords(text, width, font);

  return groupText(fittingWords, ' ', width, font);
}

/**
 * Formats fontName and fontSize into a css string for canvas.
 * @param {IFont} font
 * @returns {string}
 */
function getCanvasFontProperty(font: IFont): string {
  return `${font.size}px ${font.name}`;
}

/**
 * Create IFont object
 * @param {string} name
 * @param {number} size
 * @returns {IFont}
 */
const createFont = (name: string, size: number) => ({size, name});
