import React, { useEffect, useRef, useState } from 'react'
import galleryIcon from './icons/gallery.svg'
import shapesIcon from './icons/shapes.svg'
import textIcon from './icons/text.svg'
import Slider from '../components/ui/slider'

const SideBar = () => {
  const sliderRef = useRef<HTMLInputElement>(null)

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
  const [selected, setSelected] = useState('gallery')
  return (
    <div className='flex h-screen ml-2'>
      <div className='w-12 flex flex-col items-center py-4 space-y-6'>
        <button
          className={`p-1 rounded-md ${
            selected === 'gallery' ? 'bg-[#e2e2e2]' : 'hover:bg-[#e6e6e6]'
          }`}
          onClick={() => setSelected('gallery')}
        >
          <img src={galleryIcon} alt='Gallery' />
        </button>
        <button
          className={`p-1 rounded-md ${
            selected === 'shapes' ? 'bg-[#e2e2e2]' : 'hover:bg-[#e6e6e6]'
          }`}
          onClick={() => setSelected('shapes')}
        >
          <img src={shapesIcon} alt='Shapes' />
        </button>
        <button
          className={`p-1 rounded-md ${
            selected === 'text' ? 'bg-[#e2e2e2]' : 'hover:bg-[#e6e6e6]'
          }`}
          onClick={() => setSelected('text')}
        >
          <img src={textIcon} alt='Text' />
        </button>
      </div>

      {selected === 'gallery' && (
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
              <Slider onChange={()=>{}}/>
            </div>
            <div className='flex items-center space-x-2 mt-2'>
              <span className='text-xs text-gray-500'>Padding</span>
            
              <Slider  onChange={(e) =>{}} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default SideBar

