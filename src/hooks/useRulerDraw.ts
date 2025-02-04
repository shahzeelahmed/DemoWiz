import { RefObject, useEffect } from "react";
import { CanvasSize, DrawConfig } from "../types";
import { draw, drawLine, drawText, setupContext } from "../utils/utils";
import { CANVAS_CONSTANTS } from "../utils/helpers";

export const useRulerDraw = (
    canvasRef: RefObject<HTMLCanvasElement>,
    canvasContext: CanvasRenderingContext2D | null,
    scrollPos: number,
    scale: { zoom: number; unit: number; segments: number },
    config: DrawConfig,
    props: {
      height: number;
      offsetX: number;
      textOffsetY: number;
      longLineSize: number;
      shortLineSize: number;
      textFormat: (scale: number) => string;
    },
    setCanvasSize: (size: CanvasSize) => void
  ) => {
    
    useEffect(() => {
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas || !canvasContext) return;
  
        const offsetParent = canvas.offsetParent as HTMLDivElement;
        const width = offsetParent?.offsetWidth ?? canvas.offsetWidth;
        
        canvas.width = width;
        canvas.height = props.height;
  
        const { zoom, unit, segments } = scale;
        const zoomUnit = unit * zoom * CANVAS_CONSTANTS.PREVIEW_FRAME_WIDTH;
        const minRange = Math.floor(scrollPos / zoomUnit);
        const maxRange = Math.ceil((scrollPos + width) / zoomUnit);
        const length = maxRange - minRange;
  
        setupContext(canvasContext, width, props.height, config);
  
        // Draw text
        for (let i = 0; i <= length; ++i) {
          const value = i + minRange;
          if (value < 0) continue;
  
          const startValue = (value * zoomUnit) / zoom;
          const startPos = (startValue - scrollPos / zoom) * zoom;
  
          if (startPos < -zoomUnit || startPos >= width + zoomUnit) continue;
          
          drawText(
            canvasContext, 
            startValue, 
            startPos, 
            props.offsetX, 
            props.textOffsetY, 
            zoom, 
            scrollPos, 
            props.textFormat
          );
        }
  
      
        const origin = CANVAS_CONSTANTS.ORIGIN_Y;
        for (let i = 0; i <= length; ++i) {
          const value = i + minRange;
          if (value < 0) continue;
  
          const startValue = value * zoomUnit;
          const startPos = startValue - scrollPos + props.offsetX;
  
          for (let j = 0; j < segments; ++j) {
            const pos = startPos + (j / segments) * zoomUnit;
            if (pos < 0 || pos >= width) continue;
  
            const isLongLine = j % segments === 0;
            const lineSize = isLongLine ? props.longLineSize : props.shortLineSize;
            drawLine(
              canvasContext, 
              pos, 
              origin, 
              lineSize, 
              isLongLine, 
              config
            );
          }
        }
        draw(canvasContext, scrollPos, width, props.height);
        canvasContext.restore();
        
      };
      
      handleResize();
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [
      canvasRef, 
      canvasContext, 
      scrollPos, 
      scale, 
      config, 
      props.height, 
      props.offsetX, 
      props.textOffsetY, 
      props.longLineSize, 
      props.shortLineSize, 
      props.textFormat, 
      
      setCanvasSize
    ]);
  };

