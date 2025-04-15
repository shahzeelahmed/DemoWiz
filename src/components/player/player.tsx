//[todo]: implement videoEffect and textEffect]
import { IClip, ImgClip, MP4Clip, VisibleSprite } from '@webav/av-cliper'
import { cn } from '../ui/lib/utils'
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
import { Textarea } from '../ui/textarea'
import useSpriteStore from '@/store/spriteStore'
import { useAVCanvasStore } from '@/store/avCanvasStore'
import { NumberInputWithUnit } from '../ui/numberinput'
import { Checkbox } from '../ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ColorPicker, ColorPickerFormat, ColorPickerHue, ColorPickerOutput, ColorPickerSelection } from '../ui/kibo-ui/color-picker'
import { SplitButton } from '../shared/buttons'

const Player = React.memo(() => {
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
  const [effectStart, setEffectStart] = useState(0)

  const addEffectToRow = async () => {
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
    if (id === null) {
      console.warn('no id', id)
      return
    }

    const sprite = spriteMap.get(id)

    if (!sprite) {
      console.warn('no sprite', id)
      return
    }

    const newClip = sprite?.getClip() as MP4Clip
    if (!newClip) return

    const endTime = startTime + hold
    const zoomBlur = createZoomBlurShader({
      zoomCoords: [390,190],
      zoomDepth: 1.0,
      startTime: startTime,
      holdDuration: hold
    })
    if (currentTime === startTime && currentTime < endTime) {
      newClip.tickInterceptor = async (_, tickRet) => {
        if (isPaused === false) {
          console.log('paused')
          return tickRet
        }
        console.log('timeStamp', tickRet.video?.timestamp)
        if (tickRet.video?.timestamp === undefined) {
          console.log('undefined ')
          return tickRet
        }

        return {
          ...tickRet,
          video: await zoomBlur(tickRet.video as VideoFrame)
        }
      }
    }
    // else{
    //   newClip.tickInterceptor = async (_, tickRet) => {
    //     if (isPaused === false) {
    //       console.log('paused')
    //       return tickRet
    //     }
    //     if (tickRet.video == null){
    //       console.log('no clip found ')
    //       return tickRet}
    //     return {
    //       ...tickRet,
    //     }
    //   }
  }
  // useEffect(()=>{
  //   if(currentTime === effectStart){
  //     addEffect(selectedTrackItem as TrackItemType,currentTime ,10000)
  //   }
  // },[effectStart])

  //[todo] implement on z-index change

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
    cvs.on('activeSpriteChange', (s: VisibleSprite | null) => {
      console.log('activeSpriteChange:', s)
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

  const activeSPrite = (item: TrackItemType | null) => {
    if (avCanvas == null) return
    if (!item) return
    avCanvas.activeSprite = null
    const spr = spriteMap.get(item.id)
    if (avCanvas && spr?.visible) {
      avCanvas.activeSprite = spr
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        // Corrected: event.key === ' '
        console.log('space clicked')
        if (isPaused) {
          avCanvas?.play({ start: currentTime * 1e6 })
        } else {
          avCanvas?.pause()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPaused, currentTime])

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

  const updateTextClip = (
    clip: TrackItemType,
    propertyKey: any,
    newValue: any
  ) => {
    console.log('selected clip', clip)
    console.log('clip id:', clip.id)
    const sprite = spriteMap.get(clip.id)
    if (clip.type === 'TEXT') {
      const textClip = sprite!.getClip() as TextClip

      textClip.textConfig = {
        ...textClip.textConfig,
        [propertyKey]: newValue
      }
      clip.config = {
        ...clip.config,
        [propertyKey]: newValue
      }
      const newConfig = clip.config
      const itemToUpdate: TextTrack[] = [
        {
          id: clip.id,
          type: 'TEXT',
          config: newConfig,
          name: ''
        }
      ]
      trackStore.updateTrack(itemToUpdate)

      sprite!.preFrame(currentTime * 1e6)
      return true
    }
    return false
  }

  //adapted from videoclip demo
  const handleSplit = async () => {
    if (!selectedTrackItem || !avCanvas) return
    const oldSprite = spriteMap.get(selectedTrackItem.id)
    if (!oldSprite) return
    const currentMicroTime = currentTime * 1e6
    const splitDuration = currentMicroTime - oldSprite.time.offset
    const getClip = oldSprite.getClip()
    const newClips = await getClip.split(splitDuration)
    
    avCanvas.removeSprite(oldSprite)
    spriteMap.delete(selectedTrackItem.id)

    const sprsDuration = [
      splitDuration,
      oldSprite.time.duration - splitDuration
    ]
    const sprsOffset = [
      oldSprite.time.offset,
      oldSprite.time.offset + splitDuration
    ]

    if (newClips[0]) {
      selectedTrackItem.duration = sprsDuration[0] / 1e6
      selectedTrackItem.endTime =
        Number(selectedTrackItem.startTime) + selectedTrackItem.duration
      trackStore.updateTrack([selectedTrackItem])
    }

    for (let i = 0; i < newClips.length; i++) {
      const clip = newClips[i]
      let clipObj =
        i === 0 ? selectedTrackItem : { ...selectedTrackItem, id: nanoid() }
      if (i > 0) {
        clipObj.startTime = selectedTrackItem.endTime
        clipObj.duration = sprsDuration[i] / 1e6
        clipObj.endTime = Number(clipObj.startTime) + clipObj.duration
        clipObj.inRowId = selectedTrackItem.inRowId
        trackStore.addTrack([clipObj])
      }
      const newSprite = new VisibleSprite(clip)
      newSprite.time.offset = sprsOffset[i]
      newSprite.time.duration = sprsDuration[i]
      spriteMap.set(clipObj.id, newSprite)
      await avCanvas.addSprite(newSprite)
    }
  }
  const [color, setColor] = useState('#ffffff')

 
 



  return (
    <div className='flex z-0 border  '>

      <div className='flex flex-col flex-1 bg-[#f6f6f6] justify-center items-center h-fit max-w-[800px]'>
  
        <div
          className='h-[380px] max-h-96 w-[780px] flex-grow mt-2'
          // className='relative h-[380px] max-h-96 w-[780px] flex-grow mt-2 bg-gray-400'
          ref={el => {setCvsWrapEl(el)}}
        >

           
        </div>

        <div className='flex items-start mt-4'>
          <div className='flex flex-row  items-start gap-4'>
            <Button
              className='absolute left-4'
              variant={'icon'}
              onClick={async () => {
                await handleSplit()
              }}
            >
              <img src={scissorIcon} height={20} width={20} alt='Scissor' />
              Split
            </Button>
            <SplitButton
             onClick={async () => {
              await handleSplit()
            }}
            label='split'
            >
              
               className='absolute left-4'
              variant={'icon'}
             
            
              <img src={scissorIcon} height={20} width={20} alt='Scissor' />
              Split

            </SplitButton>
            <Button
              className='absolute left-30'
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
      {selectedIcon === 'video' ? (
        <div className='bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 w-80 max-w-80 flex-none min-w-0 border-l-1 h-full'>

        </div>
      ) : selectedIcon === 'image' ? (
        <div className=' bg-white text-[#525252] text-[24px] w-80 p-4 flex flex-col gap-3 border-l-1 h-full '></div>
      ) : selectedIcon === 'text' && selectedTrackItem?.type === 'TEXT' ? (
       
        <div
          style={{
            scrollbarWidth: 'none'
          }}
          className=' overflow-y-auto bg-white text-[#525252] p-2 text-[24px] flex flex-col gap-3  top-0 w-80 max-w-80 z-0 max-h-108  min-w-0 border-l-1 '
        >
          <h3 className='text-sm font-medium text-[#2e2e2e]'>Style</h3>

          <div className='flex gap-4'>
            <Button
              className={`border-none ${
                selectedTrackItem.config.bold === true
                  ? `bg-[#d2d2d2]`
                  : `bg-[#f6f6f6]`
              } shadow-none  `}
              onClick={() => {
                const toggleBold = !selectedTrackItem.config.bold
                updateTextClip(selectedTrackItem, 'bold', toggleBold)
              }}
            >
              <BoldIcon />
            </Button>
            <Button
              className={`border-none ${
                selectedTrackItem.config.italic === true
                  ? `bg-[#d2d2d2]`
                  : `bg-[#f6f6f6]`
              } shadow-none  `}
              onClick={() => {
                const toggleItalic = !selectedTrackItem.config.italic
                updateTextClip(selectedTrackItem, 'italic', toggleItalic)
              }}
            >
              <ItalicIcon />
            </Button>
          </div>
          <div className='flex flex-row justify-between'>
            <h3 className='text-sm font-medium  mt-2 text-[#2e2e2e] e] '>
              Typography
            </h3>
          </div>
          <div className='flex flex-row justify-between'>
            <h3 className='text-xs font-medium  mt-1 text-[#5e5e5e]'>Family</h3>
            <h3 className='text-xs font-medium  mt-1 mr-16 text-[#5e5e5e]'>
              Size
            </h3>
          </div>
          <div className='flex flex-row gap-1'>
            <Select
              onValueChange={value =>
                updateTextClip(selectedTrackItem, 'fontFamily', value)
              }
            >
              <SelectTrigger className='bg-white border-none w-[200px]'>
                <SelectValue placeholder='Arial' />
              </SelectTrigger>
              <SelectContent className='font-medium bg-[#f6f6f6]'>
                <SelectItem value='Arial'> Arial</SelectItem>
                <SelectItem value='otetoro'> Otetoro</SelectItem>
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

            <NumberInputWithUnit
              unit='px'
              defaultValue={selectedTrackItem.config?.fontSize ?? 40}
              min={1}
              step={1}
              max={180}
              className={cn('border-none ')}
              onValueChange={e => {
                updateTextClip(selectedTrackItem, 'fontSize', e)
              }}
            />
          </div>

          <div className='flex flex-row items-center justify-between '>
            <h3 className='text-xs font-medium mt-0 text-[#5e5e5e]'>Color</h3>
   
          </div>

          <h3 className='text-sm font-medium text-[#2e2e2e]'>Stroke</h3>
          <div className='grid grid-cols-2 justify-between gap-2 mt-1'>
            <h3 className='text-xs font-medium text-[#5e5e5e]'>Show Stroke</h3>
            <Checkbox
              checked={selectedTrackItem.config.showStroke}
              className='mt-1'
              onCheckedChange={() => {
                const toggleStroke = !selectedTrackItem.config.showStroke
                updateTextClip(selectedTrackItem, 'showStroke', toggleStroke)
              }}
            />
            <h3 className='text-xs font-medium text-[#5e5e5e] mt-2'>Color</h3>
           

            <h3 className='text-xs font-medium text-[#5e5e5e] mt-2'>Width</h3>
            <NumberInputWithUnit
              unit='px'
              max={50}
              min={0}
              onValueChange={val => {
                updateTextClip(selectedTrackItem, 'strokeWidth', val)
              }}
            />
          </div>

          <h3 className='text-sm font-medium text-[#2e2e2e]'>Shadow</h3>
          <div className='grid grid-cols-2 gap-2 justify-between mt-1'>
            <h3 className='text-xs font-medium  mt-2 text-[#5e5e5e] '>
              Show Shadow
            </h3>
            <Checkbox
              checked={selectedTrackItem.config.showShadow}
              onCheckedChange={() => {
                const toggleStroke = !selectedTrackItem.config.showShadow
                updateTextClip(selectedTrackItem, 'showShadow', toggleStroke)
              }}
            />
            <h3 className='text-xs font-medium  mt-2 text-[#5e5e5e] '>Width</h3>
           
          </div>
          <div className='flex flex-row justify-between'>
            <h3 className=' text-xs  text-[#5e5e5e]'>Offset X</h3>
            <h3 className=' text-xs  text-[#5e5e5e]'>Offset Y</h3>
            <h3 className=' text-xs  text-[#5e5e5e]'>Blur</h3>
          </div>
          <div className='flex flex-row justify-between'>
            <NumberInputWithUnit
              unit='px'
              max={20}
              min={-20}
              onValueChange={val => {
                updateTextClip(selectedTrackItem, 'shadowOffsetX', val)
              }}
            />
            <NumberInputWithUnit
              unit='px'
              max={20}
              min={-20}
              onValueChange={val => {
                updateTextClip(selectedTrackItem, 'shadowOffsetY', val)
              }}
            />
            <NumberInputWithUnit
              unit='px'
              max={20}
              min={0}
              onValueChange={val => {
                updateTextClip(selectedTrackItem, 'shadowBlur', val)
              }}
            />
          </div>
          <h3 className='text-sm font-medium  mt-2 text-[#2e2e2e] mr-8'>
            Others
          </h3>
          <h3 className='text-xs mt-1 text-[#5e5e5e]'>Opacity</h3>

          <div className='flex flex-row gap-1'>
            <Slider
              min={0}
              max={1}
              defaultValue={[selectedTrackItem.config.opacity as number]}
              value={[selectedTrackItem.config.opacity as number]}
              step={0.01}
              onValueChange={val => {
                updateTextClip(selectedTrackItem, 'opacity', val)
              }}
              className='w-[180px]'
            />
            <span className='ml-5 text-xs font-black '>
              {' '}
              {selectedTrackItem.config.opacity as number}
            </span>
          </div>
          <div className='flex flex-row justify-between'>
            <h3 className='text-xs font-medium  mt-2 text-[#5e5e5e]'>
              Animation
            </h3>
            <h3 className='text-xs font-medium  mt-2 text-[#5e5e5e] mr-8'>
              Duration
            </h3>
          </div>

          <div className='flex flex-row gap-1 '>
            <Select
              onValueChange={value =>
                updateTextClip(selectedTrackItem, 'animationType', value)
              }
            >
              <SelectTrigger className='bg-white border-none w-[200px]'>
                <SelectValue placeholder='None' />
              </SelectTrigger>

              <SelectContent className='font-medium  bg-[#f6f6f6]'>
                <SelectItem value='None'> None</SelectItem>
                <SelectItem value='typewriter'> typewriter</SelectItem>
                <SelectItem value='slide'>slide</SelectItem>
                <SelectItem value='fade'>fade</SelectItem>
                <SelectItem value='blur'>blur</SelectItem>
                <SelectItem value='pop'>pop</SelectItem>
                <SelectItem value='bounce'>bounce</SelectItem>
                <SelectItem value='reveal'>reveal</SelectItem>
              </SelectContent>
            </Select>
            <NumberInputWithUnit
              unit='sec'
              onValueChange={val => {
                updateTextClip(
                  selectedTrackItem,
                  'animationDuration',
                  val * 1e6
                )
              }}
              value={
                (selectedTrackItem.config.animationDuration as number) / 1e6
              }
              defaultValue={
                (selectedTrackItem.config.animationDuration as number) / 1e6
              }
              min={0}
              max={5}
              step={0.5}
              width={20}
              className='border-none w-24 h-10'
            />
            <Popover>
      <PopoverTrigger >
        <Button variant="outline" className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border"
            style={{ backgroundColor: color }}
          />
          <span>{color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 z-50">
        <ColorPicker color={color} defaultValue={color} onChange={(val)=>{setColor(val as string),updateTextClip(selectedTrackItem,'color',val as string)}} >
          <ColorPickerSelection/>
          <ColorPickerFormat/>
          <ColorPickerHue/>
         <ColorPickerOutput/>
          </ColorPicker>
      </PopoverContent>
    </Popover>
          </div>
          </div>
          
       
      ) : selectedIcon === 'effects' ? (
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3  w-80 border-l-1 h-full'>
          <Button
            onClick={async () => {
              await addEffect(
                selectedTrackItem as TrackItemType,
                currentTime,
                10000
              ),
                setEffectStart(currentTime)
            }}
          >
            add effect
          </Button>
        </div>
      ) : selectedIcon === 'TEXT' ? (
        <div
          style={{ scrollbarWidth: 'none' }}
          className="overflow-y-auto bg-white text-[#525252] text-[20px] flex flex-col gap-6 p-6 top-0 w-80 max-w-80 z-0 max-h-108 min-w-0 border-l-1"
        >

        </div>
      ) : null  }{' '}
    </div>
  )
}
)

export default Player;
