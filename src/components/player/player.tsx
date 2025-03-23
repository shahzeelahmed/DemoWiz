import { VisibleSprite } from '@webav/av-cliper'
import { useState, useCallback, useEffect, useRef } from 'react'
import usePlayerStore from '../../store/playerStore'
import { AVCanvas } from '@webav/av-canvas'
import React from 'react'
import { useTrackStateStore } from '../../store/trackStore'
import { TrackItemType, TrackType } from '../../types/trackType'
import { TrackRowList } from '../../types/trackRowTypes'

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

    // 根据类型创建不同的 clip 和 sprite
    switch (track.type) {
        case 'VIDEO': {
            let fileObject = await getFile(track.path)
            let mp4Clip = await new MP4Clip(await fileObject.stream())
            mp4Clip.tickInterceptor = async (_, tickRet) => {
                let list = []
                for (const audio of tickRet.audio) {
                    list.push(audio.map((value) => value = value * (clip.volume / 100)))
                }
                tickRet.audio = list
                return tickRet
            }
            if (Number(track.startTime) > 0) {
                const newStartClips = await mp4Clip.split(Number(track.startTime) * 1e6)
                mp4Clip = newStartClips[1]
            }
            spr = new VisibleSprite(mp4Clip)
            break
        }
}
  useEffect(() => {
    if (cvsWrapEl == null) return
    avCanvas?.destroy()
    const cvs = new AVCanvas(cvsWrapEl, {
      bgColor: '#000',
      width: 1080,
      height: 720
    })
    cvs.previewFrame(0)
    setAvCanvas(cvs)
    cvs.on('timeupdate', time => {
      if (time == null) return
      setTime(time / 1e6)
    })
    cvs.on('playing', () => {
      playerStore.setPaused(false)
      playerStore.setCurrentTime(time)
    })
    cvs.on('paused', () => {
      playerStore.setPaused(true)
      setTime(time / 1e6)
    })
    cvs.on('activeSpriteChange', (sprite: VisibleSprite | null) => {
        for (const [key, spr] of spriteMap.current.entries()) {
            if (Object.is(spr, activeSprite)) {
                setActiveClipId(key); 
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
    const spr = spriteMap.get(item.id)
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
      playerStore.setCurrentTime(time - 1 / 1e6)
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

  
  return(
    <div className='h-[400px]' ref={el => setCvsWrapEl(el)}></div>
  )
}
export default Player
