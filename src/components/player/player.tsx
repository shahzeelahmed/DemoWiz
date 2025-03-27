//[todo]: implement videoEffect and textEffect]
import { IClip, ImgClip, MP4Clip, VisibleSprite } from '@webav/av-cliper'
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  FormEvent,
  FormEventHandler
} from 'react'
import usePlayerStore from '../../store/playerStore'
import { AVCanvas } from '@webav/av-canvas'
import React from 'react'
import { useTrackStateStore } from '../../store/trackStore'
import {
  EffectTrack,
  ImageTrack,
  TrackItemType,
  TrackType,
  VideoTrack
} from '../../types/trackType'
import { TrackRowList } from '../../types/trackRowTypes'
import { loadFile } from '../../utils/helpers'
import { nanoid, random } from 'nanoid'
import { createZoomBlurShader } from '../../effects/createMotionBlur'
import useVideoStore from '@/store/videoStore'
import { Button } from '../ui/button'
import Slider from '../ui/slider'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import useSidebarStore from '@/store/sideBarStore'
import { TextClip } from '@/class/textTrack'
import { TextTrack } from '@/types/trackType'
import { TextConfig } from '@/types/textConfig'
import { useTextStore } from '@/store/textStore'
import BoldIcon from './icons/bold'
import UnderLineIcon from './icons/underline'
import ItalicIcon from './icons/italic'
import deleteIcon from '@/frappe-ui/icons/delete.svg'
import scissorIcon from '@/frappe-ui/icons/scissor.svg'
import playIcon from '@/frappe-ui/icons/play.svg'
import pauseIcon from '@/frappe-ui/icons/pause.svg'
import chevLeft from '@/frappe-ui/icons/chevLeft.svg'

import ColorPicker from './icons/colorpicker'
import { Textarea } from '../ui/textarea'

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
  const [activeSprite, setActiveSprite] = useState<VisibleSprite | null>(null)
  const [activeClipId, setActiveClipId] = useState<string | null>(null)
  const spriteMap = useRef(new Map<string, VisibleSprite>())
  const sidebarStore = useSidebarStore()
  const selectedIcon = sidebarStore.selectedIcon
  const textStore = useTextStore()
  const opacity = useTextStore(state => state.opacity);
  const spacing = useTextStore(state => state.spacing);
  const changeOpacity = useTextStore(state => state.changeOpacity);
  const handleOpacityChange = (newValue: number[]) => {
    if (!Array.isArray(newValue) || newValue.length === 0) return;
    changeOpacity(newValue[0]); 
  };
  const activeClip = useCallback((clip: TrackItemType | null) => {
    if (!clip) {
      setActiveSprite(null)
      return
    }

    const spr = spriteMap.current.get(clip.id)
    if (spr?.visible) {
      setActiveSprite(spr)
    }
  }, [])

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
  const initClip = async (track: TrackItemType) => {
    if (spriteMap.current.has(track.id)) return
    let spr: VisibleSprite = null
  }
  const totalSprites = spriteMap.current.size

  const addVideoSprite = async () => {
    const stream = (await loadFile({ 'video/*': ['.mp4', '.mov'] })).stream()
    const clip = new MP4Clip(stream)
    const spr = new VisibleSprite(clip)
    const { duration } = await clip.ready
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
        startTime: currentTime,
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

    console.log('duration', duration / 1e6)
    console.log('sprites count', totalSprites)
    spriteMap.current.set(trackId, spr)
    videoStore.setClip(trackId, clip)
    spr.rect.fixedScaleCenter = true
    spr.rect.fixedAspectRatio = true

    avCanvas!.addSprite(spr)
  }

  const addEffectToRow = () => {
    const id = nanoid(5)
    const itemToAdd: EffectTrack = {
      id: id,
      name: 'track:' + `${id}`,
      type: 'EFFECT',
      isVisible: true,
      duration: 50,
      effectType: 'ZOOM_BLUR',
      startTime: 0,
      endTime: currentTime + 50
    }
    trackStore.addRow({
      id: nanoid(5),
      acceptsType: 'EFFECT',
      trackItem: [itemToAdd]
    })
    trackStore.addTrack([itemToAdd])
  }
  const addEffect = async (
    track: TrackItemType,
    startTime: number,
    hold: number
  ) => {
    const id = track.id
    const clip = videoStore.clip.get(id)
    if (!clip) return
    const zoomBlur = createZoomBlurShader({
      zoomCoords: [0, 1],
      zoomDepth: 1.0,
      startTime: startTime,
      holdDuration: hold
    })
    clip.tickInterceptor = async (_, tickRet) => {
      if (tickRet.video == null) return tickRet
      return {
        ...tickRet,
        video: await zoomBlur(tickRet.video)
      }
    }
  }

  const addTextSprite = async (content: string) => {
    const testTextConfig: TextConfig = {
      content: content,
      fontSize: 48,
      fontFamily: 'Helvetica',
      fontStyle: 'normal',
      textDecoration: 'none',
      fontWeight: 100,
      bold: false,
      italic: false,
      color: '#FFFFFF',
      bgColor: '#FFFFFF',
      opacity: 1,
      x: 0,
      y: 0,
      width: 400,
      height: 200,
      lineSpacing: 10,
      letterSpacing: 0,
      align: 'left',
      backgroundColor: '#653f11',
      backgroundOpacity: 0.1,
      borderColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 4,
      padding: 4,
      margin: 0,
      showShadow: true,
      shadowColor: '#ffffff',
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowOpacity: 0.1,
      showStroke: false,
      strokeColor: '#ffffff',
      strokeWidth: 1,
      strokeOpacity: 1,
      strokeDasharray: [],
      strokeDashoffset: 0,
      verticalAlign: 'top',
      animationSpeed: 10
    }
    const id = nanoid(5)
    const itemToAdd: TextTrack = {
      id: id,
      type: 'TEXT',
      name: 'test',
      duration: 5,
      startTime: 0,
      endTime: 5,
      config: testTextConfig
    }

    trackStore.addRow({
      id: nanoid(5),
      acceptsType: 'TEXT',
      trackItem: [itemToAdd]
    })
    trackStore.addTrack([itemToAdd])
    const clip = new TextClip(itemToAdd.config)

    const spr = new VisibleSprite(clip)

    spriteMap.current.set(itemToAdd.id, spr)
    spr.rect.fixedScaleCenter = true
    spr.rect.fixedAspectRatio = true

    avCanvas!.addSprite(spr)

    textStore.addClip(id, clip)

    setActiveClipId(id)
  }

  //[todo] implement on z-index change and sprite position changer
 
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
      if (currentTime === null) return
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
          setActiveClipId(key)
          // setActiveSprite(spr);
        }
      }
    })

    return () => {
      cvs.destroy()
    }
  }, [cvsWrapEl])

  useEffect(() => {
    if (isPaused === false) return
    if (isPaused) {
      avCanvas?.previewFrame(currentTime * 1e6)
    }
  }, [isPaused, currentTime])
  useEffect(() => {
    console.log(spacing)
    avCanvas?.previewFrame(0)
  },[spacing])
  const activeSPrite = (item: TrackItemType | null) => {
    if (avCanvas == null) return
    if (!item) return (avCanvas.activeSprite = null)
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

  useEffect(() => {
    rows.forEach(track => {
      track.trackItem.forEach(clip => {
        initClip(clip)
        avCanvas?.activeSprite
      })
    })
  })

  const addImageSprite = async () => {
    const stream = (
      await loadFile({ 'image/*': ['.PNG', '.JPG', '.JPEG', '.WebP'] })
    ).stream()
    const imgClip = new ImgClip(stream)

    const spr = new VisibleSprite(imgClip)
    const { duration } = await imgClip.ready
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
        startTime: currentTime,
        endTime: currentTime + duration,
        inRowId: rowId,
        atTime: 0
      }
    ]

    trackStore.addRow({ id: rowId, acceptsType: 'MEDIA', trackItem: newTrack })
    trackStore.addTrack(newTrack)

    console.log('duration', duration / 1e6)
    console.log('sprites count', totalSprites)
    spriteMap.current.set(trackId, spr)

    spr.rect.fixedScaleCenter = true
    spr.rect.fixedAspectRatio = true
    avCanvas!.addSprite(spr)
  }
  const nextFrame = useCallback(() => {
    console.log("nextFrame triggered");
    if (!avCanvas) {
      return;
    }
    if (!isPaused) {
      playerStore.setPaused(true);
    }
//single frame increment by dividing 1 by our video fps[30] 
    const frameDuration = 1 / 30; 
    avCanvas.on("timeupdate", (time: number | null) => {
      if (time == null) {
        return;
      }
      const newTime = time + frameDuration;
      console.log(`currentTime: ${newTime}`);
      playerStore.setCurrentTime(newTime);
    });
   

    avCanvas.previewFrame(currentTime);
  }, [ isPaused, currentTime,opacity,spacing]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        console.log("arrow right clicked");
        nextFrame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {   
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextFrame]);




  return (
    <div className='m-2 flex justify-evenly items-end'>
      <div className='h-[360px] w-[720px]' ref={el => setCvsWrapEl(el)}></div>
  
      <div className="flex flex-row items-start gap-4">
    <img src={scissorIcon} height={24} width={24} />
    <img src={deleteIcon} height={24} width={24} />
  </div>

  <div className="flex items-end">
    <img src={chevLeft} height={24} width={24} />
  </div>

      {selectedIcon === 'video' ? (
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit '>
          <Button
            onClick={async () => {
              await addTextSprite('lorem ipsum lorem ipsum')
            }}
          >
            addText
          </Button>
          <Button
            onClick={async () => {
              await textStore.changeFirstClipContent('as')
              avCanvas?.activeSprite
            }}
          >
            modify
          </Button>
         

        </div>
      ) : selectedIcon === 'image' ? (
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit '>
       
        </div>
      ) : selectedIcon === 'text' ? (
        
        <div className=' bg-white text-[#6e6e6e] text-[40px]  flex flex-col mt-3   '>
       
       <div className="grid grid-rows-2 gap-2"> 
    <Input
      type="text"
      className="pr-20 pb-1 place-self-start h-[70px]"
      style={{
        paddingTop: "0px",
        paddingLeft: "0px",
        textAlign: "left",
      }}
    />
    <Button size="sm">Submit</Button>
  </div>

          <h3 className='text-sm font-medium'>STYLE</h3>
          <div className='flex gap-4 mt-2'>
            <Button variant={'icon'} size={'icon'}>
              <BoldIcon />
            </Button>
            <Button variant={'icon'} size={'icon'}>
              <ItalicIcon />
            </Button>
            <Button variant={'icon'} size={'icon'}>
              <UnderLineIcon />
            </Button>
          </div>
          <h3 className='text-sm font-medium  mt-2'>FONT</h3>
          <div className='grid grid-rows-2  '>
            <Select>
              <SelectTrigger className='bg-white border-none w-[200px]'>
                <SelectValue placeholder='Otetoro' />
              </SelectTrigger>
              <SelectContent className='font-medium bg-white'>
                <SelectItem value='otetoro'>Otetoro</SelectItem>
                <SelectItem value='sans-serif'>Sans Serif</SelectItem>
              </SelectContent>
            </Select>
            <h3 className='text-sm mt-3'>Size</h3>
            <Input
              type='number'
              defaultValue={40}
              min={0}
              max={100}
              className='border-none'
            />
            
            <div className='grid grid-cols-2 items-center justify-between'>
            <h3 className='text-sm mt-4'>Color</h3>
            <div className="flex h-7 w-8 justify-center items-center rounded-md border border-gray-500 mt-4 ">
  <input
    type="color"
    className="w-[30px] rounded-4xl"
  />
</div>

            </div>
            <h3 className='text-sm mt-3 text-[#8e8e8e]'>Opacity</h3>

            <span className="text-sm">Opacity: {opacity.toFixed(1)}</span>
      <Slider
        value={[spacing]} 
        min={0}
        max={100}
        defaultValue={[0]}
        step={1}
        onValueChange={}
        className="w-[250px]"
      />

          </div>
        </div>
      ) : selectedIcon === 'effects' ? (
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit '>

        </div>
      ) : null}
    </div>
  )
}
export default Player
{
  /* <Button onClick={async ()=>{
  addVideoSprite()
}}>

  add video
</Button>
{/* <Button onClick={async()=>{
await addEffect(tracks[0], 0.0, 5000.0)
}}>
add effect
</Button> */
}
{
  /* <Button onClick={addEffectToRow}>
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
  {isPaused ? 'Play' : 'Pase'}
</Button> */
}
