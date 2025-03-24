import { MP4Clip, VisibleSprite } from '@webav/av-cliper'
import { useState, useCallback, useEffect, useRef } from 'react'
import usePlayerStore from '../../store/playerStore'
import { AVCanvas } from '@webav/av-canvas'
import React from 'react'
import { useTrackStateStore } from '../../store/trackStore'
import { TrackItemType, TrackType } from '../../types/trackType'
import { TrackRowList } from '../../types/trackRowTypes'
import { loadFile } from '../../utils/helpers'
import { nanoid } from 'nanoid'
import { Button } from '../ui/button'

const Player = () => {
  const playerStore = usePlayerStore()
  const isPaused = playerStore.isPaused
  const [time, setTime] = useState(0)
  const trackStore = useTrackStateStore()
  const tracks = trackStore.tracks
  
  const rows = trackStore.trackLines
  const currentTime = playerStore.currentTime
  const [avCanvas, setAvCanvas] = useState<AVCanvas | null>(null)
  const [cvsWrapEl, setCvsWrapEl] = useState<HTMLDivElement | null>(null)
  const [activeSprite, setActiveSprite] = useState<VisibleSprite | null>(null);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const spriteMap = useRef(new Map<string, VisibleSprite>());
  
 


const activeClip = useCallback((clip: TrackItemType | null) => {
    if (!clip) {
        setActiveSprite(null);
        return;
    }

    const spr = spriteMap.current.get(clip.id);
    if (spr?.visible) {
        setActiveSprite(spr);
    }
}, []);



const initClips = () => {
    rows.forEach(track => {
        track.trackItem.forEach(clip => {
            initClip(clip)
        })
    })
}

const addClip = (track: TrackItemType) => {
    initClip(track)
}
const initClip=async (track: TrackItemType) =>{
    if (spriteMap.current.has(track.id))return;
    let spr: VisibleSprite = null


   
}
const totalSprites = spriteMap.current.size
const addVideoSprite = async () =>{
    const stream = (
        await loadFile({ 'video/*': ['.mp4', '.mov'] })
      ).stream()
    const clip = new MP4Clip(stream)
    const spr = new VisibleSprite(clip)
    const {duration} = await clip.ready
    const itemToAdd = {
        id: nanoid(5),
        name: 'track',
        startTime: time,
        endTime: time + duration / 1e6,
        duration: duration / 1e6,
        type: 'VIDEO',
        
    } as TrackItemType
   

    console.log('duration',duration/1e6)
    spriteMap.current.set(itemToAdd.id, spr)
    console.log('sprites count', totalSprites)
    
    avCanvas!.addSprite(spr)
}
  useEffect(() => {
    if (cvsWrapEl == null) return
    avCanvas?.destroy()
    const cvs = new AVCanvas(cvsWrapEl, {
      bgColor: '#000',
      width: 1080,
      height: 720
    })
    cvs.previewFrame(currentTime)
    setAvCanvas(cvs)
    
    cvs.on('timeupdate', time => {
    //   if (time == null) return
    //   setTime(time / 1e6)
    if(currentTime === null) return;
    playerStore.setCurrentTime(time / 1e6)
    })
    cvs.on('playing', () => {
      playerStore.setPaused(false)
    
    
   console.log('playing')
    })
    cvs.on('paused', () => {
      playerStore.setPaused(true)
    console.log('paused')
      
    })
    cvs.on('activeSpriteChange', (sprite: VisibleSprite | null) => {
        for (const [key, spr] of spriteMap.current.entries()) {
            if (Object.is(spr, activeSprite)) {
                setActiveClipId(key); 
                setActiveSprite(spr);
            }
        }
    });

    return () => {
      cvs.destroy()
    }
  }, [cvsWrapEl])

  const activeSPrite = (item: TrackItemType | null) => {
    if(avCanvas==null)return;
    if (!item) return avCanvas.activeSprite = null
    const spr = spriteMap.current.get(item.id)
    if (avCanvas && spr?.visible) {
        avCanvas.activeSprite = spr
    }
}
  const prevFrame = useCallback(() => {
    if (avCanvas === null) return
    if (!isPaused) {
      playerStore.setPaused(true)
    }
    avCanvas.on('timeupdate', time => {
      if (time == null) return

    })
    avCanvas.previewFrame(currentTime)
  }, [currentTime, isPaused])
  useEffect(() =>{
        rows.forEach(track => {
            track.trackItem.forEach(clip => {
                initClip(clip)
                avCanvas?.activeSprite
            })
        })
  })
  const nextFrame = useCallback(() => {
    if (avCanvas === null) return
    if (!isPaused) {
      playerStore.setPaused(true)
    }
    avCanvas.on('timeupdate', time => {
      if (time == null) return
      playerStore.setCurrentTime(time + 1 / 1e6)
    })
    avCanvas.previewFrame(currentTime)
  }, [currentTime, isPaused])

  
  return(<div className='border-2 border-red-500 m-2 flex justify-center items-center'>
    <div className='h-[460px] w-[820px] ' ref={el => setCvsWrapEl(el)}></div>
    <Button onClick={async ()=>{
        addVideoSprite()
    }}>

        add video
    </Button>
    <Button onClick={async () => {
          if (avCanvas == null) return
          if (isPaused === false) {
            avCanvas.pause()
            playerStore.setPaused(true)
            
          } else {
            avCanvas.play({ start: currentTime * 1e6 })
                playerStore.setPaused(false)
          }
          avCanvas
        }}>
        {isPaused ? 'Play' : 'Pause'}
    </Button>
    </div>
  )
}
export default Player
