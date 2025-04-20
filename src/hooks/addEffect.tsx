import { ImageClip } from "@/class/imageTrack"
import { VideoSprite } from "@/class/videoSprite"
import { Button } from "@/components/ui/button"
import { createZoomBlurShader } from "@/effects/createMotionBlur"
import { useAVCanvasStore } from "@/store/avCanvasStore"
import useEffectsStore from "@/store/effectStore"
import usePlayerStore from "@/store/playerStore"
import useSpriteStore from "@/store/spriteStore"
import { useTrackStateStore } from "@/store/trackStore"
import { ImageConfig } from "@/types/imageConfig"
import { EffectTrack } from "@/types/trackType"
import { loadImage } from "@/utils/helpers"
import { VisibleSprite } from "@webav/av-cliper"
import { nanoid } from "nanoid"

import React from "react"

const AddEffect = () => {
    const trackId = useTrackStateStore(state=>state.selectedTrackId)
    const trackStore = useTrackStateStore()
    const currentTime = usePlayerStore(state=> state.currentTime)

    const addEffectToClip = async ( startTime:number,hold:number,videoId:string) => {
        const { sprite } = useSpriteStore.getState();
        const { applyEffect} = useEffectsStore.getState();
        if(!trackId ){
            console.warn('no track id');
            return
        }

        const currentSprite = sprite.get(trackId);
        
        if (!currentSprite) return console.warn(`sprite with id ${trackId} not found`);
        const endTime = startTime + hold  
        const trackItem = trackStore.selectedTrackItem;
        if (!trackItem) return;
//init effect        
        const zoomBlur = createZoomBlurShader({
            zoomCoords: [0,1],
            zoomDepth: 1.0,
            startTime: startTime,
            holdDuration: hold
          })
//apply the effect
        applyEffect(trackItem, async (videoFrame: ImageBitmap | VideoFrame)  => {return await zoomBlur(videoFrame); },startTime,endTime);
    
        console.log(`effect applied on track ${trackId}`);
    };
  

return (
    <Button variant={'outline'} 
    className="border rounded-md p-2 w-full bg-[#f6f6f6] min-h-2 mt-2 text-[#5e5e5e] "

     onClick={ async() =>  addEffectToClip(currentTime ,5000)}>
    
    <h3 className='text-sm self-start text-[#9e9e9e]'> Zoom Effect</h3>
    </Button>
)
}
export default AddEffect