// import React, { useEffect, useRef, useState } from 'react';
// import video from "./flower.webm"
// const VideoZoom = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [zoom, setZoom] = useState(1);
//   const [videoLoaded, setVideoLoaded] = useState(false);

//   useEffect(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     const drawVideo = () => {
//       if (video.paused || video.ended) return;

      
      

//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.save();
//       ctx.translate(canvas.width / 2, canvas.height / 2);
//       ctx.scale(zoom, zoom);
//       ctx.translate(-canvas.width / 2, -canvas.height / 2);
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       ctx.restore();

//       requestAnimationFrame(drawVideo);
//     };

//     const handleVideoLoad = () => {
//       console.log('Video loaded');
//       setVideoLoaded(true);
//       video.play().catch(e => console.error("Video play failed:", e));
//     };

//     video.addEventListener('loadeddata', handleVideoLoad);
//     video.addEventListener('play', drawVideo);

//     return () => {
//       video.removeEventListener('loadeddata', handleVideoLoad);
//       video.removeEventListener('play', drawVideo);
//     };
//   }, [zoom]);

//   const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
//   const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

//   return (
//     <div>
//       <video
//         ref={videoRef}
//         src="src/components/flower.webm"
//         controls
//         crossOrigin="anonymous"
//         style={{ display: videoLoaded ? 'none' : 'block' }}
//       />
//       <canvas ref={canvasRef} width="800" height="600" />
//       <div>
//         <button onClick={handleZoomIn}>Zoom In</button>
//         <button onClick={handleZoomOut}>Zoom Out</button>
//       </div>
//     </div>
//   );
// };

// export default VideoZoom;

import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Stage, Sprite } from '@pixi/react';


const VideoEditor = () => {
  const videoRef = useRef(null);
  const textureRef = useRef(null);




useEffect(() => {
    async function    fetchtexture(){
            textureRef.current =  await PIXI.Assets.load('src/components/flower.webm')
        }
        fetchtexture()
      
      }, []);


  return (
    <Stage width={800} height={600} options={{ backgroundColor: 0x10bb99 }}>
      {textureRef.current && <Sprite texture={textureRef.current} />}
    </Stage>
  );
};

export default VideoEditor;