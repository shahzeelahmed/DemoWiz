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


  async function addSpriteToRow (atTime: number, type: TrackRowType,spr: VisibleSprite) {
    const isSelected = rowStore.selectedRowId
    console.log('Selected Row:', isSelected)
    console.log('clip: ', clip)

    const id = nanoid(5)
    const itemToAdd: VideoTrack[] = [
      {
        id: id,
        name: 'track:',
        source: '/videos/sample.mp4',
        type: 'VIDEO',
        isVisible: true,
        isMuted: false,
        duration: 100,
        height: 720,
        width: 1280,
        color: '#3498db',
        startTime: 0,
        endTime: 50,
        inRowId: 'l',
        atTime: 0,
        format: 'mp4',
        frameCount: 900,
        position: { x: 0, y: 0 },
        transform: { scaleX: 1, scaleY: 1, rotation: 0 },
        volume: 1,
        fps: 30
      }
    ]

    if (isSelected === null) {
      const newRowId = nanoid(5)

      rowStore.addRow({
        id: newRowId,
        acceptsType: 'MEDIA',
        trackItem: itemToAdd
      })

      console.log('New row added:', newRowId)
    } else {
      if (!clip) {
        console.warn('Clip is null, cannot process MP4')
        return
      }

      const track = new MP4Clip(clip)
      const { duration } = await track.ready
      const itemStore = rowStore.tracks
      const updatedItems = [...itemStore]
      const existingItemIndex = itemStore.findIndex(
        item => item.id === isSelected
      )
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        inRowId: isSelected,
        duration: 50,
        startTime: 0,
        endTime: 50
      }

      rowStore.updateTrack(updatedItems)

      // rowStore.updateTrack(

      //   [...rowStore.tracks, ...itemToAdd]);

      console.log('Updated row with new track item:', isSelected)
    }

    console.log('Current Rows:', rowStore.trackLines)
    console.log(
      'Current tracks:',
      rowStore.tracks.map(e => e.id)
    )
  }


  return (
    <div className='relative h-lvh w-full flex'>

  <div className="absolute top-4 right-4 z-40">
    <Button  className="px-4 py-2 rounded-lg">
   <ExportIcon/>   EXPORT
    </Button>
  </div>
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
