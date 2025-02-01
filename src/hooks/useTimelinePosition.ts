import { useRef } from "react";
import useTimeStore from "../store/timeStore";
import { useStore } from "zustand";

export const useTimelinePosition = (dur: number) => {
        const timelineRef = useRef(null);
        const setTime = useStore(useTimeStore, (state) => state.setCurrentTime);
        const handleTimelineClick = (e) => {
                if (!timelineRef.current) return;
                
                const rect = (timelineRef.current as HTMLElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                const updateTime = percentage * dur;
                
                setTime( updateTime, dur);
            };
        
        return { timelineRef, handleTimelineClick };
    };
