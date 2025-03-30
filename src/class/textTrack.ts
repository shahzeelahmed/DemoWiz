import { TextConfig } from '@/types/textConfig'
import { IClip } from '@webav/av-cliper'
//[todo] add more text-animations
export class TextClip implements IClip {
  #cvsEl: HTMLCanvasElement
  #ctx: CanvasRenderingContext2D
  // #callback: (width: number, height: number) => void;
  ready: Promise<{ width: number; height: number; duration: number }>
  #textConfig: TextConfig
  #meta: {
    width: number
    height: number
    duration: number
  } = { width: 0, height: 0, duration: Infinity }

  get textConfig () {
    return this.#textConfig
  }

  set textConfig (config) {
    this.#textConfig = config
    this.#updateCanvasDimensions()
  }

  get meta () {
    return this.#meta
  }

  set meta (meta) {
    this.#meta = meta
  }

  constructor (
    textConfig: TextConfig,
    // callback: (width: number, height: number) => void
  ) {
    this.#cvsEl = document.createElement('canvas')
    this.#ctx = this.#cvsEl.getContext('2d')!
    this.#textConfig = textConfig
    // this.#callback = callback;
    this.#updateCanvasDimensions()

    this.ready = Promise.resolve({
      width: this.#meta.width,
      height: this.#meta.height,
      duration: this.#meta.duration
    })
  }

  #updateCanvasDimensions () {
    const contentList = this.#textConfig.content.split('\n')
    const { xPadding, yPadding } = this.#calcPadding()
    const textWidth = this.#getLineWidth(contentList)
    const textHeight = this.#getLineHeight(contentList)
    this.#cvsEl.width = textWidth + xPadding * 2
    this.#cvsEl.height = textHeight + yPadding * 2
    this.#meta.width = this.#cvsEl.width
    this.#meta.height = this.#cvsEl.height
  }

  #calcPadding () {
    const {
      showStroke,
      strokeWidth,
      showShadow,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY
    } = this.#textConfig
    const xPadding = Math.max(
      showStroke ? strokeWidth : 0,
      showShadow ? Math.max(shadowBlur, shadowOffsetX) : 0
    )
    const yPadding = Math.max(
      showStroke ? strokeWidth : 0,
      showShadow ? Math.max(shadowBlur, shadowOffsetY) : 0
    )
    return { xPadding, yPadding }
  }

  #getLineWidth (contentList: string[]) {
    return Math.max(
      ...contentList.map(
        line =>
          this.#textConfig.fontSize * line.length +
          this.#textConfig.letterSpacing * Math.max(0, line.length - 1)
      )
    )
  }

  #getLineHeight (contentList: string[]) {
    return (
      this.#textConfig.fontSize * contentList.length +
      this.#textConfig.lineSpacing * Math.max(0, contentList.length - 1)
    )
  }

  // async tick (time: number): Promise<{
  //   video?: VideoFrame
  //   state: 'success' | 'done'
  // }> {
  //   const contentList = this.#textConfig.content.split('\n')
  //   const { xPadding, yPadding } = this.#calcPadding()
  //   let maxLineWidth = 0
  //   const measuredLines: number[] = []
  //   this.#ctx.font = `${this.#textConfig.italic ? 'italic ' : ''}${
  //     this.#textConfig.bold ? 'bold ' : ''
  //   }${this.#textConfig.fontSize}px ${this.#textConfig.fontFamily}`
  //   contentList.forEach(line => {
  //     let lineWidth = 0
  //     for (let j = 0; j < line.length; j++) {
  //       const m = this.#ctx.measureText(line[j])
  //       lineWidth += m.width
  //       if (j < line.length - 1) {
  //         lineWidth += this.#textConfig.letterSpacing
  //       }
  //     }
  //     measuredLines.push(lineWidth)
  //     if (lineWidth > maxLineWidth) maxLineWidth = lineWidth
  //   })

  //   this.#cvsEl.width = maxLineWidth + xPadding * 2
  //   const textHeight =
  //     this.#textConfig.fontSize * contentList.length +
  //     this.#textConfig.lineSpacing * (contentList.length - 1)
  //   this.#cvsEl.height = textHeight + yPadding * 2
  //   this.#meta.width = this.#cvsEl.width
  //   this.#meta.height = this.#cvsEl.height

  //   this.#ctx.clearRect(0, 0, this.#cvsEl.width, this.#cvsEl.height)
  //   if (this.#textConfig.backgroundColor) {
  //     this.#ctx.globalAlpha = this.#textConfig.backgroundOpacity ?? 1
  //     this.#ctx.fillStyle = this.#textConfig.backgroundColor
  //     this.#ctx.fillRect(0, 0, this.#cvsEl.width, this.#cvsEl.height)
  //   }
  //   this.#ctx.globalAlpha = this.#textConfig.opacity ?? 1
  //   const fontParts = []
  //   if (this.#textConfig.italic) fontParts.push('italic')
  //   if (this.#textConfig.bold) fontParts.push('bold')
  //   fontParts.push(`${this.#textConfig.fontSize}px`)
  //   fontParts.push(this.#textConfig.fontFamily)
  //   this.#ctx.font = fontParts.join(' ')
  //   this.#ctx.textBaseline = 'top'
  //   if (this.#textConfig.showShadow) {
  //     this.#ctx.shadowColor = this.#textConfig.shadowColor
  //     this.#ctx.shadowBlur = this.#textConfig.shadowBlur
  //     this.#ctx.shadowOffsetX = this.#textConfig.shadowOffsetX
  //     this.#ctx.shadowOffsetY = this.#textConfig.shadowOffsetY
  //   } else {
  //     this.#ctx.shadowColor = 'transparent'
  //     this.#ctx.shadowBlur = 0
  //     this.#ctx.shadowOffsetX = 0
  //     this.#ctx.shadowOffsetY = 0
  //   }

  //   let yStart = yPadding
  //   for (let i = 0; i < contentList.length; i++) {
  //     const line = contentList[i]
  //     let currentX = 0
  //     const lineWidth = measuredLines[i]
  //     let xStart = xPadding
  //     switch (this.#textConfig.align) {
  //       case 'center':
  //         xStart = (this.#cvsEl.width - lineWidth) / 2
  //         break
  //       case 'right':
  //         xStart = this.#cvsEl.width - lineWidth - xPadding
  //         break
  //       case 'left':
  //       default:
  //         xStart = xPadding
  //     }
  //     currentX = xStart
  //     for (let j = 0; j < line.length; j++) {
  //       const char = line[j]
  //       if (this.#textConfig.showStroke) {
  //         this.#ctx.lineJoin = 'round'
  //         this.#ctx.strokeStyle = this.#textConfig.strokeColor
  //         this.#ctx.lineWidth = this.#textConfig.strokeWidth
  //         this.#ctx.strokeText(char, currentX, yStart)
  //       }
  //       this.#ctx.fillStyle = this.#textConfig.color
  //       this.#ctx.fillText(char, currentX, yStart)
  //       const metrics = this.#ctx.measureText(char)
  //       currentX += metrics.width + this.#textConfig.letterSpacing
  //     }
  //     yStart += this.#textConfig.fontSize + this.#textConfig.lineSpacing
  //   }

  //   return {
  //     state: 'success',
  //     video: new VideoFrame(this.#cvsEl, { timestamp: time })
  //   }
  // }

  // async generateImage () {
  //   const { video } = await this.tick(0)
  //   if (!video) return
  //   let offscreenCanvas: OffscreenCanvas
  //   try {
  //     offscreenCanvas = new OffscreenCanvas(video.codedWidth, video.codedHeight)
  //   } catch (error) {
  //     const tempCanvas = document.createElement('canvas')
  //     tempCanvas.width = video.codedWidth
  //     tempCanvas.height = video.codedHeight
  //     offscreenCanvas = tempCanvas as any
  //   }
  //   const ctx = offscreenCanvas.getContext('2d')
  //   ctx!.drawImage(video, 0, 0, video.codedWidth, video.codedHeight)
  //   const blob = await offscreenCanvas.convertToBlob()
  //   const a = document.createElement('a')
  //   a.href = URL.createObjectURL(blob)
  //   a.download = 'text.png'
  //   a.click()
  // }
  async tick(time: number): Promise<{
    video?: VideoFrame;
    state: "success" | "done";
  }> {
    const contentList = this.#textConfig.content.split("\n");
    const { xPadding, yPadding } = this.#calcPadding();
  //let maxLineWidth = 0
    let maxLineWidth = this.#getLineWidth(contentList);
    const maxLineHeight = this.#getLineHeight(contentList);
    const measuredLines: number[] = [];
    this.#ctx.font = `${this.#textConfig.italic ? "italic " : ""}${
      this.#textConfig.bold ? "bold " : ""
    }${this.#textConfig.fontSize}px ${this.#textConfig.fontFamily}`;
    contentList.forEach((line) => {
      let lineWidth = 0;
      for (let j = 0; j < line.length; j++) {
        const m = this.#ctx.measureText(line[j]);
        lineWidth += m.width;
        if (j < line.length - 1) {
          lineWidth += this.#textConfig.letterSpacing;
        }
      }
      measuredLines.push(lineWidth);
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
    });
    
    // const maxLineHeight = this.#getLineHeight(contentList);
    this.#cvsEl.width = maxLineWidth + xPadding * 2;
    const textHeight =
      this.#textConfig.fontSize * contentList.length +
      this.#textConfig.lineSpacing * (contentList.length - 1);
    this.#cvsEl.height = textHeight + yPadding * 2;
    this.#meta.width = this.#cvsEl.width;
    this.#meta.height = this.#cvsEl.height;
    // this.#callback(maxLineWidth + xPadding * 2, maxLineHeight + yPadding * 2);
    this.#ctx.clearRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
  
    if (this.#textConfig.backgroundColor) {
      this.#ctx.globalAlpha = this.#textConfig.backgroundOpacity ?? 1;
      this.#ctx.fillStyle = this.#textConfig.backgroundColor;
      this.#ctx.fillRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
    }
  
    let animOffsetX = 0;
    let animGlobalAlpha = this.#textConfig.opacity ?? 1;
    const animDuration = this.#textConfig.animationDuration || 2000; 
    if (this.#textConfig.animationType === "slide") {
      const progress = (time % animDuration) / animDuration;
      animOffsetX = 50 * (1 - progress);
    } if (this.#textConfig.animationType === "fade") {
      const progress = (time % animDuration) / animDuration;
      if (time < 1000) {
        animGlobalAlpha = Math.sin(progress * Math.PI) * (this.#textConfig.opacity ?? 1);
      } else {
        animGlobalAlpha = this.#textConfig.opacity ?? 1;
      }
    }
  
    const fontParts = [];
    if (this.#textConfig.italic) fontParts.push("italic");
    if (this.#textConfig.bold) fontParts.push("bold");
    fontParts.push(`${this.#textConfig.fontSize}px`);
    fontParts.push(this.#textConfig.fontFamily);
    this.#ctx.font = fontParts.join(" ");
    this.#ctx.textBaseline = "top";
    if (this.#textConfig.showShadow) {
      this.#ctx.shadowColor = this.#textConfig.shadowColor;
      this.#ctx.shadowBlur = this.#textConfig.shadowBlur;
      this.#ctx.shadowOffsetX = this.#textConfig.shadowOffsetX;
      this.#ctx.shadowOffsetY = this.#textConfig.shadowOffsetY;
    } else {
      this.#ctx.shadowColor = "transparent";
      this.#ctx.shadowBlur = 0;
      this.#ctx.shadowOffsetX = 0;
      this.#ctx.shadowOffsetY = 0;
    }
    this.#ctx.globalAlpha = animGlobalAlpha;
    let yStart = yPadding;
    for (let i = 0; i < contentList.length; i++) {
      const line = contentList[i];
      let currentX = 0;
      const lineWidth = measuredLines[i];
      let xStart = xPadding;
      switch (this.#textConfig.align) {
        case "center":
          xStart = (this.#cvsEl.width - lineWidth) / 2;
          break;
        case "right":
          xStart = this.#cvsEl.width - lineWidth - xPadding;
          break;
        case "left":
        default:
          xStart = xPadding;
      }
      currentX = xStart + animOffsetX;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (this.#textConfig.showStroke) {
          this.#ctx.lineJoin = "round";
          this.#ctx.strokeStyle = this.#textConfig.strokeColor;
          this.#ctx.lineWidth = this.#textConfig.strokeWidth;
          this.#ctx.strokeText(char, currentX, yStart);
        }
        this.#ctx.fillStyle = this.#textConfig.color;
        this.#ctx.fillText(char, currentX, yStart);
        const metrics = this.#ctx.measureText(char);
        currentX += metrics.width + this.#textConfig.letterSpacing;
      }
      yStart += this.#textConfig.fontSize + this.#textConfig.lineSpacing;
    }
  
    return {
      state: "success",
      video: new VideoFrame(this.#cvsEl, { timestamp: time }),
    };
  }
  

  async clone () {
    return new TextClip(this.#textConfig  ) as this
  }

  destroy () {
    this.#cvsEl.remove()
  }

  updateContent (newContent: string) {
    this.#textConfig.content = newContent
    this.#updateCanvasDimensions()
  }
}
