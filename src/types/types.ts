
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
  targetTracks: Map<string, any>; // Type if you know the structure of the tracks
  isPaused: boolean;

  setLoading: (loading: boolean) => void;
  setCanvasOptions: (options: CanvasOptions) => void;
  setPlayerConfig: (config: PlayerConfig) => void;
  setHasVideo: (hasVideo: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  setTargetTracks: (tracks: Map<string, any>) => void; // Be more specific if possible
  setPaused: (paused: boolean) => void;
}
