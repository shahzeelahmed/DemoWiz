import React, { useEffect, useRef, useState } from 'react'
import textIcon from './icons/text.svg'
import filterIcon from './icons/magic-wand-svgrepo-com.svg'
import videoIcon from './icons/video.svg'
import imageIcon from './icons/image.svg'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import useSidebarStore from '@/store/sideBarStore'
import AddVideoSprite from '@/lib/addVideo'
import AddTextSprite from '@/lib/addText'
import AddImageSprite from '@/lib/addImage'
import AddEffect from '@/lib/addEffect'
const SideBar = React.memo(() => {
  const sliderRef = useRef<HTMLInputElement>(null)
  const sidebarStore = useSidebarStore()
  const selectedIcon = sidebarStore.selectedIcon
  const setSelectedIcon = sidebarStore.setSelectedIcon

  useEffect(() => {
    const sliderEl = sliderRef.current

    const sliderProgress = () => {
      if (sliderEl) {
        const sliderValue = sliderEl.value
        sliderEl.style.background = `linear-gradient(to right, #f50 ${sliderValue}%, #ccc ${sliderValue}%)`
      }
    }

    if (sliderEl) {
      sliderEl.addEventListener('input', sliderProgress)
      sliderProgress()
    }

    return () => {
      if (sliderEl) {
        sliderEl.removeEventListener('input', sliderProgress)
      }
    }
  }, [])
  
  return (
    <div className="relative z-0 flex   border-t-1 h-full " >
      <div className='w-12 flex flex-col items-center py-4 space-y-6 text-sm border-r-1'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className={`p-1 rounded-md ${
                  selectedIcon === 'video' ? 'bg-[#e9e9e9]' : 'hover:bg-[#e8e8e8]'
                }`}
                onClick={() => setSelectedIcon('video')}
              >
                <img src={videoIcon} alt='video' height={24} width={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>
              <p>Video</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className={`p-1 rounded-md ${
                  selectedIcon === 'image' ? 'bg-[#e9e9e9]' : 'hover:bg-[#e8e8e8]'
                }`}
                onClick={() => setSelectedIcon('image')}
              >
                <img src={imageIcon}  alt='image' height={24} width={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>
              <p>Image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className={`p-1 rounded-md ${
                  selectedIcon === 'effects' ? 'bg-[#e9e9e9]' : 'hover:bg-[#e8e8e8]'
                }`}
                onClick={() => setSelectedIcon('effects')}
              >
                <img src={filterIcon} alt='effects' height={24} width={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>
              <p>Effects</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className={`p-1 rounded-md ${
                  selectedIcon === 'text' ? 'bg-[#e9e9e9]' : 'hover:bg-[#e8e8e8]'
                }`}
                onClick={() => setSelectedIcon('text')}
              >
                <img src={textIcon} alt='Text' height={24} width={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>
              <p>Text</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {selectedIcon === 'video' ?  (
        <div className='w-72 bg-white p-4'>
          <h2 className='text-[#3e3e3e] font-medium text-lg'>Videos</h2>
          <AddVideoSprite/>
          {/* <Button variant={'outline'} className='h-32 w-64 grid grid-rows-2  justify-items-center mt-2' >
          <img className='self-end' src={fileIcon} alt='video' height={32} width={32} /> 
          <h3 className='text-sm self-start text-[#6e6e6e]'> Upload a Video</h3>

          </Button> */}

          {/* <div className='mt-4 '>
            <h3 className='text-[#383838] text-sm mb-2'>Recently Used</h3>
            <div className=' overflow-x-auto whitespace-nowrap   p-1 flex customScrollbar'>
              <div className='flex space-x-2  '>
                <div className='w-20 h-12 bg-red-500 rounded'></div>
                <div className='w-20 h-12 bg-red-300 rounded'></div>
                <div className='w-20 h-12 bg-red-300 rounded'></div>
              </div>
            </div>
          </div>
          <h3 className='mt-4  text-[#383838] text-sm mb-2'>Library</h3>
          <div className=' overflow-x-auto whitespace-nowrap   p-1 flex customScrollbar'>
            <div className='flex space-x-2  '>
              <div className='w-20 h-12 bg-red-500 rounded'></div>
              <div className='w-20 h-12 bg-red-300 rounded'></div>
              <div className='w-20 h-12 bg-red-300 rounded'></div>
            </div> */}
          {/* </div> */}

         
        </div>
      ): selectedIcon === 'image' ? (   <div className='w-72 bg-white p-4'>
      <h2 className='text-[#1e1e1e] font-medium text-lg'>Images</h2>
      <AddImageSprite/>

    </div>) : selectedIcon === 'effects' ? (   <div className='w-72 bg-white p-4'>
          <h2 className='text-[#1e1e1e] font-medium text-lg'>Effects</h2>
          <AddEffect/>

        
          
        </div>) : selectedIcon === 'text' ? (   <div className='w-72 bg-white p-4'>
          <h2 className='text-[#1e1e1e] font-medium text-lg'>Text</h2>
        
          <AddTextSprite />
          
        </div>) : null}
    </div>
  )
})
export default SideBar
