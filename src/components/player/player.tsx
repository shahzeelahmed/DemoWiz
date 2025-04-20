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
import DeleteIcon from '@/frappe-ui/icons/delete'
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
import SplitIcon from '@/frappe-ui/icons/scissor'
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
import scissorIcon from '@/frappe-ui/icons/scissor.svg'
import PlayIcon from '@/frappe-ui/icons/play'
import PauseIcon from '@/frappe-ui/icons/pause'
import chevLeft from '@/frappe-ui/icons/chevLeft.svg'
import { Textarea } from '../ui/textarea'
import useSpriteStore from '@/store/spriteStore'
import { useAVCanvasStore } from '@/store/avCanvasStore'
import { NumberInputWithUnit } from '../ui/numberinput'
import { Checkbox } from '../ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  ColorPicker,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection
} from '../ui/kibo-ui/color-picker'
import ExportIcon from '@/frappe-ui/icons/export'
import { FrappeColorPicker } from '../ui/frappeColorPicker'

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
      zoomCoords: [390, 190],
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
    const sprite = spriteMap.get(clip.id)
    if (clip.type === 'TEXT') {
      const textClip = sprite!.getClip() as TextClip
      textClip.textConfig = {
        ...textClip.textConfig,
        [propertyKey]: newValue
      }
      sprite!.rect.w = textClip.meta.width
      sprite!.rect.h = textClip.meta.height
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
    }
  }
  const updateVideoOpacity = (id: string, newValue: number) => {
    const sprite = spriteMap.get(id)
    if (!sprite) return
    sprite.opacity = newValue
    const currentTrack = trackStore.tracks.find(
      (track: any) => track.id === id && track.type === 'VIDEO'
    ) as VideoTrack
    if (!currentTrack) return

    const updatedTrack = {
      ...currentTrack,
      opacity: newValue
    }
    console.log('updatedTrack opacity', updatedTrack.opacity)
    const itemToUpdate: VideoTrack[] = [updatedTrack]
    trackStore.updateTrack(itemToUpdate)

    sprite.preFrame(currentTime * 1e6)
  }
  const flipVideo = (
    id: string,
    flipVideo: 'horizontal' | 'vertical' | null
  ) => {
    const sprite = spriteMap.get(id)
    if (!sprite) return
    sprite.flip = flipVideo
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
      if (clip instanceof TextClip) {

        // initial dimensions of the clip
        newSprite.rect.w = clip.meta.width
        newSprite.rect.h = clip.meta.height
        clip.onMetaChange(meta => {
          newSprite.rect.w = meta.width
          newSprite.rect.h = meta.height
        });
      }
      newSprite.time.offset = sprsOffset[i]
      newSprite.time.duration = sprsDuration[i]
      spriteMap.set(clipObj.id, newSprite)
      await avCanvas.addSprite(newSprite)
    }
  }
  const [strokeColor, setStrokeColor] = useState('#ffffff')
  const [textColor, setTextColor] = useState('#ffffff')
  const [aspectRatio, setAspectRatio] = useState('16:9')

  return (
    <div className='flex border  '>
      <div className='flex flex-col flex-1 bg-[#f8f8f8] items-start border-r max-w-[800px]'>
        <div
        ref={el => setCvsWrapEl(el)}
          className='h-[380px] mt-2 tablet-canvas self-center'
          style={{ aspectRatio: aspectRatio.replace(':', '/') }}
          
        ></div>

        <div className='flex flex-row items-start mt-2 w-full'>
          <div className='flex flex-row items-start gap-4 mb-1'>
            <Button
              className='bg-[#efefef] hover:bg-[#e0e0e0] text-[#383838]  font-medium  cursor-pointer ml-3 h-8'
              variant={'default'}
              onClick={async () => {
                await handleSplit()
              }}
            >
              <SplitIcon />
              Split
            </Button>
            <Button
              className='bg-[#efefef] hover:bg-[#e0e0e0] text-[#383838] font-medium h-8 cursor-pointer'
              variant='default'
              onClick={() => {
                selectedTrack ? deleteClip(selectedTrack) : null
              }}
            >
              <DeleteIcon />
              Delete
            </Button>

            {isPaused ? (
              <PlayIcon
                className='ml-40'
                viewBox='0 0 14 14'
                cursor='pointer'
                onClick={() => {
                  avCanvas!.play({ start: currentTime * 1e6 })
                  playerStore.setPaused(false)
                }}
              />
            ) : (
              <PauseIcon
                className='ml-40'
                viewBox='0 0 14 14'
                cursor='pointer'
                onClick={() => {
                  avCanvas!.pause()
                  playerStore.setPaused(true)
                }}
              />
            )}

<div className='justify-end self-end ml-20'>

            <Select  onValueChange={setAspectRatio} defaultValue={aspectRatio} >
              <SelectTrigger  className='ml-2 h-8 w-20'>
                <SelectValue placeholder='16:9'  />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='16:9'>16:9</SelectItem>
                <SelectItem value='2:3'>2:3</SelectItem>
                <SelectItem value='1:1'>1:1</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>
      </div>
      {selectedTrackItem?.type === 'VIDEO' ? (
        <div className='bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 w-80 max-w-80 flex-none min-w-0  h-full'>
          <Slider
            min={0}
            max={1}
            defaultValue={[selectedTrackItem.opacity as number]}
            value={[selectedTrackItem.opacity as number]}
            step={0.01}
            onValueChange={val => {
              updateVideoOpacity(selectedTrackItem.id, val[0])
              console.log('opacity and val', selectedTrackItem.opacity, val[0])
            }}
            className='w-[180px]'
          />
        </div>
      ) : selectedTrackItem?.type === 'IMAGE' ? (
        <div className=' bg-white text-[#525252] text-[24px] w-80 p-4 flex flex-col gap-3 h-full '></div>
      ) : selectedTrackItem?.type === 'TEXT' ? (
        <div
          style={{ scrollbarWidth: 'none' }}
          className='overflow-y-auto bg-white text-[#525252] p-4 text-[16px] flex flex-col gap-6 top-0 w-80 max-w-80 z-0 max-h-108 min-w-0'
        >
          <section>
            <h3 className='text-xs font-semibold text-[#2e2e2e] mb-2'>Style</h3>
            <div className='flex gap-2 mb-2'>
              <Button
                className={`border-none ${
                  selectedTrackItem.config.bold
                    ? 'bg-[#d2d2d2]'
                    : 'bg-[#f6f6f6]'
                } shadow-none hover:bg-[#e9e9e9]`}
                onClick={() =>
                  updateTextClip(
                    selectedTrackItem,
                    'bold',
                    !selectedTrackItem.config.bold
                  )
                }
              >
                <BoldIcon />
              </Button>
              <Button
                className={`border-none ${
                  selectedTrackItem.config.italic
                    ? 'bg-[#d2d2d2]'
                    : 'bg-[#f6f6f6]'
                } shadow-none hover:bg-[#e9e9e9]`}
                onClick={() =>
                  updateTextClip(
                    selectedTrackItem,
                    'italic',
                    !selectedTrackItem.config.italic
                  )
                }
              >
                <ItalicIcon />
              </Button>
            </div>
            <hr className='my-2 border-gray-200' />
          </section>

          <section>
            <h3 className='text-xs font-semibold text-[#2e2e2e] mb-2'>
              Typography
            </h3>
            <div className='flex flex-row items-center gap-2 mb-2'>
              <span className='text-xs text-[#5e5e5e] w-12'>Family</span>
              <Select
                onValueChange={value =>
                  updateTextClip(selectedTrackItem, 'fontFamily', value)
                }
                value={selectedTrackItem.config.fontFamily}
              >
                <SelectTrigger className='bg-white border-none w-[120px]'>
                  <SelectValue placeholder='Arial' />
                </SelectTrigger>
                <SelectContent className='font-medium bg-[#f6f6f6]'>
                  <SelectItem value='Arial' style={{ fontFamily: 'Arial' }}>Arial</SelectItem>
                  <SelectItem value='otetoro' style={{ fontFamily: 'otetoro' }}>Otetoro</SelectItem>
                  <SelectItem value='sans-serif' style={{ fontFamily: 'sans-serif' }}>Sans Serif</SelectItem>
                  <SelectItem value='Verdana' style={{ fontFamily: 'Verdana' }}>Verdana</SelectItem>
                  <SelectItem value='Tahoma' style={{ fontFamily: 'Tahoma' }}>Tahoma</SelectItem>
                  <SelectItem value='Trebuchet MS' style={{ fontFamily: 'Trebuchet MS' }}>Trebuchet MS</SelectItem>
                  <SelectItem value='Georgia' style={{ fontFamily: 'Georgia' }}>Georgia</SelectItem>
                  <SelectItem value='Times New Roman' style={{ fontFamily: 'Times New Roman' }}>Times New Roman</SelectItem>
                  <SelectItem value='Impact' style={{ fontFamily: 'Impact' }}>Impact</SelectItem>
                  <SelectItem value='Comic Sans MS' style={{ fontFamily: 'Comic Sans MS' }}>Comic Sans MS</SelectItem>
                  <SelectItem value='Courier New' style={{ fontFamily: 'Courier New' }}>Courier New</SelectItem>
                  <SelectItem value='Inter' style={{ fontFamily: 'Inter' }}>Inter</SelectItem>
                </SelectContent>
              </Select>
              <span className='text-xs text-[#5e5e5e] w-10 text-right'>
                Size
              </span>
              <NumberInputWithUnit
                unit='px'
                defaultValue={selectedTrackItem.config?.fontSize ?? 40}
                min={1}
                step={1}
                max={180}
                className={cn('border-none w-16')}
                onValueChange={e =>
                  updateTextClip(selectedTrackItem, 'fontSize', e)
                }
              />
            </div>
            <hr className='my-2 border-gray-200' />
          </section>

          <section>
            <div className='flex items-center gap-4 mb-2'>
              <span className='text-xs font-medium text-[#5e5e5e]'>Color</span>
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant='outline'
                    className='flex items-center gap-2 p-1'
                  >
                    <span
                      className='h-4 w-4 rounded-full border'
                      style={{ backgroundColor: textColor }}
                    />
                    <span
                      style={{
                        minWidth: 72,
                        fontFamily: 'monospace',
                        display: 'inline-block'
                      }}
                    >
                      {textColor}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto z-50'>
                  <FrappeColorPicker
                    value={textColor}
                    onChange={color => {
                      updateTextClip(selectedTrackItem, 'color', color)
                      setTextColor(color)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <hr className='my-2 border-gray-200' />
          </section>

          <section>
            <h3 className='text-xs font-semibold text-[#2e2e2e] mb-2'>
              Stroke
            </h3>
            <div className='flex items-center gap-4 mb-2'>
              <Checkbox
                checked={selectedTrackItem.config.showStroke}
                className='mr-2'
                onCheckedChange={() =>
                  updateTextClip(
                    selectedTrackItem,
                    'showStroke',
                    !selectedTrackItem.config.showStroke
                  )
                }
              />
              <span className='text-xs text-[#5e5e5e]'>Show Stroke</span>
              <span className='text-xs text-[#5e5e5e] ml-4'>Width</span>
              <NumberInputWithUnit
                unit='px'
                max={50}
                min={0}
                className='w-14'
                onValueChange={val =>
                  updateTextClip(selectedTrackItem, 'strokeWidth', val)
                }
              />
            </div>
            <div className='flex items-center gap-4 mb-2'>
              <span className='text-xs text-[#5e5e5e]'>Color</span>
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant='outline'
                    className='flex items-center gap-2 p-1'
                  >
                    <span
                      className='h-4 w-4 rounded-full border'
                      style={{ backgroundColor: strokeColor }}
                    />
                    <span
                      style={{
                        minWidth: 72,
                        fontFamily: 'monospace',
                        display: 'inline-block'
                      }}
                    >
                      {strokeColor}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto z-50'>
                  <FrappeColorPicker
                    value={strokeColor}
                    onChange={color => {
                      updateTextClip(selectedTrackItem, 'strokeColor', color)
                      setStrokeColor(color)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <hr className='my-2 border-gray-200' />
          </section>

          <section>
            <h3 className='text-xs font-semibold text-[#2e2e2e] mb-2'>
              Shadow
            </h3>
            <div className='flex items-center gap-4 mb-2'>
              <Checkbox
                checked={selectedTrackItem.config.showShadow}
                className='mr-2'
                onCheckedChange={() =>
                  updateTextClip(
                    selectedTrackItem,
                    'showShadow',
                    !selectedTrackItem.config.showShadow
                  )
                }
              />
              <span className='text-xs text-[#5e5e5e]'>Show Shadow</span>
            </div>
            <div className='flex flex-row justify-between gap-2 mb-2'>
              <div className='flex flex-col items-center'>
                <span className='text-xs text-[#5e5e5e]'>Offset X</span>
                <NumberInputWithUnit
                  unit='px'
                  max={20}
                  min={-20}
                  className='w-12'
                  onValueChange={val =>
                    updateTextClip(selectedTrackItem, 'shadowOffsetX', val)
                  }
                />
              </div>
              <div className='flex flex-col items-center'>
                <span className='text-xs text-[#5e5e5e]'>Offset Y</span>
                <NumberInputWithUnit
                  unit='px'
                  max={20}
                  min={-20}
                  className='w-12'
                  onValueChange={val =>
                    updateTextClip(selectedTrackItem, 'shadowOffsetY', val)
                  }
                />
              </div>
              <div className='flex flex-col items-center'>
                <span className='text-xs text-[#5e5e5e]'>Blur</span>
                <NumberInputWithUnit
                  unit='px'
                  max={20}
                  min={0}
                  className='w-12'
                  onValueChange={val =>
                    updateTextClip(selectedTrackItem, 'shadowBlur', val)
                  }
                />
              </div>
            </div>
            <hr className='my-2 border-gray-200' />
          </section>
          <section>
            <h3 className='text-xs font-semibold text-[#2e2e2e] mb-2'>
              Animation
            </h3>
            <div className='flex flex-row items-center gap-2 mb-2'>
              <Select
                defaultValue='none'
                value={selectedTrackItem.config.animationType as string}
                onValueChange={value =>
                  updateTextClip(selectedTrackItem, 'animationType', value)
                }
              >
                <SelectTrigger className='bg-white border-none w-[120px]'>
                  <SelectValue placeholder='None' />
                </SelectTrigger>
                <SelectContent className='font-medium bg-[#f6f6f6]'>
                  <SelectItem value='None'>None</SelectItem>
                  <SelectItem value='typewriter'>Typewriter</SelectItem>
                  <SelectItem value='slide'>Slide</SelectItem>
                  <SelectItem value='fade'>Fade</SelectItem>
                  <SelectItem value='blur'>Blur</SelectItem>
                  <SelectItem value='pop'>Pop</SelectItem>
                  <SelectItem value='bounce'>Bounce</SelectItem>
                  <SelectItem value='reveal'>Reveal</SelectItem>
                </SelectContent>
              </Select>
              <span className='text-xs text-[#5e5e5e] ml-2'>Duration</span>
              <NumberInputWithUnit
                unit='sec'
                onValueChange={val =>
                  updateTextClip(
                    selectedTrackItem,
                    'animationDuration',
                    val * 1e6
                  )
                }
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
                className='border-none w-14 h-8'
              />
            </div>
          </section>

          <section>
            <h3 className='text-xs font-semibold text-[#2e2e2e] mb-2'>
              Others
            </h3>
            <div className='flex items-center gap-4 mb-2'>
              <span className='text-xs text-[#5e5e5e]'>Opacity</span>
              <Slider
                min={0}
                max={1}
                defaultValue={[selectedTrackItem.config.opacity as number]}
                value={[selectedTrackItem.config.opacity as number]}
                step={0.01}
                onValueChange={val =>
                  updateTextClip(selectedTrackItem, 'opacity', val)
                }
                className='w-[120px]'
              />
              <span className='ml-2 text-xs font-black'>
                {selectedTrackItem.config.opacity as number}
              </span>
            </div>
            <hr className='my-2 border-gray-200' />
          </section>
        </div>
      ) : selectedTrackItem?.type === 'EFFECT' ? (
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3  w-80 h-full'></div>
      ) : (
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 justify-start w-80 h-full'>
          <h3 className='text-sm font-medium text-[#4e4e4e] self-center'>
            Select a clip to edit properties
          </h3>
        </div>
      )}{' '}
    </div>
  )
})

export default Player
