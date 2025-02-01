import { createStore } from 'zustand';
import {create} from 'zustand';

type TimeStoreState = {
    currentTime: number;
    // duration: number;
    // newTime: number;
    // setCurrentTime: (newTime: number, duration: number)=>void;
};
type updatedTime ={
    newTime: number;
    duration: number;
}
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

