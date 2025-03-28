import React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select"
import { Slider } from "@radix-ui/react-slider"
import { BoldIcon, ItalicIcon } from "lucide-react"
import UnderLineIcon from "../player/icons/underline"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { TextTrack } from "@/types/trackType"



const TextTrackConfig = (track: TextTrack | null) => {
    
    const config = track!.config
    return(
        <div className=' bg-white text-[#525252] text-[24px] p-4 flex flex-col gap-3 h-fit w-80 max-w-80 flex-none min-w-0'>
       
        <div className="grid grid-rows-2 gap-1"> 
  
   </div>
 
           <h3 className='text-sm font-medium'>STYLE</h3>
           <Slider/>
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
                 <SelectValue placeholder={`${config.fontFamily}`} />
               </SelectTrigger>
               <SelectContent className='font-medium bg-white'>
                 <SelectItem value='otetoro'>Otetoro</SelectItem>
                 <SelectItem value='sans-serif'>Sans Serif</SelectItem>
               </SelectContent>
             </Select>
             <h3 className='text-sm mt-3'>Size</h3>
             <Input
               type='number'
               defaultValue={config.fontSize}
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
             <h3 className='text-sm mt-3 text-[#8e8e8e]'>Spacing</h3>
 
             <span className="text-sm">Spacing: {track!.config.letterSpacing.toFixed(1)}</span>
       <Slider
        //  value={[spacing]} 
         min={0}
         max={100}
         defaultValue={[track!.config.letterSpacing]}
         step={1}
         onValueChange={()=>{}}
         className="w-48 "
       />
 
           </div>
         </div>
    )
}
export default TextTrackConfig