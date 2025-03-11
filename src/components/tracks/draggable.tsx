import React, { useRef, useState } from 'react'
import useTimeLineStore from '../../store/timelineStore'
import {
  AudioTrack,
  TrackItemType,
  TrackType,
  VideoTrack,
  ImageTrack
} from '../../types/trackType'
import { useTrackStateStore } from '../../store/trackStore'
import TimeLine from '../timeline/timeLine'
import { TrackRow } from '../../types/trackRowTypes'
import { nanoid } from 'nanoid'
import { TrackItem } from './trackItem'
const acceptedTypes = {
  AudioTrack: 'audio',
  VideoTrack: 'video',
  ImageTrack: 'image'
}

export const mockVidTracks: VideoTrack[] = [
    {
      id: 'video-track-1',
      name: 'Main Video',
      source: '/videos/main-video.mp4',
      index: 0,
      type: 'VIDEO',
      isVisible: true,
      isMuted: false,
      duration: 60, // seconds
      height: 720,
      width: 1280,
      color: '#3498db',
      startTime: 0,
      endTime: 60,
      inRowId: 'row-1',
      atTime: 0,
      format: 'mp4',
      frameCount: 1800, // assuming 30 fps
      position: {
        x: 0,
        y: 0,
      },
      transform: {
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      volume: 1,
      fps: 30,
    },
    {
      id: 'video-track-2',
      name: 'B-Roll',
      source: '/videos/b-roll.mov',
      index: 1,
      type: 'VIDEO',
      isVisible: true,
      isMuted: false,
      duration: 30,
      height: 1080,
      width: 1920,
      color: '#e74c3c',
      startTime: 70,
      endTime: 40,
      inRowId: 'row-1',
      atTime: 10,
      format: 'mov',
      frameCount: 900, // assuming 30 fps
      position: {
        x: 100,
        y: 50,
      },
      transform: {
        scaleX: 0.5,
        scaleY: 0.5,
        rotation: 180,
      },
      volume: 0.8,
      fps: 30,
    },
    {
      id: 'video-track-3',
      name: 'Overlay',
      source: '/videos/overlay.webm',
      index: 2,
      type: 'VIDEO',
      isVisible: true,
      isMuted: false,
      duration: 2,
      height: 360,
      width: 640,
      color: '#2ecc71',
      startTime: 180,
      endTime: 50,
      inRowId: 'row-2',
      atTime: 30,
      format: 'webm',
      frameCount: 600,
      position: {
        x: 500,
        y: 200,
      },
      transform: {
        scaleX: 1.2,
        scaleY: 1.2,
        rotation: 0,
      },
      volume: 0.5,
      fps: 30,
    },
    {
      id: 'video-track-4',
      name: 'Intro',
      source: '/videos/intro.mp4',
      index: 3,
      type: 'VIDEO',
      isVisible: true,
      isMuted: false,
      duration: 50,
      height: 1080,
      width: 1920,
      color: '#f39c12',
      startTime: 120,
      endTime: 5,
      inRowId: 'row-2',
      atTime: 0,
      format: 'mp4',
      frameCount: 150,
      position: {
        x: 0,
        y: 0,
      },
      transform: {
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      volume: 1,
      fps: 30,
    },
  ];
const DraggableTrack = () => {
  const zoomStore = useTimeLineStore()
  const trackStore = useTrackStateStore()
  const width = zoomStore.zoom
 
  const trackRows = trackStore.trackLines
  const items = trackStore.tracks
  const [draggedItem, setDraggedItem] = useState('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const timeLinetracks = trackStore.tracks
  const timeLineRef = useRef(null)

  //[todo]: add snap condition for snapping to grid
  const findValidPosition = (
    trackId: string,
    rawStartTime: number,
    duration: number,
    itemId: string,
   
  ) => {
    let startTime = Math.max(0, rawStartTime)

    if (!checkOverlap(trackId, startTime, duration, itemId)) {
      return startTime
    }

    let forwardPos = startTime
    let backwardPos = startTime

    const maxAttempts = 100
    let attempts = 0

    while (attempts < maxAttempts) {
      attempts++

      forwardPos += 1
      if (!checkOverlap(trackId, forwardPos, duration, itemId)) {
        return forwardPos
      }

      backwardPos = Math.max(0, backwardPos - 1)
      if (
        backwardPos >= 0 &&
        !checkOverlap(trackId, backwardPos, duration, itemId)
      ) {
        return backwardPos
      }
    }

    const lastItem = trackStore.tracks
      .filter(item => item.inRowId === trackId)
      .sort((a, b) => a.startTime + a.duration - (b.startTime + b.duration))
      .pop()

    return lastItem ? lastItem.startTime + lastItem.duration : 0
  }
const addTrackRows=() =>{
    trackStore.addRow({ id: 'track-1', acceptsType: 'MEDIA',trackItem: mockVidTracks  })
    console.log('id:',trackRows.map(item => (item.id) ))
}

  const checkOverlap = (
    rowId: string,
    startTime: number,
    duration: number,
    itemId : string
  ) => {
    for (const item of timeLinetracks) {
      if (item.id === itemId) continue

      if (item.inRowId !== rowId) continue

      const itemEnd = item.startTime + item.duration
      const newItemEnd = startTime + duration

      if (startTime < itemEnd && newItemEnd > item.startTime) {
        return true
      }
    }
    return false
  }
  const handleLibraryDragStart = (e: React.DragEvent,item: TrackItemType) => {}
  const handleTimeLineDragStart = (e: React.DragEvent, item: TrackItemType) => {
    const target = e.target as HTMLElement
    const trackJson = JSON.stringify(item)
    e.dataTransfer.setData('app/json',trackJson)
    
    setDraggedItem(item.id)

    setTimeout(() => {
      target.style.opacity = '0.4'
    }, 0)
  }
  const handleDrag = (e: React.DragEvent) => {
    const target = e.target as HTMLElement

    target.style.left = e.clientX - target.offsetWidth / 2 + 'px'
    target.style.top = e.clientY - target.offsetHeight / 2 + 'px'
    e.stopPropagation()
  }
  const handleDrop = (e: React.DragEvent, rowId: string,) => {
    e.preventDefault()

    const id = e.dataTransfer.getData('id')
    const trackRow = trackRows.find(tr => tr.id === rowId);
    if (!trackRow) return;
    
    const trackString = e.dataTransfer.getData("app/json");
  
  
    
    const track = JSON.parse(trackString) as TrackItemType;
   
    const isAccepted = ["audio","video","image"].includes(track.type)
    
    if ((isAccepted && trackRow.acceptsType !== "MEDIA") || 
        (!isAccepted && trackRow.acceptsType !== "TEXT" || "EFFECT" || "TRANSITION")) {
     
      return;
    }
    
  
    const timelineRect = timeLineRef.current.getBoundingClientRect();
    const dropX = e.clientX - timelineRect.left - dragOffset.x;    
    
    
    let rawStartTime = dropX / 10;
    
    
    if (track.source === 'timeline') {
      
      const existingItemIndex = trackRows.findIndex(track => track.id === rowId);
      
      if (existingItemIndex >= 0) {
       
        const validStartTime = findValidPosition(
          rowId, 
          rawStartTime, 
          100, 
          track.id
        );
        
        
        const updatedItems = [...items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          
          startTime: validStartTime
        };
        
        
      }
    } else {
     
      const validStartTime = findValidPosition(rowId, rawStartTime, 1000,track.id);
      
     
   
      const newTimelineItem = {
        acceptsType: track.type,
        id: nanoid(5),
        trackItem:track[0]
        
      } as TrackRow;
      trackStore.addRow( newTimelineItem)
     
    }
  }
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedItem('')
  }
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const hadleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
   <> 
 
        <div className="flex-1 bg-white rounded-lg border border-gray-300">
          <div className="flex">
            <div className="w-32 p-2 border-r border-gray-300">
              <div className="font-bold" onClick={addTrackRows}>Tracks</div>
            </div>
            
        
            <div className="flex-1 relative" style={{ height: '30px' }}>
                {/* <TimeLine ref={timeLineRef} duration={10000}/>               */}
            </div>
          </div>
          
     
          <div className="flex">
        
            <div className="w-32 flex flex-col">
              {
              trackStore.trackLines
              .map(track => (
                <div 
                  key={track.id}
                  className="p-2 border-t border-r border-gray-300 flex flex-col"
                  style={{ height: `${100}px` }}
                >
                  <div className="flex justify-between items-center">
                    <span>{track.id}</span>
                   
                  </div>
                  <div className="text-xs text-gray-500">
           
                  </div>
                </div>
              ))}
            </div>
            
          
            <div 
             
              className="flex-1 relative"
              style={{ 
                width: `${10000}px`,
                overflowX: 'auto'
              }}
            >
           
              
          
              <div >
                {trackRows.map((track, index) => (
                  <div 
                    key={track.id}
                    // className={`border-t border-gray-300 relative ${getTrackRowColor(track.type)}`}
                    // style={{ 
                    //   height: `${config.trackHeight}px`,
                    //   width: `${config.totalDuration * config.pixelsPerSecond}px`
                    // }}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, track.id)}
                  >
                    {/* Timeline items in this track */}
                    {trackRows
                      .filter(item => item.id === track.id)
                      .map(item => (
                       
                        item.trackItem.map(
                        
                        item => (
                            
                        <div
                        
                          key={item.id}
                   
                          style={{
                            position: 'absolute',
                            left: `${item.startTime * 10}px`,
                            top: '4px',
                            width: `${item.duration * 10}px`,
                            height: `${50}px`,
                            color: 'black'
                          }}
                          onDragStart={(e) => handleTimeLineDragStart(e,item) }
                          onDragEnd={handleDragEnd}
                          onDrag={handleDrag}
                          onDragLeave={handleDragLeave}
                          onDragEnter={handleDragEnter}


                          className={`bg-black text-white rounded p-1 overflow-hidden flex flex-col relative`}
                        >
                       
                        
                        
                        </div>
                        )  ) ))
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
          
 
        </div>
    
  </>
  )
}
export default DraggableTrack
