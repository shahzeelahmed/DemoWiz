import React, { useState, useEffect, useRef } from 'react';


// const TimelinePlayhead = () => {
//   const [position, setPosition] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const containerRef = useRef(null);
//   const requestRef = useRef();
//   const startTimeRef = useRef();
//   const lastPositionRef = useRef(0);
//   const timelineWidth = 600;
//   const pixelsPerSecond = 0.1; 
  
//   useEffect(() => {
   
//     lastPositionRef.current = position;
//   }, [position]);
  
//   useEffect(() => {
//     if (isPlaying) {
     
//       startTimeRef.current = performance.now();
//       lastPositionRef.current = position;
      
//       const animate = () => {
//         const now = performance.now();
//         const elapsedSeconds = (now - startTimeRef.current) / 1000;
//         const expectedPosition = lastPositionRef.current + (elapsedSeconds * pixelsPerSecond);
        
//         const newPosition = Math.min(expectedPosition, timelineWidth);
        
        
//         setPosition(newPosition);
        
       
//         if (newPosition >= timelineWidth) {
//           setIsPlaying(false);
//           return;
//         }
        
//         requestRef.current = requestAnimationFrame(animate);
//       };
      
//       requestRef.current = requestAnimationFrame(animate);
//     }
    
//     return () => {
//       if (requestRef.current) {
//         cancelAnimationFrame(requestRef.current);
//       }
//     };
//   }, [isPlaying]);
  
//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
   
//     setIsPlaying(false);
    
//     updatePosition(e);
    
   
//     window.addEventListener('mousemove', handleMouseMove);
//     window.addEventListener('mouseup', handleMouseUp);
//   };
  
//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     updatePosition(e);
//   };
  
//   const updatePosition = (e) => {
//     if (!containerRef.current) return;
    
//     const rect = containerRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const newPos = Math.max(0, Math.min(x, timelineWidth));
//     setPosition(newPos);
//   };
  
//   const handleMouseUp = () => {
//     setIsDragging(false);
//     window.removeEventListener('mousemove', handleMouseMove);
//     window.removeEventListener('mouseup', handleMouseUp);
//   };
  
//   const togglePlayPause = () => {
  
//     startTimeRef.current = performance.now();
//     lastPositionRef.current = position;
//     setIsPlaying(!isPlaying);
//   };
  

//   const handleTouchStart = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//     setIsPlaying(false);
    
//     if (e.touches && e.touches[0]) {
//       updateTouchPosition(e.touches[0]);
//     }
    
//     window.addEventListener('touchmove', handleTouchMove, { passive: false });
//     window.addEventListener('touchend', handleTouchEnd);
//   };
  
//   const handleTouchMove = (e) => {
//     e.preventDefault();
//     if (!isDragging) return;
    
//     if (e.touches && e.touches[0]) {
//       updateTouchPosition(e.touches[0]);
//     }
//   };
  
//   const updateTouchPosition = (touch) => {
//     if (!containerRef.current) return;
    
//     const rect = containerRef.current.getBoundingClientRect();
//     const x = touch.clientX - rect.left;
//     const newPos = Math.max(0, Math.min(x, timelineWidth));
//     setPosition(newPos);
//   };
  
//   const handleTouchEnd = () => {
//     setIsDragging(false);
//     window.removeEventListener('touchmove', handleTouchMove);
//     window.removeEventListener('touchend', handleTouchEnd);
//   };
  
//   return (
//     <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
//       <div 
//         ref={containerRef}
//         className="relative w-full h-12 bg-gray-200 rounded cursor-pointer"
//         style={{ width: `${timelineWidth}px` }}
//         onClick={(e) => {
         
//           updatePosition(e);
//         }}
//       >
      
//         <div className="absolute top-0 left-0 w-full h-full">
         
     
       
//           <div 
//             className="absolute top-0 w-2 h-full bg-red-500 z-10"
//             style={{ left: `${position}px` }}
//           >
//             <div 
//               className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full cursor-grab active:cursor-grabbing"
//               onMouseDown={handleMouseDown}
//               onTouchStart={handleTouchStart}
//             ></div>
//           </div>
//         </div>
//       </div>
      
     
//       <div className="flex items-center gap-4">
//         <button 
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//           onClick={togglePlayPause}
//         >
//           {isPlaying ? 'Pause' : 'Play'}
//         </button>
//         <div className="text-sm">
//           Position: {Math.round(position)}px
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TimelinePlayhead;


// Create a Web Worker script
const workerScript = `
self.onmessage = function (e) {
  if (e.data === "start") {
    let lastTime = performance.now();
    let position = 0;
    const pixelsPerSecond = 10;
    const pixelsPerMs = pixelsPerSecond / 1000;
    
    function update(timestamp) {
      const deltaTime = timestamp - lastTime;
      position += deltaTime * pixelsPerMs;
      lastTime = timestamp;
      self.postMessage(position);
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
};
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
      // Initialize the Web Worker
      workerRef.current = new Worker(new URL('./playHeadWorker.js', import.meta.url), {type: "module"});
  
      workerRef.current.onmessage = (e) => {
        setPosition(Math.min(e.data.position, 500)); // Stop at 500px
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
  
    const handleMouseDown = () => {
      isDragging.current = true;
    };
  
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.current && playheadRef.current) {
        const rect = playheadRef.current.parentElement!.getBoundingClientRect();
        const newX = Math.min(Math.max(event.clientX - rect.left, 0), 500);
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
     <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
     
      
        <div className="absolute top-0 left-0 w-full h-full">
         
     
       
          <div 
            className="absolute top-0 w-2 h-full bg-red-500 z-10"
            style={{ left: `${position}px` }}
          >
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
             
            ></div>
          </div>
        </div>
   
      
     
      <div className="flex items-center gap-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={togglePlay}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="text-sm">
          Position: {Math.round(position)}px
        </div>
      </div>
    </div>
    );
}
