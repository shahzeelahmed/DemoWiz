import './App.css'
import React, { useEffect, useRef, useState } from 'react'
import Playhead from './components/timeline/playheadtest'
import DraggableTrack from './components/tracks/draggable'
import { AVCanvas } from '@webav/av-canvas'
import { useTrackStateStore } from './store/trackStore'
import ExportIcon from '@/frappe-ui/icons/export'
import {
  AudioClip,
  Combinator,
  ImgClip,
  MP4Clip,
  OffscreenSprite,
  VisibleSprite,
  createChromakey,
  renderTxt2ImgBitmap
} from '@webav/av-cliper'
import { nanoid } from 'nanoid'
import { TrackRow, TrackRowType } from './types/trackRowTypes'
import { TrackItemType, VideoTrack } from './types/trackType'
import { loadFile } from './utils/helpers'
import appIcon from '@/frappe-ui/icons/appIcon.svg'

import { Button } from './components/ui/button'
import Slider from './components/ui/slider'
import { randInt } from 'three/src/math/MathUtils.js'
import { createZoomBlurShader } from './effects/createMotionBlur'
import Player from './components/player/player'
import TimeLine from './components/timeline/timeLine'
import usePlayerStore from './store/playerStore'
import SideBar from './frappe-ui/sideBar'

export default function App () {
  const [avCanvas, setAvCanvas] = useState<AVCanvas | null>(null)
  const [playing, setPlaying] = useState(false)
  const rowStore = useTrackStateStore()
  const [videoClip, setVideoClip] = useState<MP4Clip | null>(null)
  const [clip, setClip] = useState<ReadableStream<Uint8Array> | null>(null)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const items = rowStore.tracks
  const [cvsWrapEl, setCvsWrapEl] = useState<HTMLDivElement | null>(null)
  const totalDuration = usePlayerStore().duration


 

  return (
    <div className='relative h-lvh w-full flex '>
     
     
    <img src={appIcon} height={32} width={32} alt="App Icon" className='absolute left-2 top-2 ' />
    <Button className="absolute  rounded-lg right-2 top-2" >
      <ExportIcon /> EXPORT
    </Button>

 
    <div className='relative z-0 mt-10'>
      <SideBar />
  
  </div>

  <div className="flex-1 flex flex-col overflow-hidden relative mt-10">
    <Player />
 
    <div className="w-full h-full relative">
      <div className=' flex justify-items-start flex-row w-screen h-full z-50 pointer-events-auto'>
        <DraggableTrack />
      </div>
    </div>
  </div>
</div>








  //   <div className='flex h-lvh z-0  '>
    
  //   <SideBar />
  
  //   <div className="flex-1 flex flex-col overflow-hidden">
  //   <Player />
 
  
  
  // <div className=" w-full h-full ">

    
  //     <div className='ml-2 z-10 absolute '>
      
  //     </div>
  //     <div className='w-full h-full z-10  '>
  //               <DraggableTrack />
  //               </div>
  //           </div>
  //     </div>
  //   </div>
//   <div className='relative h-lvh flex'>
//   <div className='absolute z-10'>
//     <SideBar />
//   </div>
//   <div className="flex flex-col overflow-hidden ml-[var(--sidebar-width)]">
//     <Player />
//     <div className="w-full h-full relative">
//       <div className=' w-full h-full z-10'>
//         <DraggableTrack />
//       </div>
//     </div>
//   </div>
// </div>


  )
}
