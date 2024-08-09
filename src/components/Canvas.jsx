
import React, { useRef, useEffect } from "react";

const Canvas = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    videoRef.current = document.createElement('video');
    const canvas = canvasRef.current;
    const video = videoRef.current;
    video.src = "src/components/flower.webm";
    video.autoPlay = true; 
    video.loop = true; 
    video.muted = true;

    if (!canvas || !video) {
      return;
    }

    const setCanvasSize = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    video.addEventListener("loadedmetadata", setCanvasSize);

    return () => video.removeEventListener("loadedmetadata", setCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
 
    

    if (!canvas || !video) {
      return;
    }

    const canvasCtx = canvas.getContext("2d");
 

    const grabNextFrame = () => {
      if (!video.paused && !video.ended) {
        canvasCtx.drawImage(video, 0, 0);
        requestAnimationFrame(grabNextFrame);
      }
    };

    video.addEventListener("play", grabNextFrame);
    video.play();
    return () => {
      video.removeEventListener("play", grabNextFrame);
    };
  }, []);

  return (
    <div>
    
      <canvas ref={canvasRef} style={{width: 300}} >
 
      </canvas>
    </div>
  );
};

export default Canvas;


