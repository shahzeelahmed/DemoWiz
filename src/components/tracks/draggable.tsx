//[todo]: implement drop preview
import React, { useEffect, useRef, useState } from 'react'

import { TrackItemType, VideoTrack } from '../../types/trackType'
import { useTrackStateStore } from '../../store/trackStore'
import { nanoid } from 'nanoid'
import { randInt } from 'three/src/math/MathUtils.js'
import { loadFile } from '../../utils/helpers'
import usePlayerStore from '../../store/playerStore'
import TimeLine from '../timeline/timeLine'
import { Button } from '../ui/button'
import PlayheadNew from '../timeline/playheadtest'

const DraggableTrack = () => {
  const trackStore = useTrackStateStore()
  const trackRows = trackStore.trackLines
  const items = trackStore.tracks
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const timeLinetracks = trackStore.tracks
  const itemStore = trackStore.tracks
  const rowRef = useRef<HTMLDivElement | null>(null)
  const [duration, setDuration] = useState(0)
  const playerStore = usePlayerStore()
  const totalDuration = playerStore.duration
  const [zoom, setZoom] = useState(1)
  // const checkOverlap = (
  //   trackId: string,
  //   startTime: number,
  //   duration: number,
  //   itemId: string
  // ) => {
  //   for (const item of itemStore) {
  //     if (item.id === itemId) continue

  //     if (item.inRowId !== trackId) continue

  //     const itemEnd = item.startTime + item.duration
  //     const newItemEnd = startTime + duration

  //     if (startTime < itemEnd && newItemEnd > item.startTime) {
  //       return true
  //     }
  //   }
  //   return false
  // }

  useEffect(() => {
    const getDuration = () => {
      if (itemStore && itemStore.length > 0) {
        let maxEndTime = 0

        for (const item of itemStore) {
          if (
            item &&
            typeof item.endTime === 'number' &&
            item.endTime > maxEndTime
          ) {
            maxEndTime = item.endTime
          }
        }

        setDuration(maxEndTime)
        playerStore.setDuration(maxEndTime)
        console.log('maxDur', maxEndTime)
      } else {
        setDuration(0)
        playerStore.setDuration(0)
        console.log('error')
      }
    }

    getDuration()
  }, [itemStore, duration])
  //[todo]: add snap condition for snapping to grid
//   const findValidPosition = (
//     rowId: string,
//     rawStartTime: number,
//     duration: number,
//     itemId: string,
//     itemStore: any[] // Assuming itemStore is accessible
// ) => {
//     let startTime = Math.max(0, rawStartTime);

//     if (!checkOverlap(rowId, startTime, duration, itemId, itemStore)) {
//         return startTime;
//     }

//     let forwardPos = startTime;
//     let backwardPos = startTime;
//     const timeIncrement = 1; // Define a small unit of time for searching
//     const maxAttempts = 100;
//     let attempts = 0;

//     while (attempts < maxAttempts) {
//         attempts++;

//         forwardPos += timeIncrement;
//         if (!checkOverlap(rowId, forwardPos, duration, itemId, itemStore)) {
//             return forwardPos;
//         }

//         backwardPos -= timeIncrement;
//         if (
//             backwardPos >= 0 &&
//             !checkOverlap(rowId, backwardPos, duration, itemId, itemStore)
//         ) {
//             return backwardPos;
//         }
//     }

//     const lastItem = itemStore
//         .filter(item => item.inRowId === rowId)
//         .sort((a, b) => (a.startTime + a.duration) - (b.startTime + b.duration))
//         .pop();

//     return lastItem ? lastItem.startTime + lastItem.duration : 0;
// };
//new
const checkOverlap = (
    trackId: string,
    startTime: number,
    duration: number,
    itemId: string,
  
) => {
    for (const item of itemStore) {
        if (item.id === itemId) continue;

        if (item.inRowId !== trackId) continue;

        const itemEnd = item.startTime + item.duration;
        const newItemEnd = startTime + duration;

        if (startTime < itemEnd && newItemEnd > item.startTime) {
            return true;
        }
    }
    return false;
};
//new
const findValidPosition = (
  rowId: string,
  rawStartTime: number,
  duration: number,
  itemId: string,
  snapThreshold: number = 1
) => {
  let startTime = Math.max(0, rawStartTime);
  let snappedTime = startTime;
  let isSnapped = false;

 
  for (const otherItem of itemStore) {
      if (otherItem.id === itemId || otherItem.inRowId !== rowId) {
          continue;
      }

      const otherItemStart = otherItem.startTime;
      const otherItemEnd = otherItem.startTime + otherItem.duration;

    
      if (Math.abs(startTime - otherItemStart) <= snapThreshold) {
          snappedTime = otherItemStart;
          isSnapped = true;
          break; 
      }

    
      if (Math.abs(startTime - otherItemEnd) <= snapThreshold) {
          snappedTime = otherItemEnd;
          isSnapped = true;
          break;
      }

      
      const newItemEnd = startTime + duration;
      const snappedNewItemEnd = snappedTime + duration;

      if (Math.abs(newItemEnd - otherItemStart) <= snapThreshold) {
          snappedTime = otherItemStart - duration;
          isSnapped = true;
          break;
      }

      if (Math.abs(newItemEnd - otherItemEnd) <= snapThreshold) {
          snappedTime = otherItemEnd - duration;
          isSnapped = true;
          break;
      }
  }

  if (isSnapped) {
      if (!checkOverlap(rowId, snappedTime, duration, itemId, )) {
          return snappedTime;
      }
    
      let pos = snappedTime;
      while (checkOverlap(rowId, pos, duration, itemId, ) && pos < Number.MAX_SAFE_INTEGER) {
          pos += 0.1; 
      }
      return pos;
  }

  
  if (!checkOverlap(rowId, startTime, duration, itemId, )) {
      return startTime;
  }

  let forwardPos = startTime;
  let backwardPos = startTime;
  const timeIncrement = 0.1;
  const maxAttempts = 200;
  let attempts = 0;

  while (attempts < maxAttempts) {
      attempts++;

      forwardPos += timeIncrement;
      if (!checkOverlap(rowId, forwardPos, duration, itemId, )) {
          return forwardPos;
      }

      backwardPos -= timeIncrement;
      if (
          backwardPos >= 0 &&
          !checkOverlap(rowId, backwardPos, duration, itemId, )
      ) {
          return backwardPos;
      }
  }

  const lastItem = itemStore
      .filter(item => item.inRowId === rowId)
      .sort((a, b) => (a.startTime + a.duration) - (b.startTime + b.duration))
      .pop();

  return lastItem ? lastItem.startTime + lastItem.duration : 0;
};

  // const findValidPosition = (
  //   rowId: string,
  //   rawStartTime: number,
  //   duration: number,
  //   itemId: string
  // ) => {
  //   let startTime = Math.max(0, rawStartTime)

  //   if (!checkOverlap(rowId, startTime, duration, itemId)) {
  //     return startTime
  //   }
  //   let forwardPos = startTime
  //   let backwardPos = startTime

  //   const maxAttempts = 100
  //   let attempts = 0

  //   while (attempts < maxAttempts) {
  //     attempts++

  //     forwardPos += 0
  //     if (!checkOverlap(rowId, forwardPos, duration, itemId)) {
  //       return forwardPos
  //     }
  //     backwardPos = backwardPos
  //     if (
  //       backwardPos >= 0 &&
  //       !checkOverlap(rowId, backwardPos, duration, itemId)
  //     ) {
  //       return backwardPos
  //     }
  //   }

  //   const lastItem = itemStore
  //     .filter(item => item.inRowId === rowId)
  //     .sort((a, b) => a.startTime + a.duration - (b.startTime + b.duration))
  //     .pop()

  //   return lastItem ? lastItem.startTime + lastItem.duration : 0
  // }

  const addTrackRows = () => {
    const trackId = nanoid(5)
    const rowId = nanoid(5)
    const start = randInt(0, 100)
    const dur = randInt(0, 100)
    const newTrack: VideoTrack[] = [
      {
        id: trackId,
        name: 'track:' + `${trackId}`,
        source: '/videos/sample.mp4',
        index: trackRows.length,
        type: 'VIDEO',
        isVisible: true,
        isMuted: false,
        duration: dur,
        height: 720,
        width: 1280,
        color: '#3498db',
        startTime: start,
        endTime: 50,
        inRowId: rowId,
        atTime: 0,
        format: 'mp4',
        frameCount: 900,
        position: { x: 0, y: 0 },
        transform: { scaleX: 1, scaleY: 1, rotation: 0 },
        volume: 1,
        fps: 30
      }
    ]

    console.log(start)
    trackStore.addRow({ id: rowId, acceptsType: 'MEDIA', trackItem: newTrack })
    trackStore.addTrack(newTrack)
  }

  //[todo]: implement drag from library
  const handleLibraryDragStart = (e: React.DragEvent, item: TrackItemType) => {}
  const handleTimeLineDragStart = (e, item: TrackItemType) => {
    const rect = e.target.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })

    const trackJson = JSON.stringify(item)
    e.dataTransfer.setData('app/json', trackJson)

    console.log(item.name)

    setTimeout(() => {
      e.target.style.opacity = '0.4'
    }, 0)
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, rowId: string) => {
    e.preventDefault()

    const trackRow = trackRows.find(tr => tr.id === rowId)
    if (!trackRow) return
    const trackString = e.dataTransfer.getData('app/json')

    const trackItem = JSON.parse(trackString) as TrackItemType

    const rowRect = rowRef.current.getBoundingClientRect()

    const dropX = e.clientX - rowRect.left - dragOffset.x

    let rawStartTime = dropX / 10
    let endTime = rawStartTime + trackItem.duration

    const existingItemIndex = itemStore.findIndex(
      item => item.id === trackItem.id
    )
    console.log('index:', existingItemIndex)

    if (existingItemIndex >= 0) {
      const existingItemIndex = itemStore.findIndex(
        item => item.id === trackItem.id
      )

      if (existingItemIndex >= 0) {
        const validStartTime = findValidPosition(
          rowId,
          rawStartTime,
          trackItem.duration,
          trackItem.id
        )
        console.log('valid::', validStartTime)
        console.log('raw:', rawStartTime)

        const updatedItems = [...itemStore]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          inRowId: rowId,
          startTime: validStartTime,
          endTime: endTime
        }

        trackStore.updateTrack(updatedItems)
      }
    }
  }
  const handleDragEnd = e => {
    e.target.style.opacity = '1'
    e.stopPropagation()
  }

  const handleDragOver = e => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  useEffect(() => {
    itemStore
  }, [itemStore])

//   return (

// //     <div className="bg-white rounded-sm border border-gray-300 w-full h-full relative">
  
// //   <div className="absolute top-0 left-0 w-full bg-white z-10 p-2 flex gap-2 border-b border-gray-300">
// //     <Button className="font-bold" onClick={addTrackRows}>
// //       Tracks
// //     </Button>
// //     <Button onClick={() => { zoom === 1 ?  zoom : setZoom(zoom + 0.1); }}>
// //       Zoom In
// //     </Button>
// //     <Button onClick={() => { zoom === 0.10000000000000014 ? zoom : setZoom(zoom - 0.1); }}>
// //       Zoom Out
// //     </Button>
// //   </div>


// //   <div className="overflow-auto w-full h-full pt-12 ">
    
// //     <TimeLine duration={1000} zoom={zoom} />
   
// //     <div className="flex flex-col min-w-max min-h-max space-y-4 overflow-auto"></div>

// //     <div className="flex">
// //       <div className="flex-1 relative" style={{ width: `${totalDuration}px` }}>
// //         <div>
// //           {trackRows.map(track => {
// //             const isSelected = trackStore.selectedRowId === track.id;
// //             return (
// //               <div
// //                 ref={rowRef}
// //                 key={track.id}
// //                 className={`border-t border-gray-300 relative cursor-pointer ${isSelected ? 'bg-blue-200' : ''}`}
// //                 style={{ height: `70px`, width: `${1000 * 10}px` }}
// //                 onClick={() => trackStore.selectRow(isSelected ? null : track.id)}
// //                 onDragOver={handleDragOver}
// //                 onDrop={e => handleDrop(e, track.id)}
// //               >
// //                 {itemStore.filter(item => item.inRowId === track.id).map(item => (
// //                   <div
// //                     key={item.id}
// //                     draggable
// //                     style={{
// //                       position: 'absolute',
// //                       left: `${item.startTime * 10}px`,
// //                       top: '4px',
// //                       width: `${item.duration * 10}px`,
// //                       height: `60px`,
// //                     }}
// //                     onDragStart={e => handleTimeLineDragStart(e, item)}
// //                     onDragEnd={handleDragEnd}
// //                     className={`${item.type} bg-black text-white rounded-sm p-1 overflow-hidden flex flex-col relative`}
// //                   ></div>
// //                 ))}
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // </div>


//   )

const timelineRef = useRef<HTMLDivElement>(null);
const trackContainerRef = useRef<HTMLDivElement>(null);

const syncScroll = () => {
  if (timelineRef.current && trackContainerRef.current) {
    timelineRef.current.scrollLeft = trackContainerRef.current.scrollLeft;
  }
};

return (
 
  <div className="bg-white rounded-sm border border-gray-300 w-full h-full relative">
    <div className="absolute top-0 left-0 w-full bg-white z-10 p-2 flex gap-2 border-b border-gray-300 overflow-hidden">
      <button className="font-bold" onClick={addTrackRows}>
        Tracks
      </button>
      <button onClick={() => setZoom(zoom + 0.1)}>
        Zoom In
      </button>
      <button onClick={() => setZoom(zoom - 0.1)}>
        Zoom Out
      </button>
    </div>

    {/* Timeline ruler - Scrollable only in X direction */}
   
    <div ref={timelineRef} className=" w-full pt-12 ">
   
      <TimeLine duration={1000} zoom={zoom} />
    </div>

    {/* Tracks container - Scrollable in both X and Y */}
    <div
      ref={trackContainerRef}
      className="overflow-auto w-full h-full"
      onScroll={syncScroll}
    >
      <div className="min-w-max">
        {trackRows.map((track) => {
          const isSelected = trackStore.selectedRowId === track.id;
          return (
            <div
            ref={rowRef}
              key={track.id}
              className={`border-t border-gray-300 relative cursor-pointer ${isSelected ? "bg-blue-200" : ""}`}
              style={{ height: `50px`, width: `${1000 * 10}px` }}
              onClick={() => trackStore.selectRow(isSelected ? null : track.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, track.id)}
            >
              {itemStore
                .filter((item) => item.inRowId === track.id)
                .map((item) => (
                  <div
                    key={item.id}
                    draggable
                    style={{
                      position: "absolute",
                      left: `${item.startTime * 10}px`,
                      top: "4px",
                      width: `${item.duration * 10}px`,
                      height: `38px`,
                    }}
                    onDragStart={(e) => handleTimeLineDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`${item.type} bg-black text-white rounded-sm p-1 overflow-hidden flex flex-col relative`}
                  ></div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
}
export default DraggableTrack
