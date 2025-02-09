import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { getGridPixel, getSelectedFrame } from '../../utils/utils'
import { TrackPlayerProps } from '../../types/types'

const Playhead: React.FC<TrackPlayerProps> = ({
  trackScale,
  frameCount,
  initialPlayStartFrame = 0,
  onPlayFrameChange,
  offsetLeft = 10
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [playStartFrame, setPlayStartFrame] = useState(initialPlayStartFrame)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackPointRef = useRef<HTMLDivElement>(null)
  const animationId = useRef<number | null>(null)

  const updateFrame = useCallback(
    (mouseX: number) => {
      if (!containerRef.current || !trackPointRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const frame = getSelectedFrame(
        mouseX - offsetLeft - rect.left,
        trackScale,
        30
      )
      const newFrame = Math.max(0, Math.min(frame - 1, frameCount))

      if (newFrame !== playStartFrame) {
        setPlayStartFrame(newFrame)
        onPlayFrameChange?.(newFrame)
        trackPointRef.current.style.transform = `translateX(${getGridPixel(
          trackScale,
          newFrame
        )}px)`
      }
    },
    [
      trackScale,
      frameCount,
      offsetLeft,
      onPlayFrameChange,
      getSelectedFrame,
      getGridPixel,
      playStartFrame
    ]
  )

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging) {
        if (!animationId.current) {
          animationId.current = requestAnimationFrame(() => {
            updateFrame(event.pageX)
            animationId.current = null
          })
        }
      }
    },
    [isDragging, updateFrame]
  )

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const onMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.cursor = ''
    if (animationId.current) {
      cancelAnimationFrame(animationId.current)
      animationId.current = null
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove, { passive: true }) // passive event listener
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
      }
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div ref={containerRef} style={{ touchAction: 'none' }}>
      <div
        ref={trackPointRef}
        className={`z-30 absolute -top-5 bottom-0 w-px bg-gray-700 dark:bg-blue-400 transition-transform duration-75 `}
        onMouseDown={onMouseDown}
      >
        <span
          className='playPoint block border  h-3 w-2.5  sticky top-0 right-0 left-0 cursor-pointer'
          style={{
            transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid currentColor',
            color: 'rgb(75, 85, 99)'
          }}
        />
      </div>
    </div>
  )
}

export default React.memo(Playhead)
