import { useEffect, useRef,useState } from "react";

export const usePlayback = (duration: number) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const animationRef = useRef(0);
    const lastUpdateTimeRef = useRef(0);
    const isDragging = false;
    

    useEffect(() => {
        const animate = (timestamp) => {
          if (!isPlaying || isDragging) {
            return;
          }
    
          const elapsed = (timestamp - lastUpdateTimeRef.current) / 1000;
          
          if (elapsed > 1/30) {
            setCurrentTime((prevTime) => {
              const newTime = prevTime + elapsed;
              if (newTime >= duration) {
                setIsPlaying(false);
                return duration;
              }
              return newTime;
            });
            lastUpdateTimeRef.current = timestamp;
          }
          
          animationRef.current = requestAnimationFrame(animate);
        };
        
        if (isPlaying) {
          lastUpdateTimeRef.current = performance.now();
          animationRef.current = requestAnimationFrame(animate);
        }
        
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }, [isPlaying, isDragging, duration]);
      
      const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
      };
    return { isPlaying, currentTime, togglePlayPause };
  };