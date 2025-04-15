//[todo: add split fn]
import { ImageConfig } from "@/types/imageConfig";
import { IClip } from "@webav/av-cliper";
import { RGB } from "three/src/Three";



export class ImageClip implements IClip {
  #cvsEl: HTMLCanvasElement | OffscreenCanvas ;
  #ctx: CanvasRenderingContext2D;
  #gl: WebGLRenderingContext | null= null;
  #imageEl: HTMLImageElement;
  #useGradient: boolean = true;
  ready: Promise<{ width: number; height: number; duration: number }>;
  #color1: any;
  #color2: any;
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
    // this.#gl = this.#cvsEl.getContext("webgl")!;
this.#getRandomColors()
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
if (this.#useGradient) {
      this.#createGradient(this.#color1,this.#color2 );
    }
    return {
      state: "success",
      video: new VideoFrame(this.#cvsEl, { timestamp: time }),
    };
  }
 
   #getRandomColors() {
    function  hslToRgb(h:any, s:any, l:any) {
      let r, g, b;
    
      if (s === 0) {
          r = g = b = l; 
      } else {
          const hue2rgb = (p:any, q:any, t:any) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1/6) return p + (q - p) * 6 * t;
              if (t < 1/2) return q;
              if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          };
    
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }
    
      return [r, g, b];
    }
    const pattern = Math.random();
    let h1, s1, l1, h2, s2, l2;
  
    if (pattern < 0.170) { 
        h1 = Math.random() * 0.1; 
        h2 = 0.15 + Math.random() * 0.15; 
        s1 = Math.random() * 0.5 + 0.5;
        l1 = Math.random() * 0.4 + 0.3;
        s2 = Math.random() * 0.5 + 0.5;
        l2 = Math.random() * 0.4 + 0.3;
    } else if (pattern < 0.330) {
        h1 = 0.8 + Math.random() * 0.2;
        h2 = Math.random() * 0.05; 
        s1 = Math.random() * 0.3 + 0.7;
        l1 = Math.random() * 0.3 + 0.4;
        s2 = Math.random() * 0.4 + 0.6;
        l2 = Math.random() * 0.2 + 0.2;
    } else if (pattern < 0.500) { 
        h1 = 0.55 + Math.random() * 0.15;
        h2 = 0.7 + Math.random() * 0.15; 
        s1 = Math.random() * 0.4 + 0.6;
        l1 = Math.random() * 0.4 + 0.3;
        s2 = Math.random() * 0.4 + 0.6;
        l2 = Math.random() * 0.4 + 0.3;
    } else if (pattern < 0.670) { 
        h1 = 0.4 + Math.random() * 0.1; 
        h2 = 0.1 + Math.random() * 0.1; 
        s1 = Math.random() * 0.4 + 0.6;
        l1 = Math.random() * 0.4 + 0.3;
        s2 = Math.random() * 0.4 + 0.6;
        l2 = Math.random() * 0.4 + 0.3;
    } else if (pattern < 0.830) { 
        h1 = 0.5 + Math.random() * 0.1; 
        h2 = 0.45 + Math.random() * 0.1;
        s1 = Math.random() * 0.3 + 0.7;
        l1 = Math.random() * 0.3 + 0.5;
        s2 = Math.random() * 0.3 + 0.7;
        l2 = Math.random() * 0.3 + 0.5;
    } else {
        h1 = 0.75 + Math.random() * 0.1; 
        h2 = 0.4 + Math.random() * 0.1; 
        s1 = Math.random() * 0.4 + 0.6;
        l1 = Math.random() * 0.4 + 0.3;
        s2 = Math.random() * 0.4 + 0.6;
        l2 = Math.random() * 0.4 + 0.3;
    }
  
    const rgb1 = hslToRgb(h1, s1, l1);
    const rgb2 = hslToRgb(h2, s2, l2);
  this.#color1 = rgb1
  this.#color2 = rgb2
    return [rgb1, rgb2];
  }
  

  #createGradient(color1:any,color2:any): void {
    this.#cvsEl = new OffscreenCanvas(this.#cvsEl.width,this.#cvsEl.height)
    this.#gl = this.#cvsEl.getContext('webgl')

    if (!this.#gl) {
      console.log("WebGL not supported");
      return}

    const gl = this.#gl
    const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
    }
  `;
  
  
const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 resolution; 
    uniform vec3 color1;    
    uniform vec3 color2;     

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution;

    
        float gradientFactor = (uv.x + uv.y) * 0.5; 
        vec3 finalColor = mix(color1, color2, gradientFactor);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

//generate random colors based on the pattern mix of cool and warm colors to create a beautiful gradient 

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    
   
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    gl.useProgram(program);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1, -1,
         1,  1,
        -1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const color1Location = gl.getUniformLocation(program, 'color1');
    const color2Location = gl.getUniformLocation(program, 'color2');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, this.#cvsEl.width, this.#cvsEl.height);
    gl.uniform3fv(color1Location, color1);
    gl.uniform3fv(color2Location, color2);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
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
    this.#cvsEl.removeEventListener;
  }
}
