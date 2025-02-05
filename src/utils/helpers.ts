import { DrawConfig } from "../types";
import { FRAME_INTERVAL, PREVIEW_FRAME_WIDTH, SECONDARY_FONT, SMALL_FONT_SIZE, TIMELINE_OFFSET_CANVAS_LEFT, TIMELINE_OFFSET_X } from "./constants";

  export const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  export const DEFAULT_DRAW_CONFIG: DrawConfig = {
    shortLineColor: "#a1a1aa",
    longLineColor: "#d4d4d8",
    textColor: "#71717a",
    lineWidth: 1,
  };
  
  export const DEFAULT_PROPS = {
    height: 40,
    longLineSize: 8,
    shortLineSize: 6,
    offsetX: TIMELINE_OFFSET_X + TIMELINE_OFFSET_CANVAS_LEFT,
    textOffsetY: 12,
    textFormat: (scale: number) => scale.toString(),
    scrollLeft: 0,
  } as const;
  
  export const CANVAS_CONSTANTS = {
    PREVIEW_FRAME_WIDTH,
    SECONDARY_FONT,
    SMALL_FONT_SIZE,
    TIMELINE_OFFSET_CANVAS_LEFT,
    TIMELINE_OFFSET_X,
    ORIGIN_Y: 32,
  } as const;
  export function timeMsToUnits(timeMs: number, zoom = 1): number {
    const zoomedFrameWidth = PREVIEW_FRAME_WIDTH * zoom;
    const frames = timeMs * (60 / 1000);
  
    return frames * zoomedFrameWidth;
  }
  
  export function unitsToTimeMs(units: number, zoom = 1): number {
    const zoomedFrameWidth = PREVIEW_FRAME_WIDTH * zoom;
  
    const frames = units / zoomedFrameWidth;
  
    return frames * FRAME_INTERVAL;
  }