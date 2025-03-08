import React, { useState } from 'react'
import useTimeLineStore from '../../store/timelineStore'
import {
  AudioTrack,
  TrackItemType,
  TrackType,
  VideoTrack,
  ImageTrack
} from '../../types/trackType'
import { useTrackStateStore } from '../../store/trackStore'
const acceptedTypes = {
  AudioTrack: 'audio',
  VideoTrack: 'video',
  ImageTrack: 'image'
}

const draggableTrack = (item: TrackItemType, target: HTMLDivElement) => {
  const zoomStore = useTimeLineStore()
  const trackStore = useTrackStateStore()
  const width = zoomStore.zoom
  const id = item.id
  const trackRows = trackStore.trackLines
  const [draggedItem, setDraggedItem] = useState('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const timeLinetracks = trackStore.tracks
  //[todo]: add snap condition for snapping to grid
  const findValidPosition = (
    trackId: string,
    rawStartTime: number,
    duration: number,
    itemId = item.id,
   
  ) => {
    let startTime = Math.max(0, rawStartTime)

    if (!checkOverlap(trackId, startTime, duration, item.id)) {
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

  const checkOverlap = (
    rowId: string,
    startTime: number,
    duration: number,
    itemId = item.id
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
  const handleLibraryDragStart = (e: React.DragEvent) => {}
  const handleTimeLineDragStart = (e: React.DragEvent, type = item) => {
    const target = e.target as HTMLElement
    e.dataTransfer.setData('id', item.id)
    e.dataTransfer.setData('type', type.toString())
    e.dataTransfer.setData('startTime', item.startTime.toString())
    e.dataTransfer.setData('rowId', item.inRowId)
    e.dataTransfer.setData('itemType', item.toString())
    e.dataTransfer.setData('duration', item.duration.toString())
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
  const hanleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('id')
    const trackRow = trackRows.find(tr => tr.id === item.id)
    if (!trackRow) return
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
    <div id={item.id} draggable={true} style={{ width: `${width} + px` }}></div>
  )
}
export default draggableTrack
