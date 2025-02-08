import { CanvasConfig, DrawConfig, UserConfig } from "../types/types";

  export function formatTime(time: number): { s: number; m: number; h: number; str: string } {
    const totalSeconds = Math.ceil(time / 1000);
  
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600); 
  
    const formattedTime = [
      hours > 0 ? `${hours.toString().padStart(2, '0')}:` : "", 
      `${minutes.toString().padStart(2, '0')}:`, 
      seconds.toString().padStart(2, '0'),  
    ].join(""); 
  
    return {
      s: seconds,
      m: minutes,
      h: hours,
      str: formattedTime,
    };
  }

  export const DEFAULT_DRAW_CONFIG: DrawConfig = {
    shortLineColor: "#a1a1aa",
    longLineColor: "#d4d4d8",
    textColor: "#71717a",
    lineWidth: 1,
  };
  export const drawTimeLine = (
    ctx: CanvasRenderingContext2D,
    userConfig: UserConfig,
    config: CanvasConfig
  ): void => {
    const { width, height, ratio } = config;
    const { start, step, scale, focusPosition } = userConfig;
  

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);
  
   
    const centerY = height / (2 * ratio);
    const maxFrames = Math.ceil(width / (step * scale * ratio));
    
   
    if (focusPosition.start !== focusPosition.end) {
      const focusStart = focusPosition.start * step * scale * ratio;
      const focusEnd = focusPosition.end * step * scale * ratio;
      ctx.fillStyle = config.focusColor;
      ctx.fillRect(focusStart, 0, focusEnd - focusStart, height);
    }
  
    for (let i = 0; i <= maxFrames; i++) {
      const x = i * step * scale * ratio;
      const frameNumber = start + i;
  
      if (x > width) break;
        
      const isMajorMark = frameNumber % 5 === 0;
      
      ctx.beginPath();
      ctx.strokeStyle = isMajorMark ? config.longColor : config.shortColor;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, isMajorMark ? height : height * 0.7);
      ctx.stroke();
    
      if (isMajorMark) {
        ctx.fillStyle = config.textColor;
        ctx.font = `${config.textSize * config.ratio * config.textScale}px Arial`;
        ctx.fillText(
          frameNumber.toString(),
          x,
          centerY
        );
      }
    }

    const drawMarker = (frame: number, color: string) => {
      const x = (frame - start) * step * scale * ratio;
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, centerY, 3 * ratio, 0, Math.PI * 2);
        ctx.fill();
      }
    };
  
    if (focusPosition.frameCount > 0) {
      drawMarker(focusPosition.frameCount, config.textColor);
    }

    ctx.beginPath();
    ctx.strokeStyle = config.lineColor;
    ctx.moveTo(0, height - config.lineWidth);
    ctx.lineTo(width, height - config.lineWidth);
    ctx.stroke();
  };
  
  
  const formatFrameNumber = (frame: number): string => {
    return frame.toString().padStart(2, '0');
  };
  
  const isMajorFrame = (frame: number): boolean => {
    return frame % 5 === 0;
  };
  export const setupCanvas = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    config: CanvasConfig,
    font: string
  ): void => {
    context.font = `${config.textSize * config.ratio}px ${font}`;
    context.lineWidth = config.lineWidth;
    context.textBaseline = config.textBaseline;
    context.textAlign = config.textAlign;
  };