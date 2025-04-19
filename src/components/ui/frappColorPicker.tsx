//https://github.com/frappe/builder/blob/develop/frontend/src/components/Controls/ColorPicker.vue
import React, { useRef, useState, useCallback, useEffect, memo } from 'react'

const PALETTE = [
  '#FFB3E6',
  '#00B3E6',
  '#E6B333',
  '#3366E6',
  '#999966',
  '#99FF99',
  '#B34D4D',
  '#80B300'
]

function clamp (val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function hexToHSV (hex: string) {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16)
    g = parseInt(hex.slice(3, 5), 16)
    b = parseInt(hex.slice(5, 7), 16)
  }
  const rNorm = r / 255,
    gNorm = g / 255,
    bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm),
    min = Math.min(rNorm, gNorm, bNorm)
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max
  let h = 0
  if (max === min) h = 0
  else if (max === rNorm) h = (60 * ((gNorm - bNorm) / d) + 360) % 360
  else if (max === gNorm) h = (60 * ((bNorm - rNorm) / d) + 120) % 360
  else if (max === bNorm) h = (60 * ((rNorm - gNorm) / d) + 240) % 360
  return { h, s, v }
}

function HSVToHex (h: number, s: number, v: number) {
  s = s / 100
  v = v / 100
  let c = v * s
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  let m = v - c
  let r = 0,
    g = 0,
    b = 0
  if (0 <= h && h < 60) [r, g, b] = [c, x, 0]
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0]
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x]
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c]
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c]
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x]
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  ).toUpperCase()
}

export const FrappeHexColorPicker: React.FC<{
  value?: string
  onChange?: (hex: string) => void
  className?: string
}> = ({ value = '#FFFFFF', onChange, className = '' }) => {
  const colorMapRef = useRef<HTMLDivElement>(null)
  const hueMapRef = useRef<HTMLDivElement>(null)

  const [hex, setHex] = useState(value)
  const [hue, setHue] = useState(0)
  const [s, setS] = useState(0)
  const [v, setV] = useState(1)
  const [colorSelectorPos, setColorSelectorPos] = useState({ x: 0, y: 0 })
  const [hueSelectorPos, setHueSelectorPos] = useState({ x: 0, y: 0 })
  const [dragTarget, setDragTarget] = useState<'color' | 'hue' | null>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    if (draggingRef.current) return
    if (!value) return
    setHex(value)
    const hsv = hexToHSV(value)
    setHue(hsv.h)
    setS(hsv.s)
    setV(hsv.v)

    setTimeout(() => {
      if (colorMapRef.current && hueMapRef.current) {
        const colorRect = colorMapRef.current.getBoundingClientRect()
        const hueRect = hueMapRef.current.getBoundingClientRect()
        setColorSelectorPos({
          x: clamp(hsv.s * colorRect.width, 0, colorRect.width),
          y: clamp((1 - hsv.v) * colorRect.height, 0, colorRect.height)
        })
        setHueSelectorPos({
          x: clamp((hsv.h / 360) * hueRect.width, 0, hueRect.width),
          y: 0
        })
      }
    }, 0)
  }, [value])

  const handleMove = useCallback(
    (e: MouseEvent) => {
      if (dragTarget === 'color' && colorMapRef.current) {
        const rect = colorMapRef.current.getBoundingClientRect()
        let x = clamp(e.clientX - rect.left, 0, rect.width)
        let y = clamp(e.clientY - rect.top, 0, rect.height)
        setColorSelectorPos({ x, y })
        const s = x / rect.width
        const v = 1 - y / rect.height
        setS(s)
        setV(v)
        const newHex = HSVToHex(hue, s * 100, v * 100)
        setHex(newHex)
        if (onChange) onChange(newHex)
      } else if (dragTarget === 'hue' && hueMapRef.current) {
        const rect = hueMapRef.current.getBoundingClientRect()
        let x = clamp(e.clientX - rect.left, 0, rect.width)
        setHueSelectorPos({ x, y: 0 })
        const h = (x / rect.width) * 360
        setHue(h)
        const newHex = HSVToHex(h, s * 100, v * 100)
        setHex(newHex)
        if (onChange) onChange(newHex)
      }
    },
    [dragTarget, hue, s, v, onChange]
  )

  useEffect(() => {
    const handleMouseUp = () => {
      setDragTarget(null)
    }
    if (dragTarget) {
      draggingRef.current = true
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleMouseUp, { once: true })
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleMouseUp)
        draggingRef.current = false
      }
    } else {
      draggingRef.current = false
    }
  }, [dragTarget, handleMove])

  const handlePalette = (color: string) => {
    setHex(color)
    const hsv = hexToHSV(color)
    setHue(hsv.h)
    setS(hsv.s)
    setV(hsv.v)
    onChange?.(color)
    setTimeout(() => {
      if (colorMapRef.current && hueMapRef.current) {
        const colorRect = colorMapRef.current.getBoundingClientRect()
        const hueRect = hueMapRef.current.getBoundingClientRect()
        setColorSelectorPos({
          x: clamp(hsv.s * colorRect.width, 0, colorRect.width),
          y: clamp((1 - hsv.v) * colorRect.height, 0, colorRect.height)
        })
        setHueSelectorPos({
          x: clamp((hsv.h / 360) * hueRect.width, 0, hueRect.width),
          y: 0
        })
      }
    }, 0)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      setHex(val.toUpperCase())
      const hsv = hexToHSV(val)
      setHue(hsv.h)
      setS(hsv.s)
      setV(hsv.v)
      onChange?.(val.toUpperCase())
      setTimeout(() => {
        if (colorMapRef.current && hueMapRef.current) {
          const colorRect = colorMapRef.current.getBoundingClientRect()
          const hueRect = hueMapRef.current.getBoundingClientRect()
          setColorSelectorPos({
            x: clamp(hsv.s * colorRect.width, 0, colorRect.width),
            y: clamp((1 - hsv.v) * colorRect.height, 0, colorRect.height)
          })
          setHueSelectorPos({
            x: clamp((hsv.h / 360) * hueRect.width, 0, hueRect.width),
            y: 0
          })
        }
      }, 0)
    } else {
      setHex(val)
    }
  }

  const colorMapClass = 'h-24 w-44'
  const hueMapClass = 'h-3 w-44 mt-2'
  const paletteClass = 'mt-3 gap-1.5'
  const containerClass = 'p-3 rounded-lg shadow-lg bg-white w-fit'

  return (
    <div className={`frappe-hex-color-picker ${containerClass} ${className}`}>
      <div
        ref={colorMapRef}
        className={`relative m-auto rounded-md  ${colorMapClass}`}
        style={{
          background: `
            linear-gradient(0deg, black, transparent),
            linear-gradient(90deg, white, transparent),
            hsl(${hue}, 100%, 50%)
          `
        }}
        onMouseDown={e => {
          setDragTarget('color')
          handleMove(e.nativeEvent)
        }}
      >
        <div
          className='absolute rounded-full border border-black border-opacity-20'
          style={{
            height: '12px',
            width: '12px',
            left: `calc(${colorSelectorPos.x}px - 6px)`,
            top: `calc(${colorSelectorPos.y}px - 6px)`,
            color: hex || '#FFF',
            background: 'transparent',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              borderRadius: '50%',
              border: '2px solid #fff',
              background: 'currentColor',
              left: 0,
              top: 0
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '2px',
              top: '2px',
              height: 'calc(100% - 4px)',
              width: 'calc(100% - 4px)',
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,.2)',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      <div
        ref={hueMapRef}
        className={`relative m-auto rounded-md cursor-pointer ${hueMapClass}`}
        style={{
          background: `
            linear-gradient(90deg, hsl(0, 100%, 50%),
            hsl(60, 100%, 50%), hsl(120, 100%, 50%),
            hsl(180, 100%, 50%), hsl(240, 100%, 50%),
            hsl(300, 100%, 50%), hsl(360, 100%, 50%))
          `
        }}
        onMouseDown={e => {
          setDragTarget('hue')
          handleMove(e.nativeEvent)
        }}
      >
        <div
          className='absolute rounded-full border border-[rgba(0,0,0,.2)]'
          style={{
            height: '12px',
            width: '12px',
            left: `calc(${hueSelectorPos.x}px - 6px)`,
            color: `hsl(${hue}, 100%, 50%)`,
            background: 'transparent',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              borderRadius: '50%',
              border: '2px solid #fff',
              background: 'currentColor',
              left: 0,
              top: 0
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '2px',
              top: '2px',
              height: 'calc(100% - 4px)',
              width: 'calc(100% - 4px)',
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,.2)',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      <div className={`flex flex-wrap ${paletteClass}`}>
        {PALETTE.map(color => (
          <div
            key={color}
            className={`cursor-pointer rounded-full shadow-sm h-3.5 w-3.5`}
            style={{ background: color }}
            onClick={() => handlePalette(color)}
          />
        ))}
      </div>

      <div className='flex items-center gap-2 mt-3'>
        <input
          type='text'
          value={hex}
          onChange={handleInput}
          maxLength={7}
          className='border rounded font-mono w-24 h-8 px-2 text-xs'
          style={{ textTransform: 'uppercase' }}
          aria-label='Hex color'
        />
        <div
          className='rounded border w-6 h-6'
          style={{ background: hex, borderColor: '#ccc' }}
          aria-label='Color preview'
        />
      </div>
    </div>
  )
}

export const FrappeColorPicker = memo(FrappeHexColorPicker)
