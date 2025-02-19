import { nanoid } from 'nanoid'
import { CanvasConfig, DrawConfig, UserConfig } from '../types/types'

export function formatTime (time: number): {
  s: number
  m: number
  h: number
  str: string
} {
  const totalSeconds = Math.ceil(time / 1000)

  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)

  const formattedTime = [
    hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '',
    `${minutes.toString().padStart(2, '0')}:`,
    seconds.toString().padStart(2, '0')
  ].join('')

  return {
    s: seconds,
    m: minutes,
    h: hours,
    str: formattedTime
  }
}

export const DEFAULT_DRAW_CONFIG: DrawConfig = {
  shortLineColor: '#a1a1aa',
  longLineColor: '#d4d4d8',
  textColor: '#71717a',
  lineWidth: 1
}

export const generateId = () => nanoid(5);