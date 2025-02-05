import { DrawConfig, Scale } from "../types";
import { PREVIEW_FRAME_WIDTH, SECONDARY_FONT, SMALL_FONT_SIZE, TIMELINE_OFFSET_X } from "./constants";
import { CANVAS_CONSTANTS, DEFAULT_DRAW_CONFIG } from "./helpers";

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