import { AudioTrack, VideoTrack, ImageTrack } from '../../types/trackType'
import { TrackRow } from '../../types/trackRowTypes'
import { useTrackStateStore } from '../../store/trackStore'
import React, { useState } from 'react'
const mockTrackLines: TrackRow[] = [
  {
    id: 'string',
    type: 'MEDIA',
    index: 0,
    acceptsType: 'VIDEO',

    trackItem: [
      {
        name: 'test1',
        index: 0,
        isVisible: true,
        isMuted: false,
        id: 'test1',
        duration: 100,
        height: 20,
        width: 20,
        format: 'mp4',
        volume: 1,
        fps: 30,
        position: {
          x: 10,
          y: 10
        }
      },
      {
        name: 'test2',
        index: 0,
        isVisible: true,
        isMuted: false,
        id: 'test1',
        duration: 200,
        height: 20,
        width: 20,
        format: 'mp4',
        volume: 1,
        fps: 30,
        position: {
          x: 10,
          y: 10
        }
      }
    ]
  }
]

const TrackList = () => {
  const { addTrack, tracks } = useTrackStateStore()
  const [dragging, setDragging] = useState(false)
  const mock = mockTrackLines[0].trackItem[0] as VideoTrack
const [left,setLeft] = useState(0)
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    
    e.preventDefault()
    e.stopPropagation()
    const x = e.clientX
const y = e.clientY
console.log("coords",x,y)
    console.log('dragging')
   
    setDragging(true)
  }

const onDragOver =(e: React.DragEvent) =>{
  e.preventDefault()
  e.stopPropagation()
  const target = e.target as HTMLDivElement
    const rect = target.getBoundingClientRect().width
    const id = target.id
    console.log('element width:', rect)
    console.log('element id:', id)
}
const handleMouseMove = (e: React.DragEvent) => {
const x = e.clientX
const y = e.clientY
console.log("coords",x,y)
}
const handleMouseUp = (e: React.DragEvent) => {
  e.preventDefault()
  const target = e.target as HTMLDivElement
  const rect = target.getBoundingClientRect()
  
  setDragging(false)
console.log('mouse up')
}
  return (
    <div className='flex flex-col h-full mt-10 ' >
      <div className='w-44 bg-violet-400 h-10' draggable = 'true'   onDragStart={handleMouseMove} onDragEnd={handleMouseUp}>

      </div>
     <div className='bg-green-400 m-5 h-11 ' onDragOver={onDragOver} id='row1' style={{
      left: `${left}px`,
     }}>
      
    row 1
      
     </div>
     <div className="bg-purple-400 h-11 m-5 " onDragOver={onDragOver} id='row2'>
     row 2
     </div>
     
    </div>
  )
}

export default TrackList

const mockVideoTrack = (id: string): VideoTrack => ({
  id,
  name: 'video2',
  isMuted: false,
  isVisible: true,
  frameCount:100,
  index: 0,
  type: 'video',
  duration: Math.floor(Math.random() * 60) + 10,
  height: 1080,
  width: 1920,
  format: 'mp4',
  volume: 1,
  fps: 30,
  position: {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100)
  },
  transform: {
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  }
})

const mockImageTrack = (id: string): ImageTrack => ({
  id,
  frameCount:100,
  type: 'image',
  name: 'png1',
  isVisible: true,
  atTime: 50,
  index: 0,
  height: 800,
  width: 600,
  format: 'png',
  position: {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100)
  },
  transform: {
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  }
})

const mockAudioTrack = (id: string): AudioTrack => ({
  id,
  frameCount:100,
  name: 'audio1',
  type: 'audio',
  index: 0,
  duration: Math.floor(Math.random() * 60) + 10,
  volume: 0.8,
  format: 'mp3'
})

export const mockTrackRows: TrackRow[] = [
  {
    id: 'row-1',
    acceptsType: 'VIDEO',
    index: 0,
    type: 'MEDIA',
    trackItem: [mockVideoTrack('video-1'), mockVideoTrack('video-2')]
  },
  {
    id: 'row-2',

    acceptsType: 'IMAGE',
    type: 'MEDIA',
    index: 1,
    trackItem: [
      mockImageTrack('image-1'),
      mockImageTrack('image-2'),
      mockImageTrack('image-3')
    ]
  },
  {
    id: 'row-3',
    acceptsType: 'AUDIO',
    type: 'MEDIA',
    index: 2,
    trackItem: [mockAudioTrack('audio-1'), mockAudioTrack('audio-2')]
  }
]
