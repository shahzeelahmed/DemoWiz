import React, { useRef, useEffect } from "react";
import VideoDecode from "./decoder";



const Canvas = ({props}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    videoRef.current = document.createElement('video');
    const canvas = canvasRef.current;
    const video = videoRef.current;
    video.src = "src/components/video2.mp4";
    video.crossOrigin = "crossorigin"; 
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
    video.play().then(()=>{
      console.log('video playing')
    }).catch((e)=>{
      console.log(e)
    });
    return () => {
      video.removeEventListener("play", grabNextFrame);
    };
  }, []);



  
  // async function getVideoPart2(){
  //   const init = {
  //     type: "key",
  //     data: videoBuffer,
  //     timestamp: 23000000,
  //     duration: 2000000,
  //     transfer: [videoBuffer],
  //   };
  //   const videoBuffer = new ArrayBuffer(video);
  //   chunk = new EncodedVideoChunk(init);
  //   const responses = await chunk;
  //   try{
  //     console.log('decoding...')
  //   for (const response of responses) {
  //     const chunk = new EncodedVideoChunk({
  //       timestamp: response.timestamp,
  //       type: response.key ? "key" : "delta",
  //       data: new Uint8Array(response.body),
  //     });
  //     decoder.decode(chunk);
  //   }}
  //   catch(e){
  //     console.log(e);
  //   }
  // }
  // getVideoPart2();
  return (
    
    
      // <canvas ref={canvasRef} className={props} >
     
 
      // </canvas>
      <VideoDecode videoPath="src/components/1678798893088_24d034f7469b5e79_x3JT9w.mp4"/>
    
  );
};

export default Canvas;


