//[todo: add split fn]
import { ImageConfig } from "@/types/imageConfig";
import { IClip } from "@webav/av-cliper";



export class ImageClip implements IClip {
  #cvsEl: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
 
  #imageEl: HTMLImageElement;

  ready: Promise<{ width: number; height: number; duration: number }>;

  #imageConfig: ImageConfig;

  #meta = {
    width: 0,
    height: 0,
    duration: Infinity,
  };

  get meta() {
    return this.#meta;
  }
  set meta(newMeta) {
    this.#meta = newMeta;
  }

  get imageConfig() {
    return this.#imageConfig;
  }
  set imageConfig(config: ImageConfig) {
    this.#imageConfig = config;
    this.#updateCanvasDimensions();
  }

  constructor(config: ImageConfig,) {
    this.#imageConfig = {
      opacity: 1,
      showShadow: false,
      shadowColor: "#000000",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowSpread: 0,
      showBorder: false,
      borderColor: "#000000",
      borderWidth: 0,
      borderRadius: 0,
      width: 0,
      height: 0,
      duration: Infinity,
      ...config,
    }

    this.#cvsEl = document.createElement("canvas");
    this.#ctx = this.#cvsEl.getContext("2d")!;

    this.#imageEl = new Image();
    this.#imageEl.crossOrigin = "anonymous";

    const blob = new Blob([this.#imageConfig.data], { type: "image/png" }); // adjust mime type if needed
    const objectURL = URL.createObjectURL(blob);
    this.#imageEl.src = objectURL;

    this.ready = new Promise((resolve, reject) => {
      this.#imageEl.onload = () => {
        this.#updateCanvasDimensions();
        resolve({
          width: this.#meta.width,
          height: this.#meta.height,
          duration: this.#meta.duration,
        });
      };
      this.#imageEl.onerror = (err) => {
        console.error("Image failed to load:", err);
        reject(err);
      };
    });
  }

 
  #updateCanvasDimensions() {
    const naturalWidth = this.#imageEl.naturalWidth || 0;
    const naturalHeight = this.#imageEl.naturalHeight || 0;
    const cfg = this.#imageConfig;

    const finalWidth = cfg.width && cfg.width > 0 ? cfg.width : naturalWidth;
    const finalHeight = cfg.height && cfg.height > 0 ? cfg.height : naturalHeight;

    const shadowExtraX = cfg.showShadow ? Math.max(cfg.shadowOffsetX ?? 0, 0) + (cfg.shadowSpread ?? 0) : 0;
    const shadowExtraY = cfg.showShadow ? Math.max(cfg.shadowOffsetY ?? 0, 0) + (cfg.shadowSpread ?? 0) : 0;
    const xPadding = cfg.showShadow ? Math.abs(Math.min(cfg.shadowOffsetX ?? 0, 0)) + (cfg.shadowSpread ?? 0) : 0;
    const yPadding = cfg.showShadow ? Math.abs(Math.min(cfg.shadowOffsetY ?? 0, 0)) + (cfg.shadowSpread ?? 0) : 0;

    this.#cvsEl.width = finalWidth + shadowExtraX + xPadding;
    this.#cvsEl.height = finalHeight + shadowExtraY + yPadding;

    this.#meta.width = this.#cvsEl.width;
    this.#meta.height = this.#cvsEl.height;
    this.#meta.duration = cfg.duration ?? Infinity;


  }


  async tick(time: number): Promise<{ video?: VideoFrame; state: "success" | "done" }> {
    const cfg = this.#imageConfig;
    this.#ctx.clearRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);

    this.#ctx.globalAlpha = cfg.opacity ?? 1;

    if (cfg.showShadow) {
      this.#ctx.shadowColor = cfg.shadowColor ?? "#000000";
      this.#ctx.shadowBlur = cfg.shadowBlur ?? 0;
      this.#ctx.shadowOffsetX = cfg.shadowOffsetX ?? 0;
      this.#ctx.shadowOffsetY = cfg.shadowOffsetY ?? 0;
    } else {
      this.#ctx.shadowColor = "transparent";
      this.#ctx.shadowBlur = 0;
      this.#ctx.shadowOffsetX = 0;
      this.#ctx.shadowOffsetY = 0;
    }


    const xPadding = cfg.showShadow ? Math.abs(Math.min(cfg.shadowOffsetX ?? 0, 0)) + (cfg.shadowSpread ?? 0) : 0;
    const yPadding = cfg.showShadow ? Math.abs(Math.min(cfg.shadowOffsetY ?? 0, 0)) + (cfg.shadowSpread ?? 0) : 0;

    const finalWidth = cfg.width && cfg.width > 0 ? cfg.width : this.#imageEl.naturalWidth;
    const finalHeight = cfg.height && cfg.height > 0 ? cfg.height : this.#imageEl.naturalHeight;

    if (cfg.showBorder || cfg.borderRadius) {
      this.#ctx.save();
      this.#ctx.beginPath();
      const r = cfg.borderRadius ?? 0;
      this.#roundedRect(this.#ctx, xPadding, yPadding, finalWidth, finalHeight, r);
      this.#ctx.clip();
      this.#ctx.drawImage(this.#imageEl, xPadding, yPadding, finalWidth, finalHeight);
      this.#ctx.restore();

      if (cfg.showBorder && cfg.borderWidth && cfg.borderWidth > 0) {
        this.#ctx.save();
        this.#ctx.globalAlpha = cfg.opacity ?? 1;
        this.#ctx.strokeStyle = cfg.borderColor ?? "#000";
        this.#ctx.lineWidth = cfg.borderWidth;
        this.#ctx.beginPath();
        this.#roundedRect(this.#ctx, xPadding, yPadding, finalWidth, finalHeight, r);
        this.#ctx.stroke();
        this.#ctx.restore();
      }
    } else {
      this.#ctx.drawImage(this.#imageEl, xPadding, yPadding, finalWidth, finalHeight);
      if (cfg.showBorder && cfg.borderWidth && cfg.borderWidth > 0) {
        this.#ctx.save();
        this.#ctx.globalAlpha = cfg.opacity ?? 1;
        this.#ctx.strokeStyle = cfg.borderColor ?? "#000";
        this.#ctx.lineWidth = cfg.borderWidth;
        this.#ctx.strokeRect(xPadding, yPadding, finalWidth, finalHeight);
        this.#ctx.restore();
      }
    }

    return {
      state: "success",
      video: new VideoFrame(this.#cvsEl, { timestamp: time }),
    };
  }
  #roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  async generateImage() {
    const { video } = await this.tick(0);
    if (!video) return;
    let offscreenCanvas: OffscreenCanvas;
    try {
      offscreenCanvas = new OffscreenCanvas(video.codedWidth, video.codedHeight);
    } catch (error) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.codedWidth;
      tempCanvas.height = video.codedHeight;
      offscreenCanvas = tempCanvas as any;
    }
    const ctx = offscreenCanvas.getContext("2d");
    if(!ctx) return;
    ctx.drawImage(video, 0, 0, video.codedWidth, video.codedHeight);
    const blob = await offscreenCanvas.convertToBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image-clip.png";
    a.click();
  }

  async clone(): Promise<this> {
    const newConfig: ImageConfig = { ...this.#imageConfig };
    const newClip = new ImageClip(newConfig, ) as this;
    await newClip.ready;
    return newClip;
  }
  destroy() {
    this.#cvsEl.remove();
  }
}
