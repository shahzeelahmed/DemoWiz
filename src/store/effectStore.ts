import { TrackItemType } from '@/types/trackType'
import { create } from 'zustand'
import useSpriteStore from './spriteStore'
import { MP4Clip } from '@webav/av-cliper'
import usePlayerStore from './playerStore'
interface EffectData {
  trackId: string
  effectFunction: any
  startTime: number
  endTime:number
}

export type EffectState = {
  effectFunction: any
  hasEffect: boolean
  trackId: string
  startTime: number
  effectsMap: Map<string, EffectState>
  originalTickInterceptor: (_: any, tickRet: any) => Promise<any>
}

type EffectsStore = {
  effectsMap: Map<string, EffectState>
  applyEffect: (
    trackItem: TrackItemType,
    effectFunction: any,
    startTime: number,
    endTime:number
  ) => Promise<void>
  removeEffect: (trackItemId: string) => Promise<void>
}

const useEffectsStore = create<EffectsStore>((set, get) => ({
  effectFunction: null,
  activeEffects: new Map(),
  effectsMap: new Map(),

  applyEffect: async (
    trackItem: TrackItemType,
    effectFunction: any,
    startTime: number,
    endTime:number
  ) => {
    const { isPaused } = usePlayerStore.getState()
    const { effectsMap } = get()
    const { sprite } = useSpriteStore.getState()
    const originalSprite = sprite.get(trackItem.id)
    if (!originalSprite) return
    const originalClip = originalSprite.getClip() as MP4Clip

    const effectData: EffectData = {
      trackId: trackItem.id,
      effectFunction,
      startTime,
      endTime
    }

    const effectStateToStore: any = {
      hasEffect: true,
      effectsMap: get().effectsMap,
      ...effectData,
      originalTickInterceptor: originalClip.tickInterceptor
    }

    effectsMap.set(trackItem.id, effectStateToStore)

    originalClip.tickInterceptor = async (_, tickRet) => {
      if (!tickRet?.video) return tickRet

      const { currentTime } = usePlayerStore.getState()

      const state = effectsMap.get(trackItem.id) as any
      if (isPaused === false) {
        console.log('paused')
        return tickRet
      }

      try {
        const processedVideo = await (state.effectFunction as any)(
          tickRet.video,
          { currentTime, startTime: state.startTime }
        )
        return { ...tickRet, video: processedVideo }
      } catch (error) {
        return tickRet
      }
    }

    set({ effectsMap: new Map(effectsMap) })
  },

  removeEffect: async (trackItem: string) => {
    const { currentTime } = usePlayerStore.getState()
    const { sprite } = useSpriteStore.getState()
    const { effectsMap } = get()
    const spr = sprite.get(trackItem)
    if (!spr) return

    const clip = spr.getClip() as MP4Clip
    const effectState = effectsMap.get(trackItem)

    if (!effectState || !effectState.hasEffect) return

    clip.tickInterceptor = effectState.originalTickInterceptor
    effectsMap.delete(trackItem)

    set({ effectsMap: new Map(effectsMap) })
    // spr.preFrame(currentTime * 1e6);
  },

  updateEffectParams: (
    trackItem: TrackItemType,
    newParams: any,
    effectFunction: any,
    startTime: number
  ) => {
    const { effectsMap, applyEffect } = get()
    const { sprite } = useSpriteStore.getState()
    const effectState = effectsMap.get(trackItem.id)

    if (!effectState || !effectState.hasEffect) {
      return applyEffect(trackItem, effectFunction, startTime)
    }

    set({ effectsMap: new Map(effectsMap) })
  }
}))
export default useEffectsStore
