import { useState, useRef, useEffect } from 'react'

import React from 'react'
import usePlayerStore from '../../store/playerStore'
import { convertPixelsToSeconds, getPlayheadSpeed, getSecondsPerPixel } from '../../utils/helpers';
import useTimeLineStore from '../../store/timelineStore';

const workerScript = `
let isPlaying = false;
let position = 0;
let lastTime = 0;
let pixelsPerSecond = 100;

self.onmessage = function (e) {
  if ("isPlaying" in e.data) {
    isPlaying = e.data.isPlaying;
  }
  if ("position" in e.data) {
    position = e.data.position;
  }
  if ("pixelsPerSecond" in e.data) {
    pixelsPerSecond = e.data.pixelsPerSecond; 
  }

  if (isPlaying) {
    lastTime = performance.now();
    requestAnimationFrame(updatePlayhead);
  }
};

function updatePlayhead(timestamp) {
  if (!isPlaying) return;

  let deltaTime = timestamp - lastTime;
  let pixelsPerMs = pixelsPerSecond / 1000;
  position += deltaTime * pixelsPerMs;
  lastTime = timestamp;

  self.postMessage({ position });
  requestAnimationFrame(updatePlayhead);
}
`;

// const workerScript = `
// let isPlaying = false;
// let position = 0;
// let lastTime = 0;

// self.onmessage = function (e) {
//   if ("isPlaying" in e.data) {
//     isPlaying = e.data.isPlaying;
//   }
//   if ("position" in e.data) {
//     position = e.data.position;
//   }

//   if (isPlaying) {
//     lastTime = performance.now();
//     requestAnimationFrame(updatePlayhead);
//   }
//   if(lastTime == e.data.position){
//     console.log('lastime',lastTime)
//   }
// };

// function updatePlayhead(timestamp) {
//   if (!isPlaying) return;
  

//   let deltaTime = timestamp - lastTime;
//   let pixelsPerSecond = 100;
//   let pixelsPerMs = pixelsPerSecond / 1000;
//   position += deltaTime * pixelsPerMs;
//   lastTime = timestamp;

//   self.postMessage({ position });
//   requestAnimationFrame(updatePlayhead);
// }

// `

const createWorker = () => {
  const blob = new Blob([workerScript], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

export default function PlayheadNew () {
  const isPaused = usePlayerStore().isPaused
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const playheadRef = useRef<HTMLDivElement | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const isDragging = useRef(false)
  const playerStore = usePlayerStore()
  const zoom = useTimeLineStore().zoom
  useEffect(() => {
    workerRef.current = createWorker()
    workerRef.current.onmessage = e => {
      setPosition(Math.min(e.data.position, 1000))
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  // const togglePlay = () => {
  //   setIsPlaying(prev => {
  //     const newState = !prev
  //     workerRef.current?.postMessage({ position, isPlaying: newState })
  //     return newState
  //   })
  // }

  const handleMouseDown = e => {
    e.preventDefault()
    setIsPlaying(false)
    workerRef.current?.postMessage({ isPlaying: false })
    isDragging.current = true
  }

  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault()
    if (isDragging.current && playheadRef.current) {
      const rect = playheadRef.current.parentElement!.getBoundingClientRect()
      const newX = Math.min(Math.max(event.clientX - rect.left, 0), 1000)
      setPosition(newX)
      playerStore.setCurrentTime(newX)
      console.log('newX', newX)
      const time = convertPixelsToSeconds(zoom,newX)
      playerStore.setCurrentTime(time)
    }
  }
  useEffect(()=>{
    getPlayheadSpeed(zoom)
    console.log('speed', getPlayheadSpeed(zoom))
    console.log('zoom', zoom)
  },[zoom])
  
  useEffect(()=>{
    if ( playheadRef.current) {
    const rect = playheadRef.current.parentElement!.getBoundingClientRect()
    const newX = Math.min(Math.max(playheadRef.current.getBoundingClientRect().x - rect.left, 0), 1000)
    setPosition(newX)
    // const time = convertPixelsToSeconds(zoom,newX)
    // playerStore.setCurrentTime(time)
    }
    
  },[position])
  useEffect(() => {
    if (isPaused === false) {
      workerRef.current?.postMessage({ position, isPlaying: true,pixelsPerSecond: getPlayheadSpeed(zoom) })
    } else {
      workerRef.current?.postMessage({ position, isPlaying: false })
    }
  }, [isPaused])
  const handleMouseUp = () => {
    isDragging.current = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])
  return (
    <div className="relative w-full h-1 bg-gray-200 rounded-sm z-10">
  <div
    ref={playheadRef}
    className="absolute w-4 h-6 bg-gray-400 rounded-[4px] cursor-grab z-20 flex items-center justify-center"
    style={{ transform: `translateX(${position}px)` }}
    onMouseDown={handleMouseDown}
  >
    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-400"></div>
    <div className="absolute w-0.5 h-screen bg-gray-400 top-0 left-1/2 -translate-x-1/2"></div>
  </div>
</div>
  )
}
