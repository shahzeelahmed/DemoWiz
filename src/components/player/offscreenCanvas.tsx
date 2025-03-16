import React, { useRef, useEffect } from 'react'

function OffscreenCanvasComponent ({ width = 720, height = 480 }) {
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const visibleCanvas = visibleCanvasRef.current
    if (!visibleCanvas) return
    const offscreenCanvas = new OffscreenCanvas(width, height)

    try {
      const bitmap = offscreenCanvas.transferToImageBitmap()
      const visibleCtx = visibleCanvas.getContext('bitmaprenderer')
      //@ts-ignore
      visibleCtx.transferFromImageBitmap(bitmap)
    } catch (e) {
      const visibleCtx = visibleCanvas.getContext('2d')
       //@ts-ignore
      visibleCtx.drawImage(offscreenCanvas, 0, 0)
    }
  }, [width, height])

  return <canvas ref={visibleCanvasRef} width={width} height={height} />
}

export default OffscreenCanvasComponent
