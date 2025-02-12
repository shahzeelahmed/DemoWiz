import { DrawConfig, Scale, TrackItem } from "../types/types";
import {  formatTime } from "./helpers";



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
export interface TimelineProps {
  start?: number;
  step?: number;
  scale?: number;
  focusPosition?: {
    start: number;
    end: number;
  };
  isDark?: boolean;
  hideSubMenu?: boolean;
  onSelectFrame?: (frame: number) => void;
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
