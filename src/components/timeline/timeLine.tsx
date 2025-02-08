import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { getSelectedFrame, TimelineProps, UserConfig } from "../../utils/utils";
import { CanvasConfig, drawTimeLine } from "../../utils/utils";




const FONT = 'Arial';
const Timeline = ({
  start = 0,
  step = 30,
  scale = 0,
  focusPosition = { start: 0, end: 0 },
  isDark = false,
  hideSubMenu = false,
  onSelectFrame
}: TimelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  const canvasConfigs = useMemo((): Omit<CanvasConfig, 'width' | 'height'> => ({
    bgColor: isDark ? '#374151' : '#efefef',
    ratio: window.devicePixelRatio || 1,
    textSize: 12,
    textScale: 0.9,
    lineWidth: 1,
    textBaseline: 'middle',
    textAlign: 'center',
    longColor: isDark ? '#E5E7EB' : '#3e3e3e',
    shortColor: isDark ? '#9CA3AF' : '#8f8f8f',
    textColor: isDark ? '#E5E7EB' : '#374151',
    subTextColor: isDark ? '#9CA3AF' : '#6B7280',
    focusColor: isDark ? '#6D28D9' : '#efefef',
    lineColor: isDark ? '#4B5563' : '#efefef'
  }), [isDark]);

  const setCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.font = `${canvasConfigs.textSize * canvasConfigs.ratio}px ${FONT}`;
    context.lineWidth = canvasConfigs.lineWidth;
    context.textBaseline = canvasConfigs.textBaseline;
    context.textAlign = canvasConfigs.textAlign;
    
    contextRef.current = context;
  }, [canvasConfigs]);

  const updateTimeLine = useCallback(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    const userConfig: UserConfig = {
      start,
      step,
      scale,
      focusPosition:{ start: 0, end: 0 ,frameCount:100},
    };

    const fullConfig: CanvasConfig = {
      ...canvasConfigs,
      width: canvas.width,
      height: canvas.height
    };

    drawTimeLine(context, userConfig, fullConfig);
  }, [start, step, scale, focusPosition, canvasConfigs]);

  const setCanvasRect = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const { width, height } = container.getBoundingClientRect();
    const ratio = canvasConfigs.ratio;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    setCanvasContext();
    updateTimeLine();
  }, [canvasConfigs.ratio, setCanvasContext, updateTimeLine]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSelectFrame) return;
    
    const offset = event.nativeEvent.offsetX;
    const frameIndex = getSelectedFrame(start + offset, scale, step);
    onSelectFrame(frameIndex);
  }, [onSelectFrame, start, scale, step]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(setCanvasRect, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [setCanvasRect]);

  useEffect(() => {
    setCanvasRect();
  }, [setCanvasRect]);

  useEffect(() => {
    updateTimeLine();
  }, [updateTimeLine]);

  useEffect(() => {
    if (hideSubMenu !== undefined) {
      const timer = setTimeout(setCanvasRect, 300);
      return () => clearTimeout(timer);
    }
  }, [hideSubMenu, setCanvasRect]);

  return (
    <div 
      ref={containerRef} 
      className="sticky top-0 left-0 right-0 h-5 text-center leading-5 text-sm z-20"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
      />
    </div>
  );
};

export default Timeline;
