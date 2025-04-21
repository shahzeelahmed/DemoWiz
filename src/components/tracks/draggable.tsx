//[todo]: implement drop preview
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'

import { TrackItemType, VideoTrack, EffectTrack } from '../../types/trackType'
import { useTrackStateStore } from '../../store/trackStore'
import { nanoid } from 'nanoid'
import { randInt } from 'three/src/math/MathUtils.js'
import { loadFile } from '../../utils/helpers'
import usePlayerStore from '../../store/playerStore'
import TimeLine from '../timeline/timeLine'
import { Button } from '../ui/button'
import PlayheadNew from '../timeline/playheadtest'
import imageIcon from '@/frappe-ui/icons/image.svg'
import effectIcon from '@/frappe-ui/icons/magic-wand-svgrepo-com.svg'
import textIcon from '@/frappe-ui/icons/text.svg'
import videoIcon from '@/frappe-ui/icons/video.svg'
import useSpriteStore from '@/store/spriteStore'
import { VisibleSprite } from '@webav/av-cliper'
import { VideoSprite } from '@/class/videoSprite'

const DraggableTrack = React.memo(() => {
  const trackStore = useTrackStateStore()
  const setSelectedTrack = useTrackStateStore(state => state.selectTrack)
  const setSelectedTrackItem = useTrackStateStore(
    state => state.setSelectedTrackItem
  )
  const selectedTrack = useTrackStateStore(state => state.selectedTrackId)
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
  const { sprite: spriteMap, setSprite } = useSpriteStore.getState()
  const trackContainerRef = useRef<HTMLDivElement>(null)

  let isResizing = false
  let resizeType: 'left' | 'right' | null = null
  let initialMouseX = 0
  let initialStartTime = 0
  let initialEndTime = 0
  let selectedTrackItem: TrackItemType | null = null
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const startResize = (
    e: React.MouseEvent<HTMLDivElement>,
    clip: TrackItemType,
    type: 'left' | 'right'
  ) => {
    e.stopPropagation()
    e.preventDefault()
    isResizing = true
    resizeType = type
    selectedTrackItem = clip
    initialMouseX = e.clientX
    initialStartTime = clip.startTime as number
    initialEndTime = clip.endTime as number

    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
  }

  const handleResize = (e: MouseEvent) => {
    if (!selectedTrackItem) return
    e.stopPropagation()
    e.preventDefault()
    const deltaX = e.clientX - initialMouseX
    const deltaTime = deltaX / 10
  
    if (resizeType === 'left') {
      let newStart = initialStartTime + deltaTime
      newStart = Math.max(0, Math.min(newStart, initialEndTime - 0.1))
      const newDuration = initialEndTime - newStart

      selectedTrackItem.startTime = newStart
      selectedTrackItem.duration = newDuration
      selectedTrackItem.endTime = newStart + newDuration
      if (selectedTrackItem.type === 'EFFECT') {
        const eff = selectedTrackItem as EffectTrack
        if (eff.startTime != null && eff.endTime != null && eff.duration != null) {
          const spr = spriteMap.get(eff.id)
          if (spr instanceof VideoSprite) {
            spr.setZoomParameters(
              Math.round(eff.startTime * 1e6),
              Math.round(eff.endTime * 1e6),
              Math.round(eff.duration * 1e6),
              eff.positionIndex ?? 0
            )
            setSprite(eff.id, spr)
          }
        }
      }
    }

    if (resizeType === 'right') {
      let newEnd = initialEndTime + deltaTime
      newEnd = Math.max(initialStartTime + 0.1, newEnd)
      const newDuration = newEnd - initialStartTime
      selectedTrackItem.duration = newDuration
      selectedTrackItem.endTime = newEnd
      if (selectedTrackItem.type === 'EFFECT') {
        const eff = selectedTrackItem as EffectTrack
        if (eff.startTime != null && eff.endTime != null && eff.duration != null) {
          const spr = spriteMap.get(eff.id)
          if (spr instanceof VideoSprite) {
            spr.setZoomParameters(
              Math.round(eff.startTime * 1e6),
              Math.round(eff.endTime * 1e6),
              Math.round(eff.duration * 1e6),
              eff.positionIndex ?? 0
            )
            setSprite(eff.id, spr)
          }
        }
      }
    }

    forceUpdate()
  }
  const stopResize = () => {
    if (!selectedTrackItem) return
    isResizing = false
    resizeType = null

    trackStore.updateTrack([selectedTrackItem])
    const { sprite: spriteMap, setSprite } = useSpriteStore.getState()
    if (selectedTrackItem.type === 'EFFECT') {
      const eff = selectedTrackItem as EffectTrack
      if (eff.startTime != null && eff.endTime != null && eff.duration != null) {
        const spr = spriteMap.get(eff.id)
        if (spr instanceof VideoSprite) {
          spr.setZoomParameters(
            Math.round(eff.startTime * 1e6),
            Math.round(eff.endTime * 1e6),
            Math.round(eff.duration * 1e6),
            eff.positionIndex ?? 0
          )
          setSprite(eff.id, spr)
        }
      }
    }
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

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

  //new
  const checkOverlap = (
    trackId: string,
    startTime: number,
    duration: number,
    itemId: string
  ) => {
    for (const item of itemStore) {
      if (item.id === itemId) continue

      if (item.inRowId !== trackId) continue

      const itemStart = item.startTime ?? 0
      const itemEnd = itemStart + (item.duration ?? 0)
      const newItemEnd = startTime + duration

      if (startTime < itemEnd && newItemEnd > itemStart) {
        return true
      }
    }
    return false
  }
  const borderStyles = {
    IMAGE: {
      selected: 'border-[#ED77BE]',
      default: 'border-[#F69AD1]'
    },
    VIDEO: {
      selected: 'border-[#3CB8DC]',
      default: 'border-[#68D3F3]'
    },
    TEXT: {
      selected: 'border-[#9D7CEA]',
      default: 'border-[#B398EF]'
    },
    EFFECT: {
      selected: 'border-[#DE6D1b]',
      default: 'border-[#F69AD1]'
    }
  }

  function getBorderStyle (selectedTrack: any, item: any) {
    const typeStyles = borderStyles[item.type as keyof typeof borderStyles]
    return selectedTrack === item.id ? typeStyles.selected : typeStyles.default
  }
  //new
  const findValidPosition = (
    rowId: string,
    rawStartTime: number,
    duration: number,
    itemId: string,
    snapThreshold: number = 1
  ) => {
    let startTime = Math.max(0, rawStartTime)
    let snappedTime = startTime
    let isSnapped = false

    for (const otherItem of itemStore) {
      if (otherItem.id === itemId || otherItem.inRowId !== rowId) {
        continue
      }

      const otherItemStart = otherItem.startTime ?? 0
      const otherItemEnd = otherItemStart + (otherItem.duration ?? 0)

      if (Math.abs(startTime - otherItemStart) <= snapThreshold) {
        snappedTime = otherItemStart
        isSnapped = true
        break
      }

      if (Math.abs(startTime - otherItemEnd) <= snapThreshold) {
        snappedTime = otherItemEnd
        isSnapped = true
        break
      }

      const newItemEnd = startTime + duration
      const snappedNewItemEnd = snappedTime + duration

      if (Math.abs(newItemEnd - otherItemStart) <= snapThreshold) {
        snappedTime = otherItemStart - duration
        isSnapped = true
        break
      }

      if (Math.abs(newItemEnd - otherItemEnd) <= snapThreshold) {
        snappedTime = otherItemEnd - duration
        isSnapped = true
        break
      }
    }

    if (isSnapped) {
      if (!checkOverlap(rowId, snappedTime, duration, itemId)) {
        return snappedTime
      }

      let pos = snappedTime
      while (
        checkOverlap(rowId, pos, duration, itemId) &&
        pos < Number.MAX_SAFE_INTEGER
      ) {
        pos += 0.1
      }
      return pos
    }

    if (!checkOverlap(rowId, startTime, duration, itemId)) {
      return startTime
    }

    let forwardPos = startTime
    let backwardPos = startTime
    const timeIncrement = 0.1
    const maxAttempts = 200
    let attempts = 0

    while (attempts < maxAttempts) {
      attempts++

      forwardPos += timeIncrement
      if (!checkOverlap(rowId, forwardPos, duration, itemId)) {
        return forwardPos
      }

      backwardPos -= timeIncrement
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

    return lastItem ? (lastItem.startTime ?? 0) + (lastItem.duration ?? 0) : 0
  }

  //[todo]: implement drag from library
  const handleLibraryDragStart = (e: React.DragEvent, item: TrackItemType) => {}

  const handleTimeLineDragStart = (e, item: TrackItemType) => {
    if (isResizing) return
    const rect = e.target.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const trackJson = JSON.stringify(item)
    e.dataTransfer.setData('app/json', trackJson)

    console.log(item.name)

   
    e.target.style.opacity = '1'
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, rowId: string) => {
    e.preventDefault()

    const trackRow = trackRows.find(tr => tr.id === rowId)
    if (!trackRow) return
    const trackString = e.dataTransfer.getData('app/json')
    const trackItem = JSON.parse(trackString) as TrackItemType

   
    if (trackRow.acceptsType && trackRow.acceptsType !== trackItem.type) return

    const rowRect = rowRef.current!.getBoundingClientRect()

    const dropX = e.clientX - rowRect.left - dragOffset.x
    let rawStartTime = dropX / 10
    const dur = trackItem.duration ?? 0
    const maxStart = rowRect.width / 10 - dur
    rawStartTime = Math.max(0, Math.min(rawStartTime, maxStart))
    const endTime = rawStartTime + dur

    const existingItemIndex = itemStore.findIndex(
      item => item.id === trackItem.id
    )
    console.log('index:', existingItemIndex)

    if (existingItemIndex >= 0) {
      const validStartTime = findValidPosition(
        rowId,
        rawStartTime,
        dur,
        trackItem.id
      )
      const updatedItems = [...itemStore]
      const item = updatedItems[existingItemIndex]
      updatedItems[existingItemIndex] = {
        ...item,
        inRowId: rowId,
        startTime: validStartTime,
        endTime: validStartTime + dur
      }
      const spr = spriteMap.get(trackItem.id)
      if (trackItem.type === 'EFFECT' && spr instanceof VideoSprite) {
        spr.setZoomParameters(
          Math.round(validStartTime * 1e6),
          Math.round((validStartTime + dur) * 1e6),
          Math.round(dur * 1e6),
          trackItem.positionIndex ?? 0
        )
        setSprite(trackItem.id, spr)
      } else if (spr) {
        spr.time.offset = validStartTime * 1e6
      }
      trackStore.updateTrack(updatedItems)
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

  return (
    <div className='relative bg-white border-l-1   w-full h-full flex flex-col '>
      <div className='flex-1 overflow-x-scroll overflow-y-auto flex-col shrink-0 grow relative'>
        <TimeLine duration={100} />

        <div className='flex-1'>
          <div className='min-w-max'>
            {trackRows.map(track => {
              return (
                <div
                  ref={rowRef}
                  key={track.id}
                  className={` relative ml-2 h-10 m-1`}
                  style={{ width: `${1000 * 10}px` }}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, track.id)}
                >
                  {itemStore
                    .filter(item => item.inRowId === track.id)
                    .map(item => (
                      <div
                        key={item.id}
                        draggable={isResizing === true ? false : true}
                        ref={trackContainerRef}
                        style={{
                          position: 'absolute',
                          left: `${(item.startTime ?? 0) * 10}px`,
                          top: '1px',
                          width: `${(item.duration ?? 0) * 10}px`
                          // alignItems: 'center',
                          // display: 'flex',
                        }}
                        onClick={() => {
                          if (selectedTrack === item.id) {
                            setSelectedTrack(null);
                            setSelectedTrackItem(null);
                          
                          } else {
                            setSelectedTrack(item.id);
                            setSelectedTrackItem(item.id);
                          }
                        }}
                        onDragStart={e => {
                          handleTimeLineDragStart(e, item)
                        }}
                        onDragEnd={handleDragEnd}
                        className={` text-white rounded-sm  h-10 overflow-visible flex   items-center relative border-4   ${
                          item.type === 'IMAGE'
                            ? 'bg-[#F69AD1] '
                            : item.type === 'TEXT'
                            ? 'bg-[#B398EF]'
                            : item.type === 'EFFECT'
                            ? 'bg-[#ffa873]'
                            : 'bg-[#68D3F3]'
                        } ${getBorderStyle(
                          selectedTrack,
                          item
                        )}                  `}
                      >
                        <div
                          onMouseDown={e => startResize(e, item, 'left')}
                          className='absolute left-0 top-0 h-9 w-3 flex items-center justify-center cursor-ew-resize z-20 group'
                        >
                          <div className='w-0.9 h-5 bg-[#6e6e6e] border border-[#7e7e7e] rounded-md group-hover:scale-110 transition-transform duration-150 shadow-sm' />
                        </div>
                        <div
                          onMouseDown={e => startResize(e, item, 'right')}
                          className='absolute right-0 top-0 h-9 w-3 flex items-center justify-center cursor-ew-resize z-20 group'
                        >
                          <div className='w-0.9 h-5 bg-[#6e6e6e] border border-[#7e7e7e]  rounded-md group-hover:scale-110 transition-transform duration-150 shadow-sm' />
                        </div>
                        <img
                          draggable={false}
                          src={
                            item.type === 'IMAGE'
                              ? imageIcon
                              : item.type === 'TEXT'
                              ? textIcon
                              : item.type === 'EFFECT'
                              ? effectIcon
                              : videoIcon
                          }
                          height={16}
                          width={16}
                          className='ml-3'
                        />
                      </div>
                    ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})
export default DraggableTrack;
