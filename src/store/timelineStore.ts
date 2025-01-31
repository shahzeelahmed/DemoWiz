import { create } from 'zustand';

interface PlayerState {
    playerConfig: {
        frameCount: number;
        playerWidth: number;
        playerHeight: number;
    };
    canvasOptions: {
        width: number;
        height: number;
    };
    existVideo: boolean;
    playStartFrame: number;
    playTargetTrackMap: Map<any, any>;
    isPaused: boolean;
    setState: (updates: Partial<PlayerState>) => void;
}

const usePlayerState = create<PlayerState>((set) => ({
    playerConfig: { frameCount: 0, playerWidth: 180, playerHeight: 320 },
    canvasOptions: { width: 0, height: 0 },
    existVideo: false,
    playStartFrame: 0,
    playTargetTrackMap: new Map(),
    isPaused: true,

    setState: (updates) => set((state) => ({ ...state, ...updates })),
}));

export default usePlayerState;


