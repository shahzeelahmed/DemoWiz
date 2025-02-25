export type tracksType = 'IMAGE' | 'VIDEO' | 'TEXT' | 'TRANSITION' | 'EFFECT' | 'AUDIO'
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
  index: number
  isVisible?: boolean
  isMuted?: boolean
  height?: number
  color?: string
}

export interface VideoTrack extends BaseTrack {
  id: string
  type: string
  duration: number
  height: number
  width: number
  format: string
  volume: number
  fps:number
  position: {
    x: number
    y: number
  }
  transform: {
    scaleX: number
    scaleY: number
    rotation: number
  }
}
export interface AudioTrack extends BaseTrack {
  id: string
  type:string
  duration:number
  volume: number
  format: string
}
export interface TextTrack extends BaseTrack {
  id: string
  height: number
  text: string
  width: number
  format: string
  position: {
    x: number
    y: number
  }
  transform: {
    scaleX: number
    scaleY: number
    rotation: number
  }
}
export interface ImageTrack extends BaseTrack {
  id: string
  type: string,
  duration: number
  position: {
    x: number
    y: number
  }
  transform: {
    scaleX: number
    scaleY: number
    rotation: number
  }
  height: number
  width: number
  format: string
}
export interface TransitionTrack extends BaseTrack {
name: string

}
export interface EffectTrack extends BaseTrack{
    name: string
    effectType: string
}

export type TrackItemType = VideoTrack | ImageTrack | AudioTrack | TextTrack | EffectTrack | TransitionTrack
