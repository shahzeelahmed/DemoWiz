import { useEffect, useRef,useState } from "react"
export function Canvas(){


    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
  
    const handlePlay = () => {
        const loop = () => {
          if (!video.paused && !video.ended) {
            const videoRatio = video.videoWidth / video.videoHeight;
            const canvasRatio = canvas.width / canvas.height;
  
            let scaleX = 1;
            let scaleY = 1;
  
            if (videoRatio > canvasRatio) {
              scaleY = canvas.width / video.videoWidth;
              scaleX = scaleY;
            } else {
              scaleX = canvas.height / video.videoHeight;
              scaleY = scaleX;
            }
  
            const x = (canvas.width - video.videoWidth * scaleX) / 2;
            const y = (canvas.height - video.videoHeight * scaleY) / 2;
  
            ctx.drawImage(video, x, y, video.videoWidth * scaleX, video.videoHeight * scaleY);
            requestAnimationFrame(loop);
          }
        };
        loop();
      };
  
      video.addEventListener('play', handlePlay);
  
      return () => {
        video.removeEventListener('play', handlePlay);
      };
    }, [videoRef]);
  
    
    return(<div>
        <canvas ref={canvasRef} width="500" height="400" />
        <video ref={videoRef} width="320" height="240" muted autoPlay loop>
          <source src="src/components/flower.webm" type="video/mp4" />
        </video>
        
      </div>)
}