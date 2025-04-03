import { TextClip } from "@/class/textTrack"
import { useAVCanvasStore } from "@/store/avCanvasStore"
import usePlayerStore from "@/store/playerStore"
import useSpriteStore from "@/store/spriteStore"
import { useTrackStateStore } from "@/store/trackStore"
import { TextConfig } from "@/types/textConfig"
import { loadFile, loadImage } from "@/utils/helpers"
import { MP4Clip, VisibleSprite } from "@webav/av-cliper"
import { nanoid } from "nanoid"
import { ImageTrack, TextTrack } from "@/types/trackType"
import { Button } from "@/components/ui/button"
import React from "react"
import fileIcon from '@/frappe-ui/icons/fileUpload.svg'
import { ImageConfig } from "@/types/imageConfig"
import { ImageClip } from "@/class/imageTrack"
const addImageSprite = () => {
    const avCanvas = useAVCanvasStore(state=> state.avCanvas)
    const spriteMap = useSpriteStore(state=> state.sprite)
    const trackStore = useTrackStateStore()
    const currentTime = usePlayerStore(state=> state.currentTime)

    const spriteToadd = async() =>{
    // const stream = (await loadFile({ 'image/*': ['.png', '.jpg','webp','jpeg'] })).stream()
    const file = (await loadImage({'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']}))

    
   
   
    const trackId = nanoid(5)
    const rowId = nanoid(5)

    const testImageConfig: ImageConfig = {
        data: file,
        opacity: 1,
        showShadow: false,
        shadowColor: '#FFFFFF',
        shadowBlur: 10,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowSpread: 2,
        showBorder: false,
        borderColor: '#007bff',
        borderWidth: 3,
        borderRadius: 0,
    }
    const clip = new ImageClip(testImageConfig)
    const id = nanoid(5)
    const itemToAdd: ImageTrack[] = [{
      id: trackId,
      type: 'IMAGE',
      name: 'test',
      inRowId: rowId,
      duration: 5,
      startTime: currentTime,
      endTime: currentTime + 5,
      config: testImageConfig
    }]

    trackStore.addRow({
      id: rowId,
      acceptsType: 'MEDIA',
      trackItem: itemToAdd
    })
    trackStore.addTrack(itemToAdd)
    

    const spr = new VisibleSprite(clip)
    spr.time.offset = currentTime * 1e6
    spriteMap.set(itemToAdd[0].id, spr)
    spr.rect.fixedScaleCenter = true
    spr.rect.fixedAspectRatio = true
    spr.time.duration = 5 * 1e6
    avCanvas!.addSprite(spr)

    

  
  
}
return (
    <Button variant={'outline'} className='h-32 w-64 grid grid-rows-2  justify-items-center mt-2' onClick={ spriteToadd}>
    <img className='self-end' src={fileIcon} alt='video' height={32} width={32} /> 
    <h3 className='text-sm self-start text-[#6e6e6e]'> Upload an Image</h3>
    </Button>
)
}
export default addImageSprite