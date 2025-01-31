import { useRef } from "react";

export const useTimelinePosition = (duration: number) => {
    const timelineRef = useRef(null);
    
    const handleTimelineClick = (e) => {
        if (!timelineRef.current) return;
        
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;
        setCurrentTime(Math.max(0, Math.min(newTime, duration)));
      };
    
    return { timelineRef, handleTimelineClick };
  };