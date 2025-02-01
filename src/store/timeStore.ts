import {create} from 'zustand';

type TimeStore = {
    currentTime: number;
    setCurrentTime: (newTime: number, duration: number)=>void;
};

const useTimeStore = create<TimeStore>((set) => ({
    currentTime: 0,
    setCurrentTime: (duration, newTime) => {
        const clampedTime = Math.max(0, Math.min(newTime, duration));
        set({ currentTime: clampedTime });
    },
}));

export default useTimeStore;