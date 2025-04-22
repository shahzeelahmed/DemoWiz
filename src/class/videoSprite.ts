import { IClip } from '@webav/av-cliper'
import { BaseSprite, changePCMPlaybackRate } from './baseSprite'
import { EffectConfig } from '@/types/effectType'
export class VideoSprite extends BaseSprite {
  #clip: IClip
  #currentTime: number =0
  //effect params
  #effectParams!: EffectConfig;
  #hasEffect: boolean = false;
  //dimensions
  #originalWidth: number = 0
  #modifiedHeight: number = 0
  #modifiedWidth: number = 0
  #originalHeight: number = 0
  #originalX: number = 0
  #originalY: number = 0



  // webgl related properties
  #gl: WebGLRenderingContext | null = null
  #program: WebGLProgram | null = null
  #texture: WebGLTexture | null = null
  #vertexBuffer: WebGLBuffer | null = null
  #texCoordBuffer: WebGLBuffer | null = null
  #canvas: OffscreenCanvas | null = null
  #positionLocation: number = -1
  #textureLocation: WebGLUniformLocation | null = null
  #holdDuration: number = 0
  getClip () {
    return this.#clip
  }

  visible = true

  constructor (
    clip: IClip,

  ) {
    super()
    this.#clip = clip
    this.ready = clip.ready.then(({ width, height, duration }) => {
      this.rect.w = this.rect.w === 0 ? width : this.rect.w
      this.rect.h = this.rect.h === 0 ? height : this.rect.h
      this.time.duration =
        this.time.duration === 0 ? duration : this.time.duration
      this.#originalX = this.rect.x
      this.#originalY = this.rect.y

      // this.#effectParams.focalPoint = this.#getFocalPoint(1);
      this.#originalWidth = this.rect.w / 2
      this.#originalHeight = this.rect.h / 2
      this.#initWebGL(this.rect.w, this.rect.h)
    })
  }

  #initWebGL (width: number, height: number) {
    this.#canvas = new OffscreenCanvas(width, height)
    this.#gl = this.#canvas.getContext('webgl')

    if (!this.#gl) return

    const gl = this.#gl

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = vec2(0.5 * (position.x + 1.0), 0.5 * (1.0 - position.y));
        gl_Position = vec4(position, 0.0, 1.0);
      }
      `

    const fragmentShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D inputTexture;
      
      void main() {
        gl_FragColor = texture2D(inputTexture, vUv);
      }
      `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

    if (!vertexShader || !fragmentShader) return

    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.shaderSource(fragmentShader, fragmentShaderSource)

    gl.compileShader(vertexShader)
    gl.compileShader(fragmentShader)

    this.#program = gl.createProgram()
    if (!this.#program) return

    gl.attachShader(this.#program, vertexShader)
    gl.attachShader(this.#program, fragmentShader)
    gl.linkProgram(this.#program)

    if (!gl.getProgramParameter(this.#program, gl.LINK_STATUS)) {
      console.error(
        'WebGL program linking failed:',
        gl.getProgramInfoLog(this.#program)
      )
      return
    }

    this.#vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    this.#texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
      gl.STATIC_DRAW
    )

    //texture
    this.#texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.#texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
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

  setZoomParameters(
    startTime: number = 1 * 1e6,
    endTime: number = startTime + 5 * 1e6,
    holdDuration: number = 5 * 1e6,
    zoomPositionIndex: number = 4
  ) {
    const focal = this.#getFocalPoint(zoomPositionIndex)
    this.#effectParams = {
      startTime,
      endTime,
      hasEffect: true,
      zoomDuration: holdDuration, 
      holdDuration,
      maxZoom: 2.0,
      focalPoint: focal,
      zoomPositionIndex
    }
    this.#hasEffect = true
    //[important] record original rect before effect
    this.#originalX = this.rect.x
    this.#originalY = this.rect.y
    this.#originalWidth = this.rect.w
    this.#originalHeight = this.rect.h
    console.log(`[VideoSprite] setZoomParameters`, this.#effectParams)
  }

  // #easeInOutSine (t: number): number {
  //   return -(Math.cos(Math.PI * t) - 1) / 2
  // }

  //https://easings.net/#easeInOutQuint
  #easeInOutQuint(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }



  #updateScale (time: number): void {
    if (!this.#effectParams.hasEffect) {
      // this.rect.x = this.#originalX;
      // this.rect.y = this.#originalY;
      // this.rect.w = this.#originalWidth;
      // this.rect.h = this.#originalHeight;
      return;
    }

    const totalDuration = 2 * this.#effectParams.zoomDuration + this.#effectParams.holdDuration;

    if (time < this.#effectParams.startTime || time > this.#effectParams.endTime) {
      this.#originalX = this.rect.x;
      this.#originalY = this.rect.y;
      this.#originalWidth = this.rect.w;
      this.#originalHeight = this.rect.h;
      return;
    }
    
    const totalAnimationTime = this.#effectParams.endTime - this.#effectParams.startTime;
    const progress = Math.max(
      0,
      Math.min(1, (time - this.#effectParams.startTime) / totalAnimationTime)
    );
    
    let zoomFactor = 1.0;
    const zoomInDurationRelative = this.#effectParams.zoomDuration / totalDuration;
    const holdDurationRelative = this.#effectParams.holdDuration / totalDuration; 
    
    if (progress < zoomInDurationRelative) {
      const t = progress / zoomInDurationRelative;
      zoomFactor = 1.0 + (this.#effectParams.maxZoom - 1.0) * this.#easeInOutQuint(t);
      console.log('zoomIn:', zoomFactor);
    } else if (progress < zoomInDurationRelative + holdDurationRelative) {
      zoomFactor = this.#effectParams.maxZoom;
    } else {
      const t =
        (progress - zoomInDurationRelative - holdDurationRelative) /
        zoomInDurationRelative;
      zoomFactor =
        this.#effectParams.maxZoom - (this.#effectParams.maxZoom - 1.0) * this.#easeInOutQuint(t);
    }
    


    zoomFactor = Math.max(1.0, zoomFactor)

    //current dimensions, this will fix the sizing issues on playback

    const baseX = this.rect.x;
    const baseY = this.rect.y;
    const baseWidth = this.rect.w;
    const baseHeight = this.rect.h;

    const finalWidth = baseWidth * zoomFactor;
    const finalHeight = baseHeight * zoomFactor;

    const focalPoint = this.#getFocalPoint(this.#effectParams.zoomPositionIndex ?? 4)
    const newRectX = baseX + focalPoint.x * baseWidth * (1 - zoomFactor);
    const newRectY = baseY + focalPoint.y * baseHeight * (1 - zoomFactor);

    this.rect.w = finalWidth
    this.rect.h = finalHeight
    this.rect.x = newRectX
    this.rect.y = newRectY
  }
 
  #getFocalPoint (index: number): { x: number; y: number } {
    const positions = [
      {x:0, y:0},
      {x:0.5, y:0},
      {x:1, y: 0},
      {x: 0, y:0.5},
      {x:0.5, y:0.5},
      {x: 1, y: 0.5},
      {x: 0, y: 1},
      {x: 0.5, y:1},
      {  x: 1, y: 1 }
    ]

    return positions[index >= 0 && index < 9 ? index : 4]
  }

  #renderWithWebGL (video: VideoFrame | ImageBitmap): ImageBitmap | null {
    if (!this.#gl || !this.#program || !this.#canvas) {
      return null
    }

    const gl = this.#gl
    const { width, height } = this.#canvas

    try {
      gl.viewport(0, 0, width, height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(this.#program)
      this.#positionLocation = gl.getAttribLocation(this.#program, 'position')
      if (this.#positionLocation === -1) {
        console.error('Failed to get position attribute location')
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer)
      gl.enableVertexAttribArray(this.#positionLocation)
      gl.vertexAttribPointer(this.#positionLocation, 2, gl.FLOAT, false, 0, 0)

      if (this.#textureLocation) gl.uniform1i(this.#textureLocation, 0)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.#texture)

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      return this.#canvas.transferToImageBitmap()
    } catch (error) {
      console.error('Error during WebGL rendering:', error)
      return null
    }
  }

  #lastVf: VideoFrame | ImageBitmap | null = null;
  #lastAudio: Float32Array[] = [];
  #ticking = false;
  #update(time: number) {
    if (this.#ticking) return;
    this.#ticking = true;
    this.#clip
      .tick(time * this.time.playbackRate)
      .then(({ video, audio }) => {
        if (video != null) {
          this.#lastVf?.close();
          this.#lastVf = video ?? null;
        }
        this.#lastAudio = audio ?? [];
        if (audio != null && this.time.playbackRate !== 1) {
          this.#lastAudio = audio.map((pcm) =>
            changePCMPlaybackRate(pcm, this.time.playbackRate),
          );
        }
      })
      .finally(() => {
        this.#ticking = false;
      });
  }

  preFrame (time: number) {
    this.#update(time)
  }

  #lastTime = -1
  #processedFrame: ImageBitmap | null = null

  render (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    time: number
  ): { audio: Float32Array[] } {
    this.#currentTime = time
    this.animate(time)
    super._render(ctx)

    const { w, h } = this.rect

    if (this.#lastTime !== time) this.#update(time)
    this.#lastTime = time
 
    let transformScale = 1;
    let offsetX = 0;
    let offsetY = 0;
    if (this.#hasEffect) {
      const params = this.#effectParams;
      const totalDuration = 2 * params.zoomDuration + params.holdDuration;
      const duration = params.endTime - params.startTime;
      const progress = Math.max(0, Math.min(1, (time - params.startTime) / duration));
      const zoomInRel = params.zoomDuration / totalDuration;
      const holdRel = params.holdDuration / totalDuration;
      if (progress < zoomInRel) {
        const t = progress / zoomInRel;
        transformScale = 1 + (params.maxZoom - 1) * this.#easeInOutQuint(t);
      } else if (progress < zoomInRel + holdRel) {
        transformScale = params.maxZoom;
      } else {
        const t = (progress - zoomInRel - holdRel) / zoomInRel;
        transformScale = params.maxZoom - (params.maxZoom - 1) * this.#easeInOutQuint(t);
      }
      const { x: fx, y: fy } = params.focalPoint;
      const w = this.rect.w;
      const h = this.rect.h;
      offsetX = fx * w * (1 - transformScale);
      offsetY = fy * h * (1 - transformScale);
    }

    const video = this.#lastVf

    if (video != null) {
      if (this.#processedFrame) {
        this.#processedFrame.close()
        this.#processedFrame = null
      }
      this.#processedFrame = this.#renderWithWebGL(video)
      ctx.save()
      ctx.translate(-w / 2, -h / 2)
      ctx.translate(offsetX, offsetY)
      ctx.scale(transformScale, transformScale)
      const frame = this.#processedFrame || video
      ctx.drawImage(frame, 0, 0, w, h)
      ctx.restore()
    }

    const audio = this.#lastAudio
    this.#lastAudio = []
    return { audio }
  }


  copyStateTo<T extends BaseSprite>(target: T): void {
    // console.log('target',target)
    super.copyStateTo(target);
    
    if (target instanceof VideoSprite) {
      
      target.visible = this.visible;
      target.#canvas = this.#canvas;
      target.#gl = this.#gl
    }
  }


  #destroyed = false
  destroy (): void {
    
    if (this.#destroyed) return
    this.#destroyed = true
    //important: cleanup
    super.destroy()
    this.#lastVf?.close()
    this.#lastVf = null
    this.#processedFrame?.close()
    this.#processedFrame = null

    if (this.#gl) {
      const gl = this.#gl
      gl.deleteTexture(this.#texture)
      gl.deleteBuffer(this.#vertexBuffer)
      gl.deleteBuffer(this.#texCoordBuffer)
      gl.deleteProgram(this.#program)
    }

    this.#gl = null
    this.#canvas = null
    this.#clip.destroy()
  }
}


