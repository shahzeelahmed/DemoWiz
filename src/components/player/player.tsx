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
import Colorpicker, { ColorPicker, useColor } from 'react-color-palette'
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


import { Textarea } from '../ui/textarea'
import useSpriteStore from '@/store/spriteStore'
import { useAVCanvasStore } from '@/store/avCanvasStore'
import { TrackItem } from '../tracks/trackItem'
import TextTrackConfig from '../tracks/textTrack'
import { randInt } from 'three/src/math/MathUtils'
import { ImageClip } from '@/class/imageTrack'
import { cn } from '../ui/lib/utils'

const Player = () => {
  const playerStore = usePlayerStore()
  const isPaused = playerStore.isPaused
  const [time, setTime] = useState(0)
  const trackStore = useTrackStateStore()
  const tracks = trackStore.tracks
  const videoStore = useVideoStore()
  const rows = trackStore.trackLines
  const currentTime = playerStore.currentTime
  const avCanvas = useAVCanvasStore(state => state.avCanvas)
  const setAvCanvas = useAVCanvasStore(state => state.setAvCanvas)
  const [cvsWrapEl, setCvsWrapEl] = useState<HTMLDivElement | null>(null)
  const [activeSprite, setActiveSprite] = useState<VisibleSprite | null>(null)
  const [activeClipId, setActiveClipId] = useState<string | null>(null)
  const sidebarStore = useSidebarStore()
  const selectedIcon = sidebarStore.selectedIcon
  const textStore = useTextStore()
  const spriteStore = useSpriteStore()
  const spriteMap = useSpriteStore(state => state.sprite)
  const setSelectedTrack = useTrackStateStore(state => state.selectTrack)
  const selectedTrack = useTrackStateStore(state => state.selectedTrackId)
  const selectedTrackItem = useTrackStateStore(state => state.selectedTrackItem)
  const opacity = useTextStore(state => state.opacity)
  const spacing = useTextStore(state => state.spacing)
 
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
  }, [spacing])
  const activeSPrite = (item: TrackItemType | null) => {
    if (avCanvas == null) return
    if (!item) return 
    (avCanvas.activeSprite = null)
    const spr = spriteMap.get(item.id)
    if (avCanvas && spr?.visible) {
      avCanvas.activeSprite = spr
    }
  }


useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') { // Corrected: event.key === ' '
        console.log('space clicked');
        if (isPaused) {
          avCanvas?.play({ start: currentTime * 1e6 });
        } else {
          avCanvas?.pause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused, currentTime]);

  const updateSpritesZIndex = () => {
    let currentZIndex = 0
    rows.forEach(track => {
      track.trackItem.forEach(clip => {
        const spr = spriteMap.get(clip.id)
        if (!spr || clip.type === 'TEXT') return
        spr.zIndex = currentZIndex++
      })
      track.trackItem.forEach(clip => {
        const spr = spriteMap.get(clip.id)
        if (!spr || clip.type !== 'TEXT') return
        spr.zIndex = currentZIndex++
      })
    })
  }
  const deleteClip = async (id: string) => {
    const spriteToDelete = spriteMap.get(id) as VisibleSprite
    if (!spriteToDelete) return
    spriteMap.delete(id)
    trackStore.removetrack(id)
    avCanvas!.removeSprite(spriteToDelete)
  }
  const updateClip = async (
    clip: TrackItemType,
    type: 'default' | 'resize' | 'delete' = 'default'
  ) => {
    playerStore.setPaused(true)
    console.log('updateClip', clip)
    if (!spriteMap.has(clip.id)) return

    const spr = spriteMap.get(clip.id) as VisibleSprite

    if (type === 'delete') {
      avCanvas?.removeSprite(spr)
      spriteMap.delete(clip.id)
      return
    }

    if (type === 'resize' && (clip.type === 'VIDEO' || clip.type === 'AUDIO')) {
      avCanvas?.removeSprite(spr)
      spriteMap.delete(clip.id)

      return
    }

    spr.time.offset = clip!.startTime * 1e6
    spr.time.duration = Number(clip.duration) * 1e6
    spr.opacity = Number((clip!.opacity / 100).toFixed(2))

    updateSpritesZIndex()

    if (clip.type === 'TEXT') {
      const textClip: TextClip = spr.getClip() as TextClip
      textClip.textConfig = clip.config
      spr.preFrame(currentTime * 1e6)
    }
  }
  // const [localClip, setLocalClip] = useState(selectedTrackItem);


  // useEffect(() => {
  //   setLocalClip(selectedTrackItem);
  // }, [selectedTrackItem]);

  

const updateTextClip = (clip: TrackItemType,propertyKey:any, newValue:any) => {
  console.log('selected clip', clip)
  console.log('clip id:',clip.id)
  const sprite = spriteMap.get(clip.id)
  const itemStore = trackStore.tracks
  if (clip.type === 'TEXT') {
    
    const textClip = sprite!.getClip() as TextClip;
    
    
    textClip.textConfig = {
      ...textClip.textConfig,
      [propertyKey]: newValue
    };
    clip.config = {
      ...clip.config,
      [propertyKey]: newValue
    };
    const newConfig = clip.config
    const itemToUpdate:TextTrack[] = [{
      id: clip.id,
      type: 'TEXT',
      config: newConfig,
      name: ''
    }]
  console.log('newconfig',newConfig)
    trackStore.updateTrack(itemToUpdate)
    
    sprite!.preFrame(currentTime * 1e6);
    console.log('done')
    return true;
  }
  return false;
};


//adapted from videoclip demo
const handleSplit = async () => {
  if (!selectedTrackItem || !avCanvas ) return;
  const oldSprite = spriteMap.get(selectedTrackItem.id);
  if (!oldSprite) return;
  const currentMicroTime = currentTime * 1e6;
  const splitDuration = currentMicroTime - oldSprite.time.offset;
  const getClip = await oldSprite.getClip()
  const newClips = await getClip.split(splitDuration);
  console.log("new clips:", newClips);
  avCanvas.removeSprite(oldSprite);
  spriteMap.delete(selectedTrackItem.id);

  const sprsDuration = [
    splitDuration,
    oldSprite.time.duration - splitDuration,
  ];
  const sprsOffset = [
    oldSprite.time.offset,
    oldSprite.time.offset + splitDuration,
  ];

  if (newClips[0]) {
    selectedTrackItem.duration = sprsDuration[0] / 1e6;
    selectedTrackItem.endTime =
      Number(selectedTrackItem.startTime) + selectedTrackItem.duration;
    trackStore.updateTrack([selectedTrackItem]);
  }

  for (let i = 0; i < newClips.length; i++) {
    const clip = newClips[i];
    let clipObj = i === 0
      ? selectedTrackItem
      : { ...selectedTrackItem, id: nanoid() };
    if (i > 0) {
      clipObj.startTime = selectedTrackItem.endTime;
      clipObj.duration = sprsDuration[i] / 1e6;
      clipObj.endTime = Number(clipObj.startTime) + clipObj.duration;
      clipObj.inRowId = selectedTrackItem.inRowId;
      trackStore.addTrack([clipObj]);
    }
    const newSprite = new VisibleSprite(clip);
    newSprite.time.offset = sprsOffset[i];
    newSprite.time.duration = sprsDuration[i];
    spriteMap.set(clipObj.id, newSprite);
    await avCanvas.addSprite(newSprite);
  }
};


const [color,setColor] = useState('')
  
  return (
    <div className='m-2 flex'>
      <div className='flex flex-col flex-1'>
        <div
          className='h-[480px] w-[854px] flex-grow'
          ref={el => setCvsWrapEl(el)}
        ></div>

        <div className='flex mt-4'>
          <div className='flex flex-row flex-grow items-start gap-4'>
            <Button variant={'icon'} onClick={async() =>{await handleSplit()}}>
              <img src={scissorIcon} height={20} width={20} alt='Scissor' />
              Split
            </Button>
            <Button
              variant={'icon'}
              onClick={() => {
                selectedTrack ? deleteClip(selectedTrack) : null
              }}
            >
              <img src={deleteIcon} height={20} width={20} alt='Delete' />
              Delete
            </Button>
          </div>
          <div className='flex flex-row flex-grow items-center  gap-2 '>
           
            
            <img
              src={isPaused ? playIcon : pauseIcon}
              height={28}
              width={28}
              onClick={() => {
                if (avCanvas == null) return
                if (isPaused === false) {
                  avCanvas.pause()
                  playerStore.setPaused(true)
                } else {
                  avCanvas.play({ start: currentTime * 1e6 })
                  playerStore.setPaused(false)
                }
                
              }}
            />
           
          </div>
        </div>
      </div>
      
      { selectedIcon === 'video' ? (
        <div className='bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit w-80 max-w-80 flex-none min-w-0'>
          <Button
            onClick={async () => {
              textStore.changeFirstClipContent('as')
              avCanvas?.activeSprite
            }}
          >
            modify
          </Button>
        </div>
      ) : selectedIcon === 'image' ? (
        <div className=' bg-white text-[#525252] text-[24px] w-80 p-4 flex flex-col gap-3 h-fit '></div>
      ) : selectedIcon === 'text' && selectedTrackItem?.type === 'TEXT' ?  (
       
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit w-80 max-w-80 flex-none min-w-0'>
        
  
          <div className='grid grid-rows-2 gap-1'></div>

          <h3 className='text-sm font-medium'>STYLE</h3>
          
          <div className='flex gap-4 mt-2'>
            <Button variant={'icon'} size={'icon'} 
            className={selectedTrackItem.config.bold ? "bg-red-200" : "bg-green-300"}
       onClick={()=>{
        const toggleBold = !selectedTrackItem.config.bold; 
        updateTextClip(selectedTrackItem, 'bold', toggleBold );
       }}
        
              >
              <BoldIcon />
            </Button>
            <Button variant={'icon'} size={'icon'} onClick={()=>{
        const toggleItalic = !selectedTrackItem.config.italic; 
        updateTextClip(selectedTrackItem, 'italic', toggleItalic );
       }}>
              <ItalicIcon />
            </Button>
            <Button variant={'icon'} size={'icon'}>
              <UnderLineIcon />
            </Button>
          </div>
          <h3 className='text-sm font-medium  mt-2'>FONT</h3>
          <div className='grid grid-rows-2  '>
            <Select onValueChange={(value) => updateTextClip(selectedTrackItem,'fontFamily',value)}>
              <SelectTrigger className='bg-white border-none w-[200px]'>
                <SelectValue placeholder='Arial' />
              </SelectTrigger>
              <SelectContent className='font-medium bg-white' >
              <SelectItem value='Arial'>  Arial</SelectItem>
                <SelectItem value='otetoro'>  Otetoro</SelectItem>
                <SelectItem value='sans-serif'>Sans Serif</SelectItem>
                <SelectItem value='Verdana'>Verdana</SelectItem>
                <SelectItem value='Tahoma'>Tahoma</SelectItem>
                <SelectItem value='Trebuchet MS'>Trebuchet MS</SelectItem>
                <SelectItem value='Georgia'>Georgia</SelectItem>
                <SelectItem value='Times New Roman'>Times New Roman</SelectItem>
                <SelectItem value='Impact'>Impact</SelectItem>
                <SelectItem value='Comic Sans MS'>Comic Sans MS</SelectItem>
                <SelectItem value='Courier New'>Courier New</SelectItem>
                <SelectItem value='Inter'>Inter</SelectItem>

              </SelectContent>
            </Select>
            
            <div className='flex flex-row gap-2 mt-2'>
            <h3 className='text-sm mt-3'>Size</h3>
            
  <Input
    type='number'
    defaultValue={selectedTrackItem.config?.fontSize ?? 16}
    min={1}
    step={1}
    max={200}
    className={cn(
      "border-none",
    )}
    onChange={(e) => {
      updateTextClip(selectedTrackItem, 'fontSize', parseInt(e.target.value, 10));
    }}
    // className='border-none'
  />
</div>

            <div className='grid grid-cols-2 items-center justify-between'>
              <h3 className='text-sm mt-4 text-[#8e8e8e]'>Color</h3>
              <div className='flex h-6 w-6 justify-center items-center rounded-md border-[1.5px] border-gray-800 mt-4  '>
              <input type = 'color' 
              className='h-6 w-5'
              value={selectedTrackItem.color}
              onChange={(e) =>{updateTextClip(selectedTrackItem, "color", e.target.value)}} /> 
              </div>
            </div>
            <h3 className='text-sm mt-3 text-[#8e8e8e]'>Opacity</h3>

            <div className='flex flex-row gap-1'>
            <Slider
  min={0}
  max={1}
  defaultValue={[selectedTrackItem.config.opacity as number]} 
  value={[ selectedTrackItem.config.opacity as number]}
  step={0.01}
  onValueChange={(val) => { updateTextClip(selectedTrackItem, 'opacity', val);
  }
}

  className='w-[250px]'
/>
<span className='text-sm'> {selectedTrackItem.config.opacity as number}</span>

</div>
<h3 className='text-sm mt-3 text-[#8e8e8e]'>Letter Spacing</h3>

<div className='flex flex-row gap-1'>
<Slider
min={0}
max={50}
defaultValue={[selectedTrackItem.config.letterSpacing as number]} 
value={[ selectedTrackItem.config.letterSpacing as number]}
step={1}
onValueChange={(val) => { updateTextClip(selectedTrackItem, 'letterSpacing', val);
}
}

className='w-[250px]'
/>
<span className='text-sm'> {selectedTrackItem.config.letterSpacing as number}</span>

</div>
          </div>
        </div>
      ) :
      selectedIcon === 'effects' ? (
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit w-80'></div>
) : null
    }    </div>
  )
}
export default Player
