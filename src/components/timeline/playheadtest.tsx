import { useState, useRef, useEffect } from "react";

import React from "react";

const workerScript = `
let isPlaying = false;
let position = 0;
let lastTime = 0;

self.onmessage = function (e) {
  if ("isPlaying" in e.data) {
    isPlaying = e.data.isPlaying;
  }
  if ("position" in e.data) {
    position = e.data.position;
  }

  if (isPlaying) {
    lastTime = performance.now();
    requestAnimationFrame(updatePlayhead);
  }
  if(lastTime == e.data.position){
    console.log('lastime',lastTime)
  }
};

function updatePlayhead(timestamp) {
  if (!isPlaying) return;
  

  let deltaTime = timestamp - lastTime;
  let pixelsPerSecond = 100;
  let pixelsPerMs = pixelsPerSecond / 1000;
  position += deltaTime * pixelsPerMs;
  lastTime = timestamp;

  self.postMessage({ position });
  requestAnimationFrame(updatePlayhead);
}

`;

const createWorker = () => {
  const blob = new Blob([workerScript], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};

export default function Playhead() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const playheadRef = useRef<HTMLDivElement | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const isDragging = useRef(false);
  
    useEffect(() => {
      workerRef.current = createWorker();
      workerRef.current.onmessage = (e) => {
        setPosition(Math.min(e.data.position, 1000));
      };
  
      return () => {
        workerRef.current?.terminate();
      };
    }, []);
  
    const togglePlay = () => {
      setIsPlaying((prev) => {
        const newState = !prev;
        workerRef.current?.postMessage({ position, isPlaying: newState });
        return newState;
      });
    };
  
    const handleMouseDown = (e) => {
        e.preventDefault()
        setIsPlaying(false)
        workerRef.current?.postMessage({ isPlaying: false });
      isDragging.current = true;
    };
  
    const handleMouseMove = (event: MouseEvent) => {
        event.preventDefault()
      if (isDragging.current && playheadRef.current) {
        const rect = playheadRef.current.parentElement!.getBoundingClientRect();
        const newX = Math.min(Math.max(event.clientX - rect.left, 0), 1000);
        setPosition(newX);
      }
    };
  
    const handleMouseUp = () => {
      isDragging.current = false;
    };
  
    useEffect(() => {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, []);
  return (
    <div className="relative w-full h-16 bg-[#efefef] flex items-center px-4 border-t border-gray-700">

      <button onClick={togglePlay } className="mr-4 p-2 h-6 w-6 bg-[#e6e6e6] text-white rounded-sm hover:bg-gray-700">
     
      </button>
      <div className="relative w-full h-1 bg-gray-50 rounded-sm">
        <div
          ref={playheadRef}
          className="absolute w-2 h-6 bg-[#6e6e6e] rounded-sm cursor-grab "
          style={{ transform: `translateX(${position}px)` }}
          onMouseDown={ handleMouseDown}
        >
          <div className="absolute w-0.5 h-[100px] bg-gray-400 top-[-10px] left-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
}



