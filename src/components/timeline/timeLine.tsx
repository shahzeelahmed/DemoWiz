import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  
} from 'react'
import { getRulerConfig } from '../../utils/constants'

import {
  formatHourTime,
  formatMinuteTime,
  formatSecondTime
} from '../../utils/helpers'
import { TimeLineProps } from '../../types/timeLine'

const TimeLine: React.FC<TimeLineProps> = ({ 
  duration, 
  zoom = 1, 
  currentTime = 0, 
  totalWidth = 10000, 
  onTimeUpdate = () => {}, 
  onScroll = () => {} 
}) => {
    const rulerContainerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [lastMouseX, setLastMouseX] = useState(0)
    const [scrollDirection, setScrollDirection] = useState<
      'left' | 'right' | null
    >(null)
    const [lastClientX, setLastClientX] = useState(0)
    const scrollAnimationIdRef = useRef<number | null>(null)
    const CONSTANTS = getRulerConfig()

    const tickSpacing = CONSTANTS.tickSpacing * zoom
    const playheadPosition = currentTime * tickSpacing * 10
   

    //TODO: add more zoom levels
    const getTickConfig = () => {
      if (zoom < 0.5) {
        return {
          ticksPerSecond: 1 / 60,
          smallTickInterval: 5,
          largeTickInterval: 60,
          timeFormatter: formatHourTime,
          // zoom: zoomStore.setZoom(zoom)
        }
      } else if (zoom < 0.6) {
        return {
          ticksPerSecond: 1 / 6,
          smallTickInterval: 5,
          largeTickInterval: 90,
          timeFormatter: formatMinuteTime,
          // zoom: zoomStore.setZoom(zoom)
        }
      } else if (zoom < 0.7) {
        return {
          ticksPerSecond: 1 / 6,
          smallTickInterval: 5,
          largeTickInterval: 60,
          timeFormatter: formatMinuteTime,
          // zoom: zoomStore.setZoom(zoom)
        }
      } else if (zoom < 0.8) {
        return {
          ticksPerSecond: 1 / 3,
          smallTickInterval: 5,
          largeTickInterval: 60,
          timeFormatter: formatMinuteTime,
          // zoom: zoomStore.setZoom(zoom)
        }
      } else if (zoom < 0.9) {
        return {
          ticksPerSecond: 1 / 6,
          smallTickInterval: 5,
          largeTickInterval: 50,
          timeFormatter: formatMinuteTime,
          // zoom: zoomStore.setZoom(zoom)
        }
      } else if (zoom < 1) {
        return {
          ticksPerSecond: 1 / 2,
          smallTickInterval: 4,
          largeTickInterval: 60,
          timeFormatter: formatMinuteTime,
          // zoom: zoomStore.setZoom(zoom)
        }
      } else {
        return {
          ticksPerSecond: 5,
          smallTickInterval: 5,
          largeTickInterval: 50,
          timeFormatter: formatSecondTime,
          // zoom: zoomStore.setZoom(zoom)
        }
      }
    }

    const {
      ticksPerSecond,
      smallTickInterval,
      largeTickInterval,
      timeFormatter
    } = getTickConfig()
    const totalTicks = Math.ceil(duration * ticksPerSecond)

    const drawRuler = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1

      canvas.width = totalWidth * dpr
      canvas.height = CONSTANTS.rulerHeight * dpr
      canvas.style.width = `${totalWidth}px`
      canvas.style.height = `${CONSTANTS.rulerHeight}px`

      ctx.scale(dpr, dpr)

      ctx.clearRect(0, 0, totalWidth, CONSTANTS.rulerHeight)

      ctx.font = '11px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      for (let i = 0; i <= totalTicks; i++) {
        const x = i * tickSpacing

        if (i % largeTickInterval === 0) {
          ctx.fillStyle = '#3e3e3e'
          ctx.fillRect(x, 20, 1, 10)

          ctx.fillStyle = '#4e4e4e'
          ctx.fillText(timeFormatter(i), x, 4)
        } else if (i % smallTickInterval === 0) {
          ctx.fillStyle = '#6f6f6f'
          ctx.fillRect(x, 25, 1, 5)
        }
      }
    }, [
      totalWidth,
      totalTicks,
      tickSpacing,
      timeFormatter,
      largeTickInterval,
      smallTickInterval
    ])

    const drawPlayhead = useCallback(() => {
      if (!rulerContainerRef.current) return

      const scrollLeft = rulerContainerRef.current.scrollLeft || 0
      const playheadElement = rulerContainerRef.current
        .nextElementSibling as HTMLElement

      if (playheadElement) {
        playheadElement.style.left = `${playheadPosition - scrollLeft}px`
      }
    }, [playheadPosition])

    useEffect(() => {
      drawRuler()
      drawPlayhead()
    }, [
      totalWidth,
      totalTicks,
      tickSpacing,
      zoom,
      currentTime,
      drawRuler,
      drawPlayhead
    ])

    const handleAutoScroll = useCallback(() => {
      if (!isDragging || !rulerContainerRef.current) return

      const parentContainer = rulerContainerRef.current.parentElement
      if (!parentContainer) return

      if (scrollDirection) {
        onScroll(
          scrollDirection === 'right'
            ? CONSTANTS.scrollSpeed
            : -CONSTANTS.scrollSpeed
        )

        const rect = rulerContainerRef.current.getBoundingClientRect()
        const mouseX = lastMouseX - rect.left
        const time = Math.max(
          0,
          Math.min(mouseX / ((tickSpacing * 10) / ticksPerSecond), duration)
        )
        onTimeUpdate(time)

        scrollAnimationIdRef.current = requestAnimationFrame(handleAutoScroll)
      }
    }, [
      isDragging,
      lastMouseX,
      scrollDirection,
      tickSpacing,
      duration,
      onScroll,
      onTimeUpdate,
      ticksPerSecond
    ])

    const handleMouseDown = (event: React.MouseEvent) => {
      if (!rulerContainerRef.current) return

      const rect = rulerContainerRef.current.getBoundingClientRect()
      const scrollLeft = rulerContainerRef.current?.scrollLeft || 0
      const relativeX = event.clientX - rect.left + scrollLeft
      // const relativeX = event.clientX - rect.left;
      // const clickTime = relativeX / (tickSpacing * 10 / ticksPerSecond);
      const clickTime = relativeX / tickSpacing / ticksPerSecond

      onTimeUpdate(Math.max(0, Math.min(clickTime, duration)))
      startDragging(event)
    }

    const startDragPlayhead = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!rulerContainerRef.current) return

      const rect = rulerContainerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const time = Math.max(
        0,
        Math.min(mouseX / ((tickSpacing * 10) / ticksPerSecond), duration)
      )
      onTimeUpdate(time)
      startDragging(e)
    }

    const startDragging = (e: React.MouseEvent) => {
      setIsDragging(true)
      setLastMouseX(e.clientX)
      setLastClientX(e.clientX)
      document.addEventListener('mousemove', handleDragPlayhead)
      document.addEventListener('mouseup', stopDragPlayhead)
    }

    const handleDragPlayhead = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !rulerContainerRef.current) return

        const rect = rulerContainerRef.current.getBoundingClientRect()
        const parentContainer = rulerContainerRef.current.parentElement
        if (!parentContainer) return

        const scrollLeft = rulerContainerRef.current.scrollLeft || 0
        const mouseX = e.clientX - rect.left + scrollLeft

        const newTime = mouseX / tickSpacing / ticksPerSecond
        onTimeUpdate(Math.max(0, Math.min(newTime, duration)))

        setLastMouseX(e.clientX)
      },
      [isDragging, tickSpacing, duration, ticksPerSecond, onTimeUpdate]
    )
    const stopDragPlayhead = useCallback(() => {
      setIsDragging(false)
      setScrollDirection(null)
      document.removeEventListener('mousemove', handleDragPlayhead)
      document.removeEventListener('mouseup', stopDragPlayhead)

      if (scrollAnimationIdRef.current !== null) {
        cancelAnimationFrame(scrollAnimationIdRef.current)
        scrollAnimationIdRef.current = null
      }
    }, [handleDragPlayhead])

    useEffect(() => {
      if (scrollDirection && !scrollAnimationIdRef.current) {
        scrollAnimationIdRef.current = requestAnimationFrame(handleAutoScroll)
      }
    }, [scrollDirection, handleAutoScroll])

    useEffect(() => {
      return () => {
        if (scrollAnimationIdRef.current !== null) {
          cancelAnimationFrame(scrollAnimationIdRef.current)
        }
        document.removeEventListener('mousemove', handleDragPlayhead)
        document.removeEventListener('mouseup', stopDragPlayhead)
      }
    }, [handleDragPlayhead, stopDragPlayhead])

    return (
      <div className='time-ruler' >
        <div
          className='ticks-container'
          ref={rulerContainerRef}
          style={{
            width: `${totalWidth}px`,
            height: `${CONSTANTS.rulerHeight}px`
          }}
          onMouseDown={handleMouseDown}
        >
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        <div
          className='playhead'
          style={{ left: `${playheadPosition}px`, backgroundColor: 'black' }}
          onMouseDown={startDragPlayhead}
        >
          <div className='playhead-line  '></div>
          <div className='playhead-triangle '></div>
        </div>
        <style>{`
        .ticks-container {
          position: relative;
          user-select: none;
        }
        .playhead {
          position: absolute;
          top: 0;
          width: 0;
          height: ${CONSTANTS.rulerHeight}px;
          cursor: ew-resize;
          z-index: 10;
        }
        .playhead-line {
          position: absolute;
          width: 2px;
          height: 100%;
          background: #fff;
          left: -1px;
        }
        .playhead-triangle {
          position: absolute;
          top: 0;
          left: -6px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #fff;
        }
      `}</style>
      </div>
    )
  }

export default TimeLine

// setZoom	@	timelineStore.ts:9
// getTickConfig	@	timeLine.tsx:88
// TimeLine	@	timeLine.tsx:106