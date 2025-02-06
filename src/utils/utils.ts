import { DrawConfig, Scale } from "../types";
import { PREVIEW_FRAME_WIDTH, SECONDARY_FONT, SMALL_FONT_SIZE, TIMELINE_OFFSET_X } from "./constants";
import { CANVAS_CONSTANTS, DEFAULT_DRAW_CONFIG, formatTime } from "./helpers";

const BASE_URL = 'https://bilibili.github.io/WebAV';
export function assetsPrefix<T extends string[] | Record<string, string>>(
  assetsURL: T,
): T {
  const base =
    window.location.hostname.includes('webcontainer.io') ||
    window.location.hostname.includes('stackblitz.io') ||
    window.location.hostname.includes('csb.app')
      ? BASE_URL
      : '';
  const prefix = process.env.NODE_ENV === 'development' ? '/' : '/WebAV/';
  if (Array.isArray(assetsURL)) {
    return assetsURL.map((url) => `${base}${prefix}${url}`) as T;
  }

  return Object.fromEntries(
    Object.entries(assetsURL).map(([k, v]) => [k, `${base}${prefix}${v}`]),
  ) as T;
}

export async function createFileWriter(
  extName = 'mp4',
): Promise<FileSystemWritableFileStream> {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: `WebAV-export-${Date.now()}.${extName}`,
  });
  return fileHandle.createWritable();
}
export const setupContext = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: DrawConfig,
) => {
  context.clearRect(0, 0, width, height);
  context.save();
  context.strokeStyle = config.textColor;
  context.fillStyle = config.textColor;
  context.lineWidth = config.lineWidth;
  context.font = `${CANVAS_CONSTANTS.SMALL_FONT_SIZE}px ${CANVAS_CONSTANTS.SECONDARY_FONT}`;
  context.textBaseline = "top";
  context.translate(0.5, 0);
  context.beginPath();
};

export const drawText = (
  context: CanvasRenderingContext2D,
  value: number,
  startPos: number,
  offsetX: number,
  textOffsetY: number,
  zoom: number,
  scrollPos: number,
  textFormat: (scale: number) => string,
) => {
 
  const text = textFormat(value);
  const textWidth = context.measureText(text).width;
  const textOffsetX = -textWidth / 2;
  
  context.fillText(text, startPos + textOffsetX + offsetX, textOffsetY);
};

export const drawLine = (
  context: CanvasRenderingContext2D,
  pos: number,
  origin: number,
  lineSize: number,
  isLongLine: boolean,
  config: DrawConfig,
) => {
  context.strokeStyle = isLongLine ? config.longLineColor : config.shortLineColor;
  const [x1, y1] = [pos, origin];
  const [x2, y2] = [x1, y1 + lineSize];

  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
};
export function formatTimelineUnit(units?: number): string {
  if (!units) return "0";
  const time = units / PREVIEW_FRAME_WIDTH;

  const frames = Math.trunc(time) % 60;
  const seconds = Math.trunc(time / 60) % 60;
  const minutes = Math.trunc(time / 3600) % 60;
  const hours = Math.trunc(time / 216000);
  const formattedTime = [
    hours.toString(),
    minutes.toString(),
    seconds.toString(),
    frames.toString()
  ];

  if (time < 60) {
    return `${formattedTime[3].padStart(2, "0")}f`;
  }
  if (time < 3600) {
    return `${formattedTime[2].padStart(1, "0")}s`;
  }
  if (time < 216000) {
    return `${formattedTime[1].padStart(2, "0")}:${formattedTime[2].padStart(2, "0")}`;
  }
  return `${formattedTime[0].padStart(2, "0")}:${formattedTime[1].padStart(2, "0")}:${formattedTime[2].padStart(2, "0")}`;
}
export const draw = (
  context: CanvasRenderingContext2D | null,
  scrollPos: number,
  width: number,
  height: number
) => {
  if (!context) return;
  
  const  longLineSize = 20,
    shortLineSize = 6,
    offsetX = TIMELINE_OFFSET_X,
    textOffsetY = 12, 
    textFormat = formatTimelineUnit;
    
  const initScale: Scale = {
    unit: 180,
    zoom: 1 / 150,
    segments: 3
  };
  const zoom = initScale.zoom;
  const unit = initScale.unit;
  const segments = initScale.segments;
  context!.clearRect(0, 0, width, height);
  context!.save();
  context!.strokeStyle = "#1e1e1e";
  context!.lineWidth = 1.2;
  context!.font = `${SMALL_FONT_SIZE}px ${SECONDARY_FONT}`;
  context!.textBaseline = "top";

  context!.translate(0.5, 0);
  context!.beginPath();

  const zoomUnit = unit * zoom * PREVIEW_FRAME_WIDTH;
  const minRange = Math.floor(scrollPos / zoomUnit);
  const maxRange = Math.ceil((scrollPos + width) / zoomUnit);
  const length = maxRange - minRange;

  // Draw text before drawing the lines
  for (let i = 0; i <= length; ++i) {
    const value = i + minRange;

    if (value < 0) continue;

    const startValue = (value * zoomUnit) / zoom;
    const startPos = (startValue - scrollPos / zoom) * zoom;

    if (startPos < -zoomUnit || startPos >= width + zoomUnit) continue;
    const text = textFormat(startValue);

    
    const textWidth = context!.measureText(text).width;
    const textOffsetX = -textWidth / 2;

   
    context!.fillText(text, startPos + textOffsetX + offsetX, textOffsetY);
  }

 
  for (let i = 0; i <= length; ++i) {
    const value = i + minRange;

    if (value < 0) continue;

    const startValue = value * zoomUnit;
    const startPos = startValue - scrollPos + offsetX;

    for (let j = 0; j < segments; ++j) {
      const pos = startPos + (j / segments) * zoomUnit;

      if (pos < 0 || pos >= width) continue;

      const lineSize = j % segments ? shortLineSize : longLineSize;

      
      if (lineSize === shortLineSize) {
        context!.strokeStyle = "#1e1e1e"; 
      } else {
        context!.strokeStyle = "#3e3e3e"; 
      }

      const origin = 32;

      const [x1, y1] = [pos, origin];
      const [x2, y2] = [x1, y1 + lineSize];

      context!.beginPath(); 
      context!.moveTo(x1, y1);
      context!.lineTo(x2, y2);
      context!.stroke(); 
    }
  }

  context!.restore();
};


const SCALE_GRID_MAP = new Map([
    [100, 100],
    [90, 50],
    [80, 20],
    [70, 10],
    [60, 80],
    [50, 40],
    [40, 20],
    [30, 10],
    [20, 40],
    [10, 25],
    [0, 10]
] );

const TIME_SCALES = {
    FRAME: 70,  
    SECOND: 30,
} as const;

export interface CanvasConfig {
    width: number;
    height: number;
    bgColor: string;
    ratio: number;
    textSize: number;
    textScale: number;
    lineWidth: number;
    textBaseline: CanvasTextBaseline; 
    textAlign: CanvasTextAlign; 
    longColor: string;
    shortColor: string;
    textColor: string;
    subTextColor: string;
    focusColor: string;
    lineColor: string;
}

export interface UserConfig {
    start: number;
    step: number;
    scale: number;
    focusPosition?: { 
        start: number;
        end: number;
        frameCount: number;
    };
}


const getGridSize = (scale: number): number => 
  SCALE_GRID_MAP.get(scale) ?? 100;


export const getGridPixel = (scale: number, frameCount: number): number => {
    const gridPixel = getGridSize(scale);
    if (scale >= TIME_SCALES.FRAME) return gridPixel * frameCount;
    if (scale >= TIME_SCALES.SECOND) return (gridPixel * frameCount) / 30;
    return (gridPixel * frameCount) / 180; // /30/6 combined
};

const getStep = (scale: number, frameStep: number): number =>
    scale > 60 ? frameStep : 10;

export const getLongText = (count: number, scale: number): string => {
    const time = count * (
        scale < TIME_SCALES.SECOND ? 60 :
        scale < TIME_SCALES.FRAME ? 10 : 
        1
    );
    return formatTime(time * 1000).str;
};

const getShortText = (count: number, step: number, scale: number): string => {
    if (scale < TIME_SCALES.FRAME) return '';
    if (scale <= 80) return '';
    
    const index = count % step;
    return index === 0 ? '' : `${index < 10 ? '0' : ''}${index}f`;
};

export const getSelectedFrame = (offsetX: number, scale: number, frameStep: number): number => {
    const size = getGridSize(scale);
    if (scale < TIME_SCALES.FRAME) offsetX *= frameStep;
    if (scale < TIME_SCALES.SECOND) offsetX *= 6;
    return Math.floor(offsetX / size) + (scale < TIME_SCALES.FRAME ? 0 : 1);
};

const calculateTextPosition = (textLength: number, textSize: number, textScale: number, ratio: number) => ({
    x: textLength * 5 * textScale * ratio,
    y: ((textSize / ratio * textScale / ratio) / 2)
});

export const drawTimeLine = (
    context: CanvasRenderingContext2D, 
    userConfigs: UserConfig, 
    canvasConfigs: CanvasConfig
): void => {
    const { start, scale, step: frameStep, focusPosition } = userConfigs;
    const { 
        ratio, bgColor, width, height, textColor, subTextColor, 
        textSize, textScale, focusColor, longColor, shortColor 
    } = canvasConfigs;

    const step = getStep(scale, frameStep);
    const gridSizeS = getGridSize(scale);
    const gridSizeB = gridSizeS * step;

    const startValueS = Math.floor(start / gridSizeS) * gridSizeS;
    const startValueB = Math.floor(start / gridSizeB) * gridSizeB;
    const offsetXS = startValueS - start;
    const offsetXB = startValueB - start;
    const endValue = start + Math.ceil(width);

    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

//focus area if present
    if (focusPosition) {
        const { start: fStart, end } = focusPosition;
        const divisor = scale < TIME_SCALES.SECOND ? 180 : scale < TIME_SCALES.FRAME ? 30 : 1;
        const focusS = (fStart / divisor * gridSizeS + 0.5 - start);
        const focusW = ((end - fStart) / divisor * gridSizeS - 0.5);
        
        if (focusW > gridSizeS) {
            context.fillStyle = focusColor;
            context.fillRect(focusS, 0, focusW, height * 3/8);
        }
    }

//long intervals
    context.beginPath();
    context.fillStyle = textColor;
    context.strokeStyle = longColor;

    for (let value = startValueB, count = 0; value < endValue; value += gridSizeB, count++) {
        const x = offsetXB + count * gridSizeB + 0.5;
        context.moveTo(x, 0);
        context.lineTo(x, height * 10/16 / ratio);

        // text
        context.save();
        context.translate(x, height * 0.4);
        context.scale(textScale / ratio, textScale / ratio);
        const text = getLongText(value / gridSizeB, scale);
        const { x: textX, y: textY } = calculateTextPosition(text.length, textSize, textScale, ratio);
        context.fillText(text, textX, textY);
        context.restore();
    }
    context.stroke();
    context.closePath();

    //short intervals
    context.beginPath();
    context.fillStyle = subTextColor;
    context.strokeStyle = shortColor;

    for (let value = startValueS, count = 0; value < endValue; value += gridSizeS, count++) {
        const x = offsetXS + count * gridSizeS + 0.5;
        if (value % gridSizeB !== 0) {
            context.moveTo(x, 0);
            context.lineTo(x, height / 3 / ratio);
        }
        const text = getShortText(value / gridSizeS, step, scale);
        if (text) {
            context.save();
            context.translate(x, height * 0.4);
            context.scale(textScale / ratio, textScale / ratio);
            const { x: textX, y: textY } = calculateTextPosition(text.length, textSize, textScale, ratio);
            context.fillText(text, textX, textY);
            context.restore();
        }
    }
    context.stroke();
    context.closePath();

    context.setTransform(1, 0, 0, 1, 0, 0);
};