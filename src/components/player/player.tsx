import { ImgClip, MP4Clip, VisibleSprite } from '@webav/av-cliper'
import { useState, useCallback, useEffect, useRef } from 'react'
import usePlayerStore from '../../store/playerStore'
import { AVCanvas } from '@webav/av-canvas'
import React from 'react'
import { useTrackStateStore } from '../../store/trackStore'
import { EffectTrack, ImageTrack, TrackItemType, TrackType, VideoTrack } from '../../types/trackType'
import { TrackRowList } from '../../types/trackRowTypes'
import { loadFile } from '../../utils/helpers'
import { nanoid } from 'nanoid'
import { createZoomBlurShader } from '../../effects/createMotionBlur'
import useVideoStore from '@/store/videoStore'
import { Button } from '../ui/button'
import Slider from '../ui/slider'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const Player = () => {
  const playerStore = usePlayerStore()
  const isPaused = playerStore.isPaused
  const [time, setTime] = useState(0)
  const trackStore = useTrackStateStore()
  const tracks = trackStore.tracks
  const videoStore = useVideoStore()
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
    const trackId = nanoid(5)
    const rowId = nanoid(5)
      
    const newTrack: VideoTrack[] = [
      {
        id: trackId,
        name: 'track:' + `${trackId}`,
        index: 0,
        type: 'VIDEO',
        isVisible: true,
        isMuted: false,
        duration: duration / 1e6,
        height: 720,
        width: 1280,
        startTime: currentTime ,
        endTime: currentTime + duration,
        inRowId: rowId,
        atTime: 0,
        volume: 1,
        fps: 30
      }
    ]

    
    trackStore.addRow({ id: rowId, acceptsType: 'MEDIA', trackItem: newTrack })
    trackStore.addTrack(newTrack)
    videoStore.setClip(trackId, clip)

    console.log('duration',duration/1e6)
    console.log('sprites count', totalSprites)
    spriteMap.current.set(trackId, spr)
    videoStore.setClip(trackId, clip)
    spr.rect.fixedScaleCenter = true
    spr.rect.fixedAspectRatio = true
    avCanvas!.addSprite(spr)
}
const addEffectToRow = () =>{
  const id = nanoid(5)
  const itemToAdd : EffectTrack ={
    id: id,
    name: 'track:' + `${id}`,
    type: 'EFFECT',
    isVisible: true,
    duration: 50,
   effectType: 'ZOOM_BLUR',
    startTime: 0,
    endTime: currentTime + 50,

  }
trackStore.addRow({id:nanoid(5),acceptsType:'EFFECT',trackItem:[itemToAdd]})
trackStore.addTrack([itemToAdd])
}
const addEffect = async (track: TrackItemType, startTime: number, hold: number) => {
  const id = track.id
  const clip = videoStore.clip.get(id)
  if (!clip) return
  const zoomBlur = createZoomBlurShader(
    ({

      zoomCoords: [0,1],
      zoomDepth: 1.0,
      startTime: startTime,
      holdDuration:hold,
    }
    ))
  clip.tickInterceptor = async (_, tickRet) => {
    if (tickRet.video == null) return tickRet
    return {
      ...tickRet,
      video:  await zoomBlur(tickRet.video)
    }
  }
}
useEffect(()=>{

})
//[todo] implement on z-index change and sprite position changer
useEffect(()=>{

})
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
    // cvs.on('activeSpriteChange', (sprite: VisibleSprite | null) => {
    //     for (const [key, spr] of spriteMap.current.entries()) {
    //         if (Object.is(spr, activeSprite)) {
    //             setActiveClipId(key); 
    //             setActiveSprite(spr);
    //         }
    //     }
    // });

    return () => {
      cvs.destroy()
    }
  }, [cvsWrapEl])

useEffect(()=>{
    if(isPaused === false) return;
    if(isPaused){
        avCanvas?.previewFrame(currentTime * 1e6)
    }
},[isPaused,currentTime])

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

  const addImageSprite = async() =>{
    const stream = (
      await loadFile({ 'image/*': ['.PNG', '.JPG','.JPEG','.WebP'] })
    ).stream()
    const imgClip = new ImgClip(stream)
 
  const spr = new VisibleSprite(imgClip)
  const {duration} = await imgClip.ready
  const trackId = nanoid(5)
  const rowId = nanoid(5)
    
  const newTrack: ImageTrack[] = [
    {
      id: trackId,
      name: 'track:' + `${trackId}`,
      index: 0,
      type: 'IMAGE',
      isVisible: true,
      isMuted: false,
      duration: 5000,
      height: 720,
      width: 1280,
      startTime: currentTime ,
      endTime: currentTime + duration,
      inRowId: rowId,
      atTime: 0,
    }
  ]

  
  trackStore.addRow({ id: rowId, acceptsType: 'MEDIA', trackItem: newTrack })
  trackStore.addTrack(newTrack)
  

  console.log('duration',duration/1e6)
  console.log('sprites count', totalSprites)
  spriteMap.current.set(trackId, spr)
  
  spr.rect.fixedScaleCenter = true
  spr.rect.fixedAspectRatio = true
  avCanvas!.addSprite(spr)
  }
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
    

<div className="m-2 flex justify-between">
<div className="h-[460px] w-[820px]" ref={(el) => setCvsWrapEl(el)}></div>
<div className=" bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit ">
 
  <div className="border-b pb-3">
    <h3 className="text-sm font-medium">Position</h3>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <Input type="number" placeholder="X" className="bg-gray-800" />
      <Input type="number" placeholder="Y" className="bg-gray-800" />
      <Input type="number" placeholder="Rotation" className="bg-gray-800 col-span-2" />
    </div>
  </div>

  
  <div className="border-b pb-3">
    <h3 className="text-sm font-medium ">Layout</h3>
    <div className="grid grid-cols-2 gap-1 ">
      <Input type="number" placeholder="Width" className="bg-gray-800" />
      <Input type="number" placeholder="Height"  />
    </div>
  </div>

  
  <div className="border-b pb-3">
    <h3 className="text-sm font-medium ">Appearance</h3>
    <div className="flex gap-2 mt-2">
      <Slider defaultValue={[100]} min={0} max={100} className="w-full" />
      <Slider defaultValue={[50]} min={0} max={100} className="w-full" />
    </div>
  </div>

  
  <div className="border-b pb-3">
    <h3 className="text-sm  font-medium">Font Family</h3>
    <Select>
      <SelectTrigger className="bg-gray-800">
        <SelectValue placeholder="Otetoro" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="otetoro">Otetoro</SelectItem>
        <SelectItem value="sans-serif">Sans Serif</SelectItem>
      </SelectContent>
    </Select>
    <div className="grid grid-cols-2 gap-1 mt-2">
      <Select>
        <SelectTrigger className="">
          <SelectValue placeholder="Bold" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bold">Bold</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
        </SelectContent>
      </Select>
      <Input type="number" placeholder="Size" className="bg-gray-800" />
    </div>
  </div>


  <div className="border-b pb-3">
    <h3 className="text-sm font-medium">Fill</h3>
    <div className="flex items-center gap-1 mt-2">
      <Input type="color" className="w-10 h-10 border-none" />
      <Input type="text" placeholder="#EEFF88" className="bg-gray-800" />
    </div>
  </div>

  
  <div>
    <h3 className="text-sm font-medium">Stroke</h3>
    <div className="flex items-center gap-1 mt-2">
      <Input type="color" className="w-10 h-10 border-none" />
      <Input type="text" placeholder="#EEFF88" className="bg-gray-800" />
    </div>
  </div>
</div>
</div>
  )
}
export default Player
{/* <Button onClick={async ()=>{
  addVideoSprite()
}}>

  add video
</Button>
{/* <Button onClick={async()=>{
await addEffect(tracks[0], 0.0, 5000.0)
}}>
add effect
</Button> */}
{/* <Button onClick={addEffectToRow}>
add effect
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
</Button> */} 