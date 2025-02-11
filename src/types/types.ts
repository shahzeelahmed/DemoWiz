
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
    focusPosition: {
      start: number;
      end: number;
      frameCount: number;
    };
  
}
export interface TrackPlayerProps {
  trackScale: number;
  frameCount: number;
  initialPlayStartFrame?: number;
  onPlayFrameChange?: (frame: number) => void;
  offsetLeft?: number;
}
export interface VideoSource {
  id: string;
  url: string;
  name: string;
  format: string;
  duration: number;
  width: number;
  height: number;
}
export interface ImageSource {
  id: string,
  url: string,
  name: string,
  format: string,
  width: number,
  height: number
}
interface PlayerConfig {
  frameCount: number;
  playerWidth: number;
  playerHeight: number;
}

interface CanvasOptions {
  width: number;
  height: number;
}

export interface PlayerState {
  isLoading: boolean;
  canvasOptions: CanvasOptions;
  playerConfig: PlayerConfig;
  hasVideo: boolean;
  currentFrame: number;
  targetTracks: Map<string, any>; 
  isPaused: boolean;

  setLoading: (loading: boolean) => void;
  setCanvasOptions: (options: CanvasOptions) => void;
  setPlayerConfig: (config: PlayerConfig) => void;
  setHasVideo: (hasVideo: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  setTargetTracks: (tracks: Map<string, any>) => void; 
  setPaused: (paused: boolean) => void;
}



export interface TrackProps {
  trackType: string;
  lineIndex: number;
  itemIndex: number;
  trackItem: TrackItem;
}
export type TrackType = 'video' | 'audio' | 'text' | 'image' | 'effect' | 'transition' | 'filter';

interface BaseTractItem {
  id: string;
  type: TrackType;
  name: string;
  start: number;
  end: number;
  frameCount: number;
  offsetL: number; 
  offsetR: number; 
}

export interface VideoTractItem extends BaseTractItem {
  time: number;
  format: string;
  source: string;
  cover: string;
  width: number;
  height: number;
  fps: number;
}

export interface AudioTractItem extends BaseTractItem {
  time: number;
  format: string;
  source: string;
  cover: string;
}

export interface TextTractItem extends BaseTractItem {
  cover: string;
  templateId: number;
}

export interface ImageTractItem extends BaseTractItem {
  source: string;
  format: string;
  width: number;
  height: number;
  sourceFrame: number;
  cover: string;
}

export interface EffectTractItem extends BaseTractItem {
  templateId: number;
  cover: string;
}

export interface TransitionTractItem extends BaseTractItem {
  templateId: number;
  cover: string;
}

export interface FilterTractItem extends BaseTractItem {
  templateId: number;
  cover: string;
}

export type TrackItem = VideoTractItem | AudioTractItem | TextTractItem | ImageTractItem | EffectTractItem | TransitionTractItem | FilterTractItem;

export interface TrackLineItem {
  type: TrackItem['type'];
  main?: boolean;
  list: TrackItem[];
}