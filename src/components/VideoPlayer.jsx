
import React, { useEffect, useRef } from 'react';
import Canvas from './Canvas';



export default function VideoPlayer () {


  return (
 <div className='h-screen flex justify-center items-center overflow-hidden'>
  
  <div className='h-[500px] w-[860px] bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center absolute overflow-hidden   ' >
  
  <Canvas props=' h-[440px] w-[720px]  object-cover transition ease-in-out drop-shadow-xl  delay-150  hover:scale-125 hover:translate-y-32 hover:translate-x-32  duration-700 ' />
  {/* <video  
  src="src/components/video.mp4"
  autoPlay
  loop
  muted
  
  width="620"></video> */}
  </div>
  
 </div>
  );
};

