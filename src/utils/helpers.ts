import { nanoid } from 'nanoid'
import { DrawConfig } from '../types/types'


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
export const formatHourTime = (tick: number) => {
  const totalMinutes = tick;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h:${minutes.toString().padStart(2, '0')}`;
};


export const formatMinuteTime = (tick: number) => {
  const totalSeconds = Math.floor(tick * 6);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m:${seconds.toString().padStart(2, '0')}`;
};

// Format time for seconds display (M:SS)
export const formatSecondTime = (tick: number) => {
  // Each tick represents 0.1 seconds
  const seconds = Math.floor(tick / 10);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString()}s`;
};


export const generateId = () => nanoid(5);