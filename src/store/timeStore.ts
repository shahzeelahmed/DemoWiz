import {create} from 'zustand';

type TimeStoreState = {
    currentTime: number;
   
};
type TimeStoreActions = {
    
    setCurrentTime: (duration: number,time:number) => void
  }
  type TimeStore = TimeStoreState & TimeStoreActions  
const timeStore = create<TimeStore>((set) => ({
    currentTime: 0,
    setCurrentTime: (duration,newTime) => {
        const clampedTime = Math.max(0, Math.min(duration, newTime));
        set({ currentTime: clampedTime });
    },
}));

export default timeStore;

