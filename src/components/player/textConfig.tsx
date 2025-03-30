import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select"
import { Slider } from "@radix-ui/react-slider"
import { BoldIcon, ItalicIcon } from "lucide-react"
import React, { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import UnderLineIcon from "./icons/underline"
import useSpriteStore from "@/store/spriteStore"
import usePlayerStore from "@/store/playerStore"
import { useTrackStateStore } from "@/store/trackStore"
import { TextConfig } from "@/types/textConfig"
import { TextClip } from "@/class/textTrack"
import { TextTrack, TrackItemType } from "@/types/trackType"
import { VisibleSprite } from "@webav/av-cliper"


const TextEditBar=  () =>{
    const trackId = useTrackStateStore(state => state.selectedTrackId)
    const clip = useTrackStateStore(state => state.selectedTrackItem as TrackItemType) 
    const currentTime = usePlayerStore(state=>state.currentTime)
    const playerStore = usePlayerStore()
    const spriteMap = useSpriteStore(state => state.sprite)
    const updateClip = async (clip: TrackItemType, changes: TextTrack) => {
        playerStore.setPaused(true);
        console.log('updateClip', clip, changes);
      
        if (!spriteMap.has(clip.id)) return;
      
        const spr = spriteMap.get(clip.id) as VisibleSprite;
      
      
        // if (changes.startTime !== undefined) {
        //   spr.time.offset = changes.startTime * 1e6;
        // }
        // if (changes.duration !== undefined) {
        //   spr.time.duration = Number(changes.duration) * 1e6;
        // }
        // if (changes.opacity !== undefined) {
        //   spr.opacity = Number((changes.opacity / 100).toFixed(2));
        // }
      
        
      
        if (clip.type === 'TEXT' ) {
          const textClip: TextClip = spr.getClip() as TextClip;
          textClip.textConfig = changes.config;
          spr.preFrame(currentTime * 1e6);
        }
      
      
        }
      
       
      };
   
      const handleChange = (key:any, value:any) => {
        if (clip.type === 'TEXT'){
        setTextConfig(prev => ({ ...prev, [key]: value }));
    
        updateClip({ ...clip, [key]: value, textConfig: { ...clip, [key]: value } });}
      };
    


return(
    <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit w-80 max-w-80 flex-none min-w-0'>
          <div className='grid grid-rows-2 gap-1'></div>

          <h3 className='text-sm font-medium'>STYLE</h3>
          <Slider />
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
              <div className='flex h-7 w-8 justify-center items-center rounded-md border border-gray-500 mt-4 '>
                <input type='color' className='w-[30px] rounded-4xl' />
              </div>
            </div>
            <h3 className='text-sm mt-3 text-[#8e8e8e]'>Opacity</h3>

            <span className='text-sm'>Opacity: {opacity.toFixed(1)}</span>
            <Slider
              value={[spacing]}
              min={0}
              max={100}
              defaultValue={[0]}
              step={1}
              onValueChange={() => {}}
              className='w-[250px] '
            />
          </div>
        </div>
)
} 

export default TextEditBar