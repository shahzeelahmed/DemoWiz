import { TIMELINE_OFFSET_X, TIMELINE_OFFSET_CANVAS_LEFT } from "../utils/constants";

export interface TimelineProps {
    duration: number;
    onTimeUpdate?: (time: number) => void;
    initialTime?: number;
  }
export interface  Scale  {
    unit: number;
    zoom: number;
    segments: number;
  };  
export interface PlayheadProps {
    position: number;
    isDragging?: boolean;
  }
  
export interface TooltipProps {
    position: number;
    time: number;
    visible: boolean;
  }

  export interface CanvasSize {
    width: number;
    height: number;
  }
  
  export interface RulerProps {
    height?: number;
    longLineSize?: number;
    shortLineSize?: number;
    offsetX?: number;
    textOffsetY?: number;
    scrollLeft?: number;
    textFormat?: (scale: number) => string;
    onClick?: (units: number) => void;
  }
  
  export interface DrawConfig {
    shortLineColor: string;
    longLineColor: string;
    textColor: string;
    lineWidth: number;
  }  
  
  export const DEFAULT_PROPS = {
    height: 40,
    longLineSize: 8,
    shortLineSize: 6,
    offsetX: TIMELINE_OFFSET_X + TIMELINE_OFFSET_CANVAS_LEFT,
    textOffsetY: 12,
    textFormat: (scale: number) => scale.toString(),
    scrollLeft: 0,
  } as const;
  