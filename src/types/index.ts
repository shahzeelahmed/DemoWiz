export interface TimelineProps {
    duration: number;
    onTimeUpdate?: (time: number) => void;
    initialTime?: number;
  }
  
  export interface PlayheadProps {
    position: number;
    isDragging?: boolean;
  }
  
  export interface TooltipProps {
    position: number;
    time: number;
    visible: boolean;
  }