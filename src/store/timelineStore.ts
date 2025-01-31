import { create } from 'zustand';

const usePlayerState = create((set) => ({
  playerConfig: { frameCount: 0, playerWidth: 180, playerHeight: 320 },
  canvasOptions: { width: 0, height: 0 },
  existVideo: false,
  playStartFrame: 0,
  playTargetTrackMap: new Map(),
  isPaused: true,

  setState: (updates) => set((state) => ({ ...state, ...updates })),
}));

export default usePlayerState;
