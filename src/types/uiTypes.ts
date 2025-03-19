export type LeftSidebarTabOption = "VIDEO" | "IMAGES" | "TEXT" | "EFFECTS" | "FILTER";
export interface SliderProps {
    min?: number
    max?: number
    defaultValue?: number
    width?: string
    onChange?: (value: number) => void
  }
  