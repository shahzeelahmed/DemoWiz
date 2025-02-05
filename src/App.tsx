import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Playhead from "./components/timeline/playhead";
import Ruler from "./components/timeline/Ruler";
import { timeMsToUnits, unitsToTimeMs } from "./utils/helpers";
import { Scale } from "./types";
export default function App() {
  const fps = 30;
  const currentFrame = 0;
  const initscale : Scale ={
    unit: 60,
    zoom: 1 / 90,
    segments: 5
  }
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);

  const verticalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarVpRef = useRef<HTMLDivElement>(null);
  
 

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });


  const [scrollLeft, setScrollLeft] = useState(0);
  const onScroll = (v: { scrollTop: number; scrollLeft: number }) => {
    if (horizontalScrollbarVpRef.current && verticalScrollbarVpRef.current) {
      verticalScrollbarVpRef.current.scrollTop = -v.scrollTop;
      horizontalScrollbarVpRef.current.scrollLeft = -v.scrollLeft;
      setScrollLeft(-v.scrollLeft);
    }
  };

  useEffect(() => {
    const position = timeMsToUnits((0 / fps) * 1000, initscale.zoom);
    const canvasBoudingX =
      canvasElRef.current?.getBoundingClientRect().x! +
      canvasElRef.current?.clientWidth!;
    const playHeadPos = position - scrollLeft + 40;
    if (playHeadPos >= canvasBoudingX) {
      const scrollDivWidth = horizontalScrollbarVpRef.current?.clientWidth!;
      const totalScrollWidth = horizontalScrollbarVpRef.current?.scrollWidth!;
      const currentPosScroll = horizontalScrollbarVpRef.current?.scrollLeft!;
      const availableScroll =
        totalScrollWidth - (scrollDivWidth + currentPosScroll);
      const scaleScroll = availableScroll / scrollDivWidth;
      if (scaleScroll >= 0) {
        if (scaleScroll > 1)
          horizontalScrollbarVpRef.current?.scrollTo({
            left: currentPosScroll + scrollDivWidth
          });
        else
          horizontalScrollbarVpRef.current?.scrollTo({
            left: totalScrollWidth - scrollDivWidth
          });
      }
    }
  }, [currentFrame]);



  return (  
    
  <Ruler />
 
) 
}




