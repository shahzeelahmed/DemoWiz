import { TextConfig } from '@/types/textConfig'
import { IClip } from '@webav/av-cliper'
//[todo] add more text-animations
//[todo]: fix issues with typewriter not able to work in full opacity (probably rendering twice)   
export class TextClip implements IClip {
  #cvsEl: HTMLCanvasElement
  #ctx: CanvasRenderingContext2D
  // ready: Promise<{ width: number; height: number; duration: number }>
  #textConfig: TextConfig
  #meta: {
    width: number
    height: number
    duration: number
  } = { width: 0, height: 0, duration: Infinity }
  #sizeListeners: Set<(meta: { width: number; height: number; duration: number }) => void> = new Set()

  get textConfig () {
    return this.#textConfig
  }
ready;
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

  onMetaChange(handler: (meta: { width: number; height: number; duration: number }) => void): () => void {
    this.#sizeListeners.add(handler)
    return () => this.#sizeListeners.delete(handler)
  }

  constructor (
    textConfig: TextConfig,
  ) {
    this.#cvsEl = document.createElement('canvas')
    this.#ctx = this.#cvsEl.getContext('2d')!
    this.#textConfig = textConfig
    this.#updateCanvasDimensions()

    this.ready = Promise.resolve({
      width: this.#meta.width,
      height: this.#meta.height,
      duration: Infinity
    })
  }

  #updateCanvasDimensions () {
    const contentList = this.#textConfig.content.split('\n')
    const { xPadding, yPadding } = this.#calcPadding()
    const textWidth = this.#getLineWidth(contentList)
    const textHeight = this.#getLineHeight(contentList)
    this.#cvsEl.width = textWidth + xPadding * 2
    this.#cvsEl.height = textHeight + yPadding * 2
    this.#meta.width = this.#cvsEl.width /2
    this.#meta.height = this.#cvsEl.height
    this.#sizeListeners.forEach(fn => fn(this.#meta))
  }

async tick(time: number): Promise<{
  video?: VideoFrame;
  state: "success" | "done";
}> {
  const contentList = this.#textConfig.content.split("\n");
  const { xPadding, yPadding } = this.#calcPadding();

  let maxLineWidth = -0.5;
  this.#ctx.font = `${this.#textConfig.italic ? "italic " : ""}${this.#textConfig.bold ? "bold " : ""}${this.#textConfig.fontSize}px ${this.#textConfig.fontFamily}`;
  for (const line of contentList) {
    let lineWidth = 0;
    for (let j = 0; j < line.length; j++) {
      const metrics = this.#ctx.measureText(line[j]);
      lineWidth += metrics.width;
      if (j < line.length - 1) {
        lineWidth += this.#textConfig.letterSpacing;
      }
    }
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
  }
  const textHeight = this.#textConfig.fontSize * contentList.length + this.#textConfig.lineSpacing * (contentList.length - 1);
  this.#cvsEl.width = maxLineWidth + xPadding * 2;
  this.#cvsEl.height = textHeight + yPadding * 2;
  this.#meta.width = this.#cvsEl.width;
  this.#meta.height = this.#cvsEl.height;

  this.#ctx.clearRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
  if (this.#textConfig.backgroundColor) {
    this.#ctx.globalAlpha = this.#textConfig.backgroundOpacity || 1;
    this.#ctx.fillStyle = this.#textConfig.backgroundColor;
    this.#ctx.fillRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
  }

  this.#ctx.globalAlpha = this.#textConfig.opacity || 1;
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

  let yStart = yPadding;
  switch (this.#textConfig.verticalAlign) {
    case "middle":
      yStart = (this.#cvsEl.height - textHeight) / 2;
      break;
    case "bottom":
      yStart = this.#cvsEl.height - textHeight - yPadding;
      break;
    case "top":
    default:
      yStart = yPadding;
  }

  const animDuration = this.#textConfig.animationDuration || 1000;
  const progress = Math.min(time / animDuration, 1);
  const animType = this.#textConfig.animationType;

  let totalChars = 0;
  if (animType === "typewriter") {
     contentList.forEach(line => totalChars += line.length);
  }
  const charsToShow = Math.floor(totalChars * progress);
  let charCounter = 0;

  for (let i = 0; i < contentList.length; i++) {
    const line = contentList[i];
    let lineWidth = 0;
    for (let j = 0; j < line.length; j++) {
      const metrics = this.#ctx.measureText(line[j]);
      lineWidth += metrics.width;
      if (j < line.length - 1) {
        lineWidth += this.#textConfig.letterSpacing;
      }
    }
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

    let currentX = xStart;
    const yPos = yStart + i * (this.#textConfig.fontSize + this.#textConfig.lineSpacing);

    let animOffsetX = 0;
    let animOffsetY = 0;
    let animGlobalAlpha = this.#textConfig.opacity ?? 1;
    let animScale = 1;
    let animBlurRadius = 0;

    if (animType === "slide") {
      animOffsetX = 50 * (1 - progress);
    } else if (animType === "fade") {
      animGlobalAlpha = progress * (this.#textConfig.opacity ?? 1);
    } else if (animType === "grow") {
      this.#ctx.save();
      const centerX = this.#cvsEl.width / 2;
      const centerY = this.#cvsEl.height / 2;
      this.#ctx.translate(centerX, centerY);
      animScale = 0.1 + 0.9 * progress;
      this.#ctx.scale(animScale, animScale);
      this.#ctx.translate(-centerX, -centerY);
    } else if (animType === "blur") {
      animBlurRadius = 10 * (1 - progress);
      this.#ctx.filter = `blur(${animBlurRadius}px)`;
    } else if (animType === "bounce") {
      const bounceAmplitude = 10;
      animOffsetY = bounceAmplitude * Math.sin(progress * Math.PI * 2 * 2);
    } else if (animType === "reveal") {
      const revealOffset = this.#cvsEl.height;
      animOffsetY = revealOffset * (1 - progress);
    } else if (animType === "pop") {
      this.#ctx.save();
      const centerX = this.#cvsEl.width / 2;
      const centerY = this.#cvsEl.height / 2;
      this.#ctx.translate(centerX, centerY);
      animScale = 1 + 0.2 * Math.sin(progress * Math.PI * 3);
      if (progress > 0.7) {
        animScale = 1 + 0.2 * Math.sin(0.7 * Math.PI * 3) * (1 - (progress - 0.7) / 0.3);
      }
      this.#ctx.scale(animScale, animScale);
      this.#ctx.translate(-centerX, -centerY);
    }

    this.#ctx.globalAlpha = animGlobalAlpha;
    currentX += animOffsetX;
    const actualYPos = yPos + animOffsetY;

    for (let j = 0; j < line.length; j++) {
      if (animType === "typewriter") {
        if (charCounter >= charsToShow) {
          break; 
        }
      }

      const char = line[j];
      if (this.#textConfig.showStroke) {
        this.#ctx.lineJoin = "round";
        this.#ctx.strokeStyle = this.#textConfig.strokeColor;
        this.#ctx.lineWidth = this.#textConfig.strokeWidth;
        this.#ctx.strokeText(char, currentX, actualYPos);
      }
      this.#ctx.fillStyle = this.#textConfig.color;
      this.#ctx.fillText(char, currentX, actualYPos);
      const metrics = this.#ctx.measureText(char);
      currentX += metrics.width + this.#textConfig.letterSpacing;

      if (animType === "typewriter") {
         charCounter++;
      }
    }

    if (animType === "grow" || animType === "pop") {
      this.#ctx.restore();
    }
    if (animType === "blur") {
        this.#ctx.filter = 'none'; 
    }
    if (animType === "typewriter" && charCounter >= charsToShow) {
        break; 
    }
    
  }

  return {
    state: Infinity ?  "success" : "done" ,
    video: new VideoFrame(this.#cvsEl, { timestamp: time * 1000 }), 
  };
}



#calcPadding() {
  let xPadding = 0;
  let yPadding = 0;
  const textConfig = this.#textConfig;
  xPadding = Math.max(
    textConfig.showStroke ? textConfig.strokeWidth : 0,
    textConfig.showShadow
      ? Math.max(textConfig.shadowBlur, Math.abs(textConfig.shadowOffsetX))
      : 0
  );
  yPadding = Math.max(
    textConfig.showStroke ? textConfig.strokeWidth : 0,
    textConfig.showShadow
      ? Math.max(textConfig.shadowBlur, Math.abs(textConfig.shadowOffsetY))
      : 0
  );
  return {
    xPadding,
    yPadding,
  };
}


  
  #getLineWidth(contentList: string[]) {
    return Math.max(
      ...contentList.map((line) => {
        return (
          this.#textConfig.fontSize * line.length +
          this.#textConfig.letterSpacing * Math.max(0, line.length - 1)
        );
      })
    );
  }

  #getLineHeight(contentList: string[]) {
    return (
      this.#textConfig.fontSize * contentList.length +
      this.#textConfig.lineSpacing * Math.max(0, contentList.length - 1)
    );
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
