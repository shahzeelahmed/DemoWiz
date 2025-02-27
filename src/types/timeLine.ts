export interface TimeLineProps {
    duration: number;
    zoom?: number;
    currentTime?: number;
    totalWidth?: number;
    onTimeUpdate?: (time: number) => void;
    onScroll?: (delta: number) => void;
  }