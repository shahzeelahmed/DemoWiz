import { VisibleSprite } from '@webav/av-cliper'
import { useState, useCallback, useEffect } from 'react'
import usePlayerStore from '../../store/playerStore'
import { AVCanvas } from '@webav/av-canvas'

const Player = () => {
  const spriteMap = new Map<string, VisibleSprite>()
  const playerStore = usePlayerStore()
  const isPaused = playerStore.isPaused
  const currentTime = playerStore.currentTime
  const [avCanvas, setAvCanvas] = useState<AVCanvas | null>(null)
  const [cvsWrapEl, setCvsWrapEl] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (cvsWrapEl == null) return
    avCanvas?.destroy()
    const cvs = new AVCanvas(cvsWrapEl, {
      bgColor: '#000',
      width: 1080,
      height: 720
    })
    setAvCanvas(cvs)
    cvs.on('timeupdate', time => {
      if (time == null) return
      playerStore.setCurrentTime(time / 1e6)
    })
    cvs.on('playing', () => {
      playerStore.setPaused(false)
    })
    cvs.on('paused', () => {
      playerStore.setPaused(true)
    })

    return () => {
      cvs.destroy()
    }
  }, [cvsWrapEl])
  const prevFrame = useCallback(() => {
    if (avCanvas === null) return
    if (!isPaused) {
      playerStore.setPaused(true)
    }
    avCanvas.on('timeupdate', time => {
      if (time == null) return
      playerStore.setCurrentTime(time - 1 / 1e6)
    })
    avCanvas.previewFrame(currentTime)
  }, [currentTime, isPaused, cvsWrapEl])
  const nextFrame = useCallback(() => {
    if (avCanvas === null) return
    if (!isPaused) {
      playerStore.setPaused(true)
    }
    avCanvas.on('timeupdate', time => {
      if (time == null) return
      playerStore.setCurrentTime(time + 1 / 1e6)
    })
    avCanvas.previewFrame(currentTime)
  }, [currentTime, isPaused, cvsWrapEl])
}
export default Player
