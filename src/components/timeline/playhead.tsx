import React, { useRef, useState, useEffect, useCallback,  } from 'react'
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

export default Playhead
// import React, { useRef, useState, useEffect, useCallback } from 'react';

// const Playhead = ({ zoom, duration, currentTime, onTimeUpdate }) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const playheadRef = useRef(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const animationIdRef  = useRef<number | null>(null);

//   const BASE_TICK_SPACING = 3;

//   const updatePlayheadPosition = useCallback((mouseX) => {
//     if (!containerRef.current) return;

//     const rect = containerRef.current.getBoundingClientRect();
//     const relativeX = mouseX - rect.left;
//     const newTime = Math.max(0, Math.min(relativeX / (BASE_TICK_SPACING * zoom * 10), duration));

//     onTimeUpdate(newTime);
//   }, [zoom, duration, onTimeUpdate]);

//   const handleMouseMove = useCallback((event) => {
//     if (isDragging) {
//       if (!animationIdRef.current) {
//         animationIdRef.current = requestAnimationFrame(() => {
//           updatePlayheadPosition(event.clientX);
//           animationIdRef.current = null;
//         });
//       }
//     }
//   }, [isDragging, updatePlayheadPosition]);

//   const handleMouseDown = useCallback((event) => {
//     event.stopPropagation();
//     setIsDragging(true);
//   }, []);

//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false);
//     if (animationIdRef.current) {
//       cancelAnimationFrame(animationIdRef.current);
//       animationIdRef.current = null;
//     }
//   }, []);

//   useEffect(() => {
//     document.addEventListener('mousemove', handleMouseMove, { passive: true });
//     document.addEventListener('mouseup', handleMouseUp);

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//       if (animationIdRef.current) {
//         cancelAnimationFrame(animationIdRef.current);
//       }
//     };
//   }, [handleMouseMove, handleMouseUp]);

//   return (
//     <div ref={containerRef} className="relative w-full h-10 bg-gray-800">
//       <div
//         ref={playheadRef}
//         className="absolute top-0 h-full w-1 bg-red-500 cursor-ew-resize"
//         style={{ left: `${currentTime * BASE_TICK_SPACING * zoom * 10}px` }}
//         onMouseDown={handleMouseDown}
//       >
//         <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-500 mx-auto mt-[-4px]"></div>
//       </div>
//     </div>
//   );
// };

// export default Playhead;
