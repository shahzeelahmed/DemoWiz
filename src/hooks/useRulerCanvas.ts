import { useEffect, useState, RefObject } from 'react';
import { CanvasSize } from '../types';

export const useCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement>,
  height: number,
) => {
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setCanvasContext(context);
    }
  }, []);

  return { canvasContext, canvasSize, setCanvasSize };
};