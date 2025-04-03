import { nanoid } from 'nanoid'
import { DrawConfig } from '../types/types'
import usePlayerStore from '@/store/playerStore'
import { EffectState } from '@/store/effectStore'
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

export const formatHourTime = (tick: number): string => {
  const minutes = tick
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h:${remainingMinutes.toString().padStart(2, '0')}m`
}

export const formatMinuteTime = (tick: number): string => {
  const seconds = tick
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m:${remainingSeconds.toString().padStart(2, '0')}s`
}


export const formatSecondTime = (tick: number): string => {
  //tick is in seconds [tick = 1s]
  const seconds = tick 
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
export async function loadFile (accept: Record<string, string[]>) {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{ accept }]
  })
  return (await fileHandle.getFile()) as File
}
export async function loadImage(accept: Record<string, string[]>): Promise<Uint8Array> {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{ accept }],
  });
  const file = await fileHandle.getFile();

  if (file.type.startsWith('image/')) {
    return await file.arrayBuffer().then((buffer:any) => new Uint8Array(buffer));
  } else {
    return file;
  }
}



export const generateId = () => nanoid(5)
export const getPlayheadSpeed = (zoom: number): number => {
  const mapping: { [key: number]: { timeInSec: number; pixels: number } } = {
    1.0: { timeInSec: 5, pixels: 50 },
    0.9: { timeInSec: 5, pixels: 45 },
    0.8: { timeInSec: 5, pixels: 40 },
    0.7: { timeInSec: 10, pixels: 70 },
    0.6: { timeInSec: 10, pixels: 60 },
    0.5: { timeInSec: 10, pixels: 50 },
    0.4: { timeInSec: 3600, pixels: 240 },
    0.3: { timeInSec: 3840, pixels: 180 }
  }
  const key = Math.round(zoom * 10) / 10
  if (mapping[key] !== undefined) {
    const { timeInSec, pixels } = mapping[key]
    return pixels / timeInSec
  }
  return 10
}
export const getSecondsPerPixel = (zoom: number): number => {
  const mapping: { [key: number]: { timeInSec: number; pixels: number } } = {
    1.0: { timeInSec: 5, pixels: 50 },
    0.9: { timeInSec: 5, pixels: 45 },
    0.8: { timeInSec: 5, pixels: 40 },
    0.7: { timeInSec: 10, pixels: 70 },
    0.6: { timeInSec: 10, pixels: 60 },
    0.5: { timeInSec: 10, pixels: 50 },
    0.4: { timeInSec: 3600, pixels: 240 },
    0.3: { timeInSec: 3840, pixels: 180 }
  }

  const key = Math.round(zoom * 10) / 10

  if (mapping[key] !== undefined) {
    const { timeInSec, pixels } = mapping[key]
    return timeInSec / pixels
  }
  return 0.1
}
export const convertPixelsToSeconds = (
  zoom: number,
  pixels: number
): number => {
  const mapping: { [key: number]: { timeSec: number; pixels: number } } = {
    1.0: { timeSec: 5, pixels: 50 },
    0.9: { timeSec: 5, pixels: 45 },
    0.8: { timeSec: 5, pixels: 40 },
    0.7: { timeSec: 10, pixels: 70 },
    0.6: { timeSec: 10, pixels: 60 },
    0.5: { timeSec: 10, pixels: 50 },
    0.4: { timeSec: 3600, pixels: 240 },
    0.3: { timeSec: 3840, pixels: 180 }
  }
  const key = Math.round(zoom * 10) / 10

  if (mapping[key] !== undefined) {
    const { timeSec, pixels: mappedPixels } = mapping[key]
    const secondsPerPixel = timeSec / mappedPixels
    return pixels * secondsPerPixel
  }
  return pixels * 0.1
}
