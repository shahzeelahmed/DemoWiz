export interface EffectConfig {
    startTime: number 
    endTime: number 
    hasEffect:boolean ;
    zoomDuration: number 
    holdDuration: number
    maxZoom: number 
    focalPoint: { x: number; y: number } 
    zoomPositionIndex?: number
}