import React, { useRef } from "react";
import { useStore } from "zustand";
import { useRulerDraw } from "../../hooks/useRulerDraw";
import { RulerProps, DEFAULT_PROPS, Scale } from "../../types";
import { DEFAULT_DRAW_CONFIG, CANVAS_CONSTANTS } from "../../utils/helpers";
import { useCanvasSetup } from "../../hooks/useRulerCanvas";

const Ruler = (props: RulerProps) => {
    const {
      height = DEFAULT_PROPS.height,
      longLineSize = DEFAULT_PROPS.longLineSize,
      shortLineSize = DEFAULT_PROPS.shortLineSize,
      offsetX = DEFAULT_PROPS.offsetX,
      textOffsetY = DEFAULT_PROPS.textOffsetY,
      textFormat = DEFAULT_PROPS.textFormat,
      scrollLeft: scrollPos = DEFAULT_PROPS.scrollLeft,
      onClick,
    } = props;
  
    const initScale: Scale = {
        unit: 60,
        zoom: 1 / 90,
        segments: 5
      };
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { canvasContext, canvasSize, setCanvasSize } = useCanvasSetup(canvasRef, height);
  
    useRulerDraw(
      canvasRef,
      canvasContext,
      scrollPos,
      initScale,
      DEFAULT_DRAW_CONFIG,
      { height, offsetX, textOffsetY, longLineSize, shortLineSize, textFormat },
      setCanvasSize,
    );
  
    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !onClick) return;
  
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const totalX = clickX + scrollPos - CANVAS_CONSTANTS.TIMELINE_OFFSET_X - CANVAS_CONSTANTS.TIMELINE_OFFSET_CANVAS_LEFT;
      
      onClick(totalX);
    };
  
    return (
      <div
        className="border-t border-border"
        style={{
          position: "relative",
          width: "100%",
          height: `${canvasSize.height}px`,
          backgroundColor: "transparent",
        }}
      >
        <canvas
          onMouseUp={handleClick}
          ref={canvasRef}
          height={canvasSize.height}
        />
      </div>
    );
  };
  
  export default Ruler;
  