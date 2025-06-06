import { ImageConfig } from './imageConfig'
import { TextConfig } from './textConfig'

export type TrackType =
  | 'IMAGE'
  | 'VIDEO'
  | 'TEXT'
  | 'TRANSITION'
  | 'EFFECT'
  | 'AUDIO'

export interface MediaAsset {
  id: string
  type: string
  format: string
  metadata: {
    createdAt: Date
    modifiedAt: Date
  }
  fileSize: number
}

export interface BaseTrack {
  id: string
  name: string
  source?: string
  index?: number
  type: TrackType
  isVisible?: boolean
  isMuted?: boolean
  duration?: number
  height?: number
  color?: string
  startTime?: number
  endTime?: number
  inRowId?: string
  atTime?: number
  opacity?: number
}

export interface PositionableTrack {
  position?: {
    x: number
    y: number
  }
  transform?: {
    scaleX: number
    scaleY: number
    rotation: number
  }
}

export interface MediaTrack extends BaseTrack {
  format?: string
  frameCount?: number
}

export interface VideoTrack extends MediaTrack, PositionableTrack {
  type: 'VIDEO'
  height: number
  width: number
  volume: number
  fps?: number
}
export interface Transition {
  id: string;
  type: string; 
  trackId1: string;
  trackId2: string; 
  startTime: number; 
  duration: number; 
  parameters?: Record<string, any>; 
}
export interface AudioTrack extends MediaTrack {
  type: 'AUDIO'
  volume: number
}

export interface TextTrack extends BaseTrack {
  type: 'TEXT'
  config: TextConfig
}

export interface ImageTrack extends MediaTrack, PositionableTrack {
  type: 'IMAGE'
  height?: number
  width?: number
  config: ImageConfig
}

export interface TransitionTrack extends BaseTrack {
  type: 'TRANSITION'
}

export interface EffectTrack extends BaseTrack {
  type: 'EFFECT'
  effectType: string
  positionIndex?: number
}

export type TrackItemType =
  | TextTrack
  | VideoTrack
  | ImageTrack
  | AudioTrack
  | EffectTrack
  | TransitionTrack
