import { AVCanvas } from "@webav/av-canvas";
import { create } from "zustand";

interface AVCanvasStore {
  avCanvas: AVCanvas | null;
  setAvCanvas: (canvas: AVCanvas | null) => void;
}

export const useAVCanvasStore = create<AVCanvasStore>((set) => ({
  avCanvas: null,
  setAvCanvas: (canvas) => set({ avCanvas: canvas }),
}));
