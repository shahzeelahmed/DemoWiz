import {create} from 'zustand';

interface PlayerConfig {
  frameCount: number;
  playerWidth: number;
  playerHeight: number;
}

interface CanvasOptions {
  width: number;
  height: number;
}

interface PlayerState {
  isLoading: boolean;
  canvasOptions: CanvasOptions;
  playerConfig: PlayerConfig;
  hasVideo: boolean;
  currentFrame: number;
  targetTracks: Map<string, any>; // Type if you know the structure of the tracks
  isPaused: boolean;

  setLoading: (loading: boolean) => void;
  setCanvasOptions: (options: CanvasOptions) => void;
  setPlayerConfig: (config: PlayerConfig) => void;
  setHasVideo: (hasVideo: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  setTargetTracks: (tracks: Map<string, any>) => void; // Be more specific if possible
  setPaused: (paused: boolean) => void;
}

const usePlayerStore = create<PlayerState>((set) => ({
  isLoading: false,
  canvasOptions: { width: 0, height: 0 },
  playerConfig: { frameCount: 0, playerWidth: 1080 / 6, playerHeight: 1920 / 6 },
  hasVideo: false,
  currentFrame: 0,
  targetTracks: new Map<string, any>(), // Explicitly typed Map
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