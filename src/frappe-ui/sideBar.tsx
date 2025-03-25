import React, { useEffect, useRef, useState } from 'react'
import textIcon from './icons/text.svg'
import filterIcon from './icons/magic-wand-svgrepo-com.svg'
import videoIcon from './icons/video.svg'
import imageIcon from './icons/image.svg'
import Slider from '../components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import useSidebarStore from '@/store/sideBarStore'
const SideBar = () => {
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
    <div className='flex h-screen ml-2'>
      <div className='w-12 flex flex-col items-center py-4 space-y-6 text-sm'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button
                className={`p-1 rounded-md ${
                  selectedIcon === 'gallery' ? 'bg-[#e2e2e2]' : 'hover:bg-[#e6e6e6]'
                }`}
                onClick={() => setSelectedIcon('gallery')}
              >
                <img src={videoIcon} alt='Gallery' height={32} width={32} />
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
                  selectedIcon === 'image' ? 'bg-[#e2e2e2]' : 'hover:bg-[#e6e6e6]'
                }`}
                onClick={() => setSelectedIcon('image')}
              >
                <img src={imageIcon} alt='image' height={32} width={32} />
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
                  selectedIcon === 'effects' ? 'bg-[#e2e2e2]' : 'hover:bg-[#e6e6e6]'
                }`}
                onClick={() => setSelectedIcon('effects')}
              >
                <img src={filterIcon} alt='effects' height={32} width={32} />
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
                  selectedIcon === 'text' ? 'bg-[#e2e2e2]' : 'hover:bg-[#e6e6e6]'
                }`}
                onClick={() => setSelectedIcon('text')}
              >
                <img src={textIcon} alt='Text' height={32} width={32} />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>
              <p>Text</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {selectedIcon === 'gallery' ?  (
        <div className='w-72 bg-white p-4'>
          <h2 className='text-[#1e1e1e] font-semibold text-lg'>Background</h2>

          <div className='mt-4 '>
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
            </div>
          </div>

          <div className='mt-4'>
            <h3 className='text-gray-600 text-sm mb-2'>Edit</h3>
            <div className='flex items-center space-x-2'>
              <span className='text-xs text-gray-500'>Blur</span>
              <Slider onChange={() => {}} />
            </div>
            <div className='flex items-center space-x-2 mt-2'>
              <span className='text-xs text-gray-500'>Padding</span>

              <Slider onChange={e => {}} />
            </div>
          </div>
        </div>
      ): selectedIcon === 'image' ? (   <div className='w-72 bg-white p-4'>
      <h2 className='text-[#1e1e1e] font-semibold text-lg'>Background</h2>

      <div className='mt-4 '>
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
        </div>
      </div>

      <div className='mt-4'>
        <h3 className='text-gray-600 text-sm mb-2'>Edit</h3>
        <div className='flex items-center space-x-2'>
          <span className='text-xs text-gray-500'>Blur</span>
          <Slider onChange={() => {}} />
        </div>
        <div className='flex items-center space-x-2 mt-2'>
          <span className='text-xs text-gray-500'>Padding</span>

          <Slider onChange={e => {}} />
        </div>
      </div>
    </div>) : selectedIcon === 'effects' ? (   <div className='w-72 bg-white p-4'>
          <h2 className='text-[#1e1e1e] font-semibold text-lg'>Background</h2>

          <div className='mt-4 '>
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
            </div>
          </div>

          <div className='mt-4'>
            <h3 className='text-gray-600 text-sm mb-2'>Edit</h3>
            <div className='flex items-center space-x-2'>
              <span className='text-xs text-gray-500'>Blur</span>
              <Slider onChange={() => {}} />
            </div>
            <div className='flex items-center space-x-2 mt-2'>
              <span className='text-xs text-gray-500'>Padding</span>

              <Slider onChange={e => {}} />
            </div>
          </div>
        </div>) : selectedIcon === 'text' ? (   <div className='w-72 bg-white p-4'>
          <h2 className='text-[#1e1e1e] font-semibold text-lg'>Background</h2>

          <div className='mt-4 '>
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
            </div>
          </div>

          <div className='mt-4'>
            <h3 className='text-gray-600 text-sm mb-2'>Edit</h3>
            <div className='flex items-center space-x-2'>
              <span className='text-xs text-gray-500'>Blur</span>
              <Slider onChange={() => {}} />
            </div>
            <div className='flex items-center space-x-2 mt-2'>
              <span className='text-xs text-gray-500'>Padding</span>

              <Slider onChange={e => {}} />
            </div>
          </div>
        </div>) : null}
    </div>
  )
}
export default SideBar
