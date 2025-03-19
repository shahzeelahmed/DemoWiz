import React, { useRef, useEffect } from 'react'
import { SliderProps } from '../../types/uiTypes'

function Slider ({
  min = 0,
  max = 100,
  defaultValue = 0,
  width = '300px',
  onChange
}: SliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sliderEl = sliderRef.current

    const progressScript = () => {
      if (sliderEl) {
        const sliderValue = parseInt(sliderEl.value, 10)
        sliderEl.style.background = `linear-gradient(to right, #1e1e1e ${sliderValue}%, #ccc ${sliderValue}%)`
        if (onChange) {
          onChange(sliderValue)
        }
      }
    }

    if (sliderEl) {
      sliderEl.addEventListener('input', progressScript)
      progressScript()
    }

    return () => {
      if (sliderEl) {
        sliderEl.removeEventListener('input', progressScript)
      }
    }
  }, [onChange])

  return (
    <input
      ref={sliderRef}
      type='range'
      min={min}
      max={max}
      defaultValue={defaultValue}
      style={{ width: width }}
    />
  )
}

export default Slider
