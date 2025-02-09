import {create} from 'zustand';
import { PlayerState } from '../types/types';

const usePlayerStore = create<PlayerState>((set) => ({
  isLoading: false,
  canvasOptions: { width: 0, height: 0 },
  playerConfig: { frameCount: 0, playerWidth: 1080 / 6, playerHeight: 1920 / 6 },
  hasVideo: false,
  currentFrame: 0,
  targetTracks: new Map<string, any>(), 
  isPaused: true,

  setLoading: (loading) => set({ isLoading: loading }),
  setCanvasOptions: (options) => set({ canvasOptions: options }),
  setPlayerConfig: (config) => set({ playerConfig: config }),
  setHasVideo: (hasVideo) => set({ hasVideo }),
  setCurrentFrame: (frame) => set({ currentFrame: frame }),
  setTargetTracks: (tracks) => set({ targetTracks: tracks }),
  setPaused: (paused) => set({ isPaused: paused }),
}));

export default usePlayerStore;