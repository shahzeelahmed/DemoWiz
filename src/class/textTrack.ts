
import { TextConfig } from "@/types/textConfig";
import { IClip } from "@webav/av-cliper";
//[todo] add more text-animations
export class TextClip implements IClip {
  #cvsEl: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  // #callback: (width: number, height: number) => void;
  ready: Promise<{ width: number; height: number; duration: number }>;
  #textConfig: TextConfig;
  #meta: {
    width: number;
    height: number;
    duration: number;
  } = { width: 0, height: 0, duration: Infinity };

  #animationOffset = 0;

  get textConfig() {
    return this.#textConfig;
  }

  set textConfig(config) {
    this.#textConfig = config;
    this.#updateCanvasDimensions();
  }

  get meta() {
    return this.#meta;
  }

  set meta(meta) {
    this.#meta = meta;
  }

  constructor(
    textConfig: TextConfig,
    // callback: (width: number, height: number) => void
  ) {
    this.#cvsEl = document.createElement("canvas");
    this.#ctx = this.#cvsEl.getContext("2d")!;
    this.#textConfig = textConfig;
    // this.#callback = callback;
    this.#updateCanvasDimensions();


    this.ready = Promise.resolve({
      width: this.#meta.width,
      height: this.#meta.height,
      duration: this.#meta.duration,
    });
  }

  #updateCanvasDimensions() {
    const contentList = this.#textConfig.content.split("\n");
    const { xPadding, yPadding } = this.#calcPadding();
    const textWidth = this.#getLineWidth(contentList);
    const textHeight = this.#getLineHeight(contentList);
    this.#cvsEl.width = textWidth + xPadding * 2;
    this.#cvsEl.height = textHeight + yPadding * 2;
    this.#meta.width = this.#cvsEl.width;
    this.#meta.height = this.#cvsEl.height;
    // this.#callback(this.#meta.width, this.#meta.height);
  }


  #calcPadding() {
    const { showStroke, strokeWidth, showShadow, shadowBlur, shadowOffsetX, shadowOffsetY } = this.#textConfig;
    const xPadding = Math.max(
      showStroke ? strokeWidth : 0,
      showShadow ? Math.max(shadowBlur, shadowOffsetX) : 0
    );
    const yPadding = Math.max(
      showStroke ? strokeWidth : 0,
      showShadow ? Math.max(shadowBlur, shadowOffsetY) : 0
    );
    return { xPadding, yPadding };
  }


  #getLineWidth(contentList: string[]) {
    return Math.max(
      ...contentList.map(line =>
        this.#textConfig.fontSize * line.length +
        this.#textConfig.letterSpacing * Math.max(0, line.length - 1)
      )
    );
  }


  #getLineHeight(contentList: string[]) {
    return (
      this.#textConfig.fontSize * contentList.length +
      this.#textConfig.lineSpacing * Math.max(0, contentList.length - 1)
    );
  }

  async tick(time: number): Promise<{
    video?: VideoFrame;
    state: "success" | "done";
  }> {
    const contentList = this.#textConfig.content.split("\n");
    const { xPadding, yPadding } = this.#calcPadding();
    const textWidth = this.#getLineWidth(contentList);
    const textHeight = this.#getLineHeight(contentList);

    //update canvas size dynamically
    this.#cvsEl.width = textWidth + xPadding * 2;
    this.#cvsEl.height = textHeight + yPadding * 2;
    this.#meta.width = this.#cvsEl.width;
    this.#meta.height = this.#cvsEl.height;
    // this.#callback(this.#meta.width, this.#meta.height);

    //clear canvas and fill background 
    this.#ctx.clearRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
    if (this.#textConfig.backgroundColor) {
      this.#ctx.fillStyle = this.#textConfig.backgroundColor;
      this.#ctx.fillRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
    }

    const fontParts = [];
    if (this.#textConfig.italic) fontParts.push("italic");
    if (this.#textConfig.bold) fontParts.push("bold");
    fontParts.push(`${this.#textConfig.fontSize}px`);
    fontParts.push(this.#textConfig.fontFamily);
    this.#ctx.font = fontParts.join(" ");
    this.#ctx.textBaseline = "top"; 

    //set shadow properties if enabled
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

//[todo]: implement animation pdate animation offset
    if (this.#textConfig.animationSpeed) {
      this.#animationOffset = (time * this.#textConfig.animationSpeed) % (textWidth + xPadding * 2);
    } else {
      this.#animationOffset = 0;
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

    // Render each line with horizontal alignment and optional scrolling effect
    for (let i = 0; i < contentList.length; i++) {
      const line = contentList[i];
      const lineLength = line.length;
      const computedLineWidth =
        this.#textConfig.fontSize * lineLength +
        this.#textConfig.letterSpacing * Math.max(0, lineLength - 1);
      let xStart = 0;
      switch (this.#textConfig.align) {
        case "center":
          xStart = (this.#cvsEl.width - computedLineWidth) / 2;
          break;
        case "right":
          xStart = this.#cvsEl.width - computedLineWidth - xPadding;
          break;
        case "left":
        default:
          xStart = xPadding;
      }

      // Apply horizontal animation offset if enabled
      xStart = xStart - this.#animationOffset;

      // Function to render a single line at a given x-offset
      const drawLine = (offsetX: number) => {
        for (let j = 0; j < line.length; j++) {
          const xPos = offsetX + j * this.#textConfig.fontSize + this.#textConfig.letterSpacing * j;
          const yPos = yStart + i * (this.#textConfig.fontSize + this.#textConfig.lineSpacing);
          if (this.#textConfig.showStroke) {
            this.#ctx.lineJoin = "round";
            this.#ctx.strokeStyle = this.#textConfig.strokeColor;
            this.#ctx.lineWidth = this.#textConfig.strokeWidth;
            this.#ctx.strokeText(line[j], xPos, yPos);
          }
          this.#ctx.fillStyle = this.#textConfig.color;
          this.#ctx.fillText(line[j], xPos, yPos);
        }
      };
      drawLine(xStart);
      if (this.#textConfig.animationSpeed && xStart + computedLineWidth < this.#cvsEl.width) {
        drawLine(xStart + computedLineWidth + xPadding);
      }
    }

    return {
      state: "success",
      video: new VideoFrame(this.#cvsEl, { timestamp: time }),
    };
  }
  
  
 

  
  async generateImage() {
    
    const { video } = await this.tick(0);
    if(!video) return;
    let offscreenCanvas: OffscreenCanvas;
    try {
      offscreenCanvas = new OffscreenCanvas(video.codedWidth, video.codedHeight);
    } catch (error) {
      // Fallback if OffscreenCanvas is not supported
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.codedWidth;
      tempCanvas.height = video.codedHeight;
      offscreenCanvas = tempCanvas as any;
    }
    const ctx = offscreenCanvas.getContext("2d");
    ctx!.drawImage(video, 0, 0, video.codedWidth, video.codedHeight);
    const blob = await offscreenCanvas.convertToBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "text.png";
    a.click();
  }

  async clone() {
    return new TextClip(this.#textConfig) as this;
  }

  destroy() {
    this.#cvsEl.remove();
  }

  updateContent(newContent: string) {
    this.#textConfig.content = newContent;
    this.#updateCanvasDimensions();
  }
}

