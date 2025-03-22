import './App.css'
import React, { useEffect, useRef, useState } from 'react'
import Playhead from './components/timeline/playheadtest'
import DraggableTrack from './components/tracks/draggable'
import { AVCanvas } from '@webav/av-canvas'
import { useTrackStateStore } from './store/trackStore'
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
const worker = new Worker(new URL('./avcanvasWorker.ts', import.meta.url), {
  type: 'module'
})
const workerScript = `

  self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type === "addSprite") {
      console.log("Worker received ArrayBuffer:", payload.byteLength, "bytes");

      const videoBlob = new Blob([payload]);
      console.log("Created Blob:", videoBlob.size, "bytes");

      const track = new MP4Clip(videoBlob);
      const { duration, height, width } = await track.ready;

      const spr = new VisibleSprite(track);
      await avCanvas.addSprite(spr);

      self.postMessage({ type: "spriteAdded", payload: { duration, height, width } });
    }
  };
`
const createWorker = () => {
  const blob = new Blob([workerScript], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob), { type: 'module' })
}

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
  useEffect(() => {
    if (cvsWrapEl == null) return
    avCanvas?.destroy()
    const cvs = new AVCanvas(cvsWrapEl, {
      bgColor: '#000',
      width: 1080,
      height: 720
    })
    setAvCanvas(cvs)
    cvs.on('timeupdate', time => {
      if (time == null) return
      setTime(time / 1e6)
    })
    cvs.on('playing', () => {
      setPlaying(true)
    })
    cvs.on('paused', () => {
      setPlaying(false)
    })

    return () => {
      cvs.destroy()
    }
  }, [cvsWrapEl])
  async function testClip () {
    const clip = new MP4Clip(
      (await fetch('src/assets/JOTARO VS KIRA 4K 60 FPS MhL_V19Su7o.mp4')).body!
    )
    const chromakey = createChromakey({
      similarity: 0.4,
      smoothness: 0.1,
      spill: 0.1
    })
    clip.tickInterceptor = async (_, tickRet) => {
      if (tickRet.video == null) return tickRet
      return {
        ...tickRet,
        video: await chromakey(tickRet.video)
      }
    }
  }
  async function addSpriteToRow (atTime: number, type: TrackRowType) {
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

  useEffect(() => {
    worker.onmessage = e => {
      if (e.data.type === 'spriteAdded') {
        console.log('Sprite added successfully!', e.data.payload)
        setDuration(e.data.payload.duration)
      }
    }

    return () => worker.terminate()
  }, [])

  const handlePlayPause = () => {
    if (!worker) return
    worker.postMessage({ type: playing ? 'pause' : 'play', payload: time })
  }

  return (
    <>
      {/* <div className="h-[400px]" ref={el => setCvsWrapEl(el)}></div> */}

      <div className='h-[400px]' ref={el => setCvsWrapEl(el)}></div>
      <Button
        className='mx-[10px]'
        onClick={async () => {
          const stream = (
            await loadFile({ 'video/*': ['.mp4', '.mov'] })
          ).stream()
          setClip(stream)
          const targetClip = new MP4Clip(stream)
       
          const spr = new VisibleSprite(new MP4Clip(stream, {}))
    
          const motion = createZoomBlurShader(
            {
              zoomCoords: [1,1],
              zoomDepth: 4.0
            }
          )
          targetClip.tickInterceptor = async (_, tickRet) => {
            if (tickRet.video == null) return tickRet
            return {
              ...tickRet,
              video: await motion(tickRet.video)
            }
          }
          const targetSpr = new VisibleSprite(targetClip)
          await targetSpr.ready
          await avCanvas?.addSprite(targetSpr)
        }}
      >
        + Add Video
      </Button>

      <Button
        onClick={async () => {
          if (avCanvas == null) return
          if (playing) {
            avCanvas.pause()
          } else {
            avCanvas.play({ start: time * 1e6 })
          }
          avCanvas
        }}
      >
        {playing ? 'pause' : 'play'}
      </Button>
      <DraggableTrack />
    </>
  )
}
