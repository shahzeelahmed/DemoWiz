import videoStore from "@/store/videoStore"
import { VideoTrack } from "@/types/trackType"
import { MP4Clip, VisibleSprite } from "@webav/av-cliper"
import { nanoid } from "nanoid"
import { loadFile } from "@/utils/helpers"
import { useAVCanvasStore } from "@/store/avCanvasStore"
import useSpriteStore from "@/store/spriteStore"
import { useTrackStateStore } from "@/store/trackStore"
import usePlayerStore from "@/store/playerStore"
import { Button } from "@/components/ui/button"
import React from "react"
import fileIcon from '@/frappe-ui/icons/fileUpload.svg'
import { VideoSprite } from "@/class/videoEffectTrack"

 const addVideoSprite =  () => {
    const avCanvas = useAVCanvasStore(state=> state.avCanvas)
    const spriteMap = useSpriteStore(state=> state.sprite)
    const trackStore = useTrackStateStore()
    const currentTime = usePlayerStore(state=> state.currentTime)
    const spriteToadd = async() =>{
    const stream = (await loadFile({ 'video/*': ['.mp4', '.mov'] })).stream()
    const clip = new MP4Clip(stream)
    // const spr = new VisibleSprite(clip)
    const newspr = new VideoSprite(
      clip,             
    );
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
        opacity: 1,
        isMuted: false,
        duration: duration /1e6,
        height: 480,
        width: 720,
        startTime: currentTime,
        endTime: currentTime + duration/1e6,
        inRowId: rowId,
        volume: 1,
        fps: 30
      }
    ]

    trackStore.addRow({ id: rowId, acceptsType: 'MEDIA', trackItem: newTrack })
    trackStore.addTrack(newTrack)
    const spr = newspr as VisibleSprite
    spr.time.offset = currentTime * 1e6
    spr.time.duration = duration 
    console.log('video duration', duration/1e6 )
    spriteMap.set(trackId, spr)
    spr.rect.w = 480
    spr.rect.h = 270
    spr.rect.fixedScaleCenter = true
    spr.rect.center
    // spr.rect.fixedAspectRatio = true
    //@ts-ignore
   
    avCanvas!.addSprite(spr)}
    return(
        <Button variant={'outline'} 
        className='h-32 w-64 grid grid-rows-2 bg-[#e9e9e9] shadow-none border-none justify-items-center mt-2' 
        onClick={ spriteToadd  }>
        <img className='self-end' src={fileIcon} alt='video' height={32} width={32} /> 
        <h3 className='text-sm self-start text-[#6e6e6e]'> Upload a Video</h3>

        </Button>
    )
  }
export default addVideoSprite