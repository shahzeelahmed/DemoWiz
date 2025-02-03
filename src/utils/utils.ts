import { DrawConfig } from "../types";
import { CANVAS_CONSTANTS } from "./helpers";

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