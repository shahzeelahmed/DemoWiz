import { create } from 'zustand'
interface canvasInfo {
  width: number
  height: number
}
interface playerInfo {
  frameCount: number
  playerWidth: number
  playerHeight: number
}
type playerState = {
  isLoading: boolean
  isPaused: boolean
  canvasInfo: canvasInfo
  playerInfo: playerInfo
  hasVideo: boolean
  currentFrame: number
  targetTrack: Map<string, any>
}
type playerActions = {
  setLoading: (loading: boolean) => void
  setPaused: (paused: boolean) => void
  setCanvasInfo: (info: canvasInfo) => void
  setPlayerInfo: (info: playerInfo) => void
  setHasVideo: (hasVideo: boolean) => void
  setCurrentFrame: (frame: number) => void
  setTargetTrack: (track: Map<string, any>) => void
}

const usePlayerStore = create<playerState & playerActions>(set => ({
  isLoading: false,
  canvasInfo: { width: 0, height: 0 },
  playerInfo: { frameCount: 0, playerWidth: 1080 / 6, playerHeight: 1920 / 6 },
  hasVideo: false,
  currentFrame: 0,
  targetTrack: new Map<string, any>(),
  isPaused: true,

  setLoading: loading => set({ isLoading: loading }),
  setCanvasInfo: info => set({ canvasInfo: info }),
  setPlayerInfo: info => set({ playerInfo: info }),
  setHasVideo: hasVideo => set({ hasVideo }),
  setCurrentFrame: frame => set({ currentFrame: frame }),
  setTargetTrack: tracks => set({ targetTrack: tracks }),
  setPaused: paused => set({ isPaused: paused })
}))

export default usePlayerStore
