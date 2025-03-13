//[todo]: implement drop preview
import React, { useRef, useState } from 'react'

import { TrackItemType, VideoTrack } from '../../types/trackType'
import { useTrackStateStore } from '../../store/trackStore'
import { nanoid } from 'nanoid'
import { randInt } from 'three/src/math/MathUtils.js'

const DraggableTrack = () => {
 
  const trackStore = useTrackStateStore()
  const trackRows = trackStore.trackLines
  const items = trackStore.tracks
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const timeLinetracks = trackStore.tracks
  const itemStore = trackStore.tracks
  const rowRef = useRef<HTMLDivElement | null>(null)
  const [duration,setDuration] = useState(0)
  async function loadFile(accept: Record<string, string[]>) {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{ accept }],
    });
    return (await fileHandle.getFile()) as File;
  }
  const checkOverlap = (
    trackId: string,
    startTime: number,
    duration: number,
    itemId: string
  ) => {
    for (const item of itemStore) {
      if (item.id === itemId) continue

      if (item.inRowId !== trackId) continue

      const itemEnd = item.startTime + item.duration
      const newItemEnd = startTime + duration

      if (startTime < itemEnd && newItemEnd > item.startTime) {
        return true
      }
    }
    return false
  }

  //[todo]: add snap condition for snapping to grid
  const findValidPosition = (
    rowId: string,
    rawStartTime: number,
    duration: number,
    itemId: string
  ) => {
    let startTime = Math.max(0, rawStartTime)

    if (!checkOverlap(rowId, startTime, duration, itemId)) {
      return startTime
    }
    let forwardPos = startTime
    let backwardPos = startTime

    const maxAttempts = 100
    let attempts = 0

    while (attempts < maxAttempts) {
      attempts++

      forwardPos += 0
      if (!checkOverlap(rowId, forwardPos, duration, itemId)) {
        return forwardPos
      }
      backwardPos = backwardPos
      if (
        backwardPos >= 0 &&
        !checkOverlap(rowId, backwardPos, duration, itemId)
      ) {
        return backwardPos
      }
    }

    const lastItem = itemStore
      .filter(item => item.inRowId === rowId)
      .sort((a, b) => a.startTime + a.duration - (b.startTime + b.duration))
      .pop()

    return lastItem ? lastItem.startTime + lastItem.duration : 0
  }
  const addTrackRows = () => {
    const trackId = nanoid(5)
    const rowId = nanoid(5)
    const start = randInt(0, 100)
    const dur = randInt (0,100)
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
    let endTime = rawStartTime + trackItem.duration; 
    setDuration(endTime)

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
          startTime: validStartTime
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

  return (
    <>
    
      <div className='flex-1 bg-white rounded-lg border border-gray-300'>
        <div>
            <button onClick={async() => { (await loadFile({ 'video/*': ['.mp4', '.mov'] })).stream()}}>
                loadFile
            </button>
        </div>
        <div>
            
        </div>
        <div className='flex'>
          <div className='w-32 p-2 border-r border-gray-300'>
            <div className='font-bold' onClick={addTrackRows}>
              Tracks
            </div>
            <div>
               duration:` ${duration}`
            </div>
          </div>

          <div className='flex-1 relative' style={{ height: '30px' }}></div>
        </div>

        <div className='flex'>
          <div className='w-32 flex flex-col '>
            {trackStore.trackLines.map(track => (
              <div
                key={track.id}
                className='p-2 border-t border-r border-gray-300 flex flex-col'
                style={{ height: `${100}px` }}
              >
                <div className='flex justify-between items-center'>
                  <span>{track.id}</span>
                </div>
                <div className='text-xs text-gray-500'></div>
              </div>
            ))}
          </div>

          <div
            className='flex-1 relative'
            style={{
              width: `${10000}px`,
              overflowX: 'auto'
            }}
          >
            <div>
              {trackRows.map(track => (
                <div
                  ref={rowRef}
                  key={track.id}
                  className={`border-t border-gray-300 relative `}
                  style={{
                    height: `${100}px`,
                    width: `${1000 * 10}px`
                  }}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, track.id)}
                >
                  {itemStore
                    .filter(item => item.inRowId === track.id)
                    .map(item => (
                      <div
                        key={item.id}
                        draggable
                        style={{
                          position: 'absolute',
                          left: `${item.startTime * 10}px`,
                          top: '4px',
                          width: `${item.duration * 10}px`,
                          height: `${60}px`
                        }}
                        onDragStart={e => handleTimeLineDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        className={`${item.type} bg-black text-white rounded p-1 overflow-hidden flex flex-col relative`}
                      ></div>
                    ))}
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
