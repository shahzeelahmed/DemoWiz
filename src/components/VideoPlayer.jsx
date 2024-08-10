
import React, { useEffect, useRef } from 'react';
import Canvas from './Canvas';



export default function VideoPlayer () {


  return (
 <div className='h-screen flex justify-center items-center overflow-hidden'>
  
  <div className='h-xl w-xl bg-slate-100 flex items-center justify-center absolute overflow-hidden   ' >
  <Canvas props='h-xl w-xl absolute z-1  transition ease-in-out drop-shadow-4xl  delay-150  hover:translate-y-40 hover:translate-x-60 hover:scale-150 duration-700 rounded ' />
 
  </div>
  
 </div>
  );
};

