
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
export type TrackType = 'video' | 'audio' | 'text' | 'image'  | 'transition' | 'filter';

interface BaseTrackItem {
  id: string;
  type: TrackType;
  name: string;
  atTime: number;
  end: number;
  duration: number;
  
}
export interface VideoTrack extends BaseTrackItem {
  duration: number;
  format: string;
  source: string;
  width: number;
  height: number;
  fps: number;
}

export interface AudioTrack extends BaseTrackItem {
  duration: number;
  format: string;
  name:string;
}

export interface TextTrack extends BaseTrackItem {
  name: string;
}

export interface ImageTrack extends BaseTrackItem {
  format: string;
  width: number;
  height: number;
  sourceFrame: number;
  cover: string;
}

export interface TransitionTrack extends BaseTrackItem {
  name: string;
}

export interface FilterTrack extends BaseTrackItem {
  name: string;
  filterType: string;
}

export type TrackItem = VideoTrack | AudioTrack | TextTrack | ImageTrack  | TransitionTrack | FilterTrack;

export interface TrackRow{
  rowId: string;
  list?: TrackItem[];
}
export interface DragData{
  dataInfo?: string;
  dragType?: TrackItem;
  dragPoint: {
    x: number;
    y: number;
  }
}