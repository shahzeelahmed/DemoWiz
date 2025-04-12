import { IClip, VisibleSprite } from '@webav/av-cliper'
import { BaseSprite, changePCMPlaybackRate, Rect } from './baseSprite'

export class VideoSprite extends BaseSprite {
  //todo: implement hasEffect
  #clip: IClip
  #startTime: number = 0
  #hasEffect: boolean = false
  #endTime: number = 0
  #holdDuration: number = 1000
  #zoomPositionIndex: number = 8

  //dimensions
  #originalWidth: number = 0
  #originalHeight: number = 0
  #modifiedWidth: number = 0
  #modifiedHeight: number = 0
  #modifiedX: number = 0
  #modifiedY: number = 0

  //webgl properties
  #gl: WebGLRenderingContext | null = null
  #program: WebGLProgram | null = null
  #texture: WebGLTexture | null = null
  #vertexBuffer: WebGLBuffer | null = null
  #canvas: OffscreenCanvas | null = null
  #positionLocation: number = -1
  #textureLocation: WebGLUniformLocation | null = null

  #maxZoom: number = 2.0

  #zoomDuration: number = 80000000

  getClip () {
    return this.#clip
  }
  #ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null =
    null
  visible = true

  constructor (
    clip: IClip,
    startTime: number = 1 * 1e6,
    endTime: number = 5 * 1e6,
    holdDuration: number = 8 * 1e6,
    zoomPositionIndex: number = 8
  ) {
    super()
    this.#clip = clip
    this.#startTime = startTime
    this.#endTime = endTime
    this.#holdDuration = holdDuration
    this.#zoomPositionIndex = zoomPositionIndex

    this.ready = clip.ready.then(({ width, height, duration }) => {
      this.rect.w = this.rect.w === 0 ? width : this.rect.w
      this.rect.h = this.rect.h === 0 ? height : this.rect.h
      this.time.duration =
        this.time.duration === 0 ? duration : this.time.duration
      //original dimensions
      this.#originalWidth = this.rect.w / 2.5
      this.#originalHeight = this.rect.h / 2.5
      console.log(
        'originalWidth',
        this.#originalWidth,
        'originalHeight',
        this.#originalHeight
      )

      this.#initWebGL(this.rect.w / 2, this.rect.h / 2)
      if (!this.#ctx) return
      super._render(this.#ctx)
    })
  }

  #initWebGL (width: number, height: number) {
    try {
      this.#canvas = new OffscreenCanvas(width, height)
      this.#gl = this.#canvas.getContext('webgl', {
        preserveDrawingBuffer: true
      })

      if (!this.#gl) {
        console.error('Failed to get WebGL context')
        return
      }

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

      if (!vertexShader || !fragmentShader) {
        return
      }

      gl.shaderSource(vertexShader, vertexShaderSource)
      gl.shaderSource(fragmentShader, fragmentShaderSource)

      gl.compileShader(vertexShader)
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        return
      }

      gl.compileShader(fragmentShader)
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        return
      }

      this.#program = gl.createProgram()
      if (!this.#program) {
        return
      }

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

     
      this.#positionLocation = gl.getAttribLocation(this.#program, 'position')
      if (this.#positionLocation === -1) {
        console.error('Failed to get position attribute location')
      }

      
      this.#textureLocation = gl.getUniformLocation(
        this.#program,
        'inputTexture'
      )

      //  buffers
      this.#vertexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      )
      //texture
      this.#texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, this.#texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      return { width, height }
    } catch (error) {
      console.error('Error during WebGL initialization:', error)
    }
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

 //[todo]: make focal point relatve to the canvas dimensions 
  #getFocalPoint (index: number): { x: number; y: number } {
    const positions = [
      { x: 0, y: 0 }, 
      { x: 0.5, y: 0 }, 
      { x: 1, y: 0 }, 
      { x: 0, y: 0.5 }, 
      { x: 0.5, y: 0.5 }, 
      { x: 1, y: 0.5 }, 
      { x: 0, y: 1 },  
      { x: 0.5, y: 1 }, 
      { x: 1, y: 1 } 
    ]

    return positions[index >= 0 && index < 9 ? index : 4]
  }

  #easeInOutSine (t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2
  }

  #lastVf: VideoFrame | ImageBitmap | null = null
  #lastAudio: Float32Array[] = []
  #ticking = false

  #update (time: number) {
    if (this.#ticking) return
    this.#ticking = true
    this.#clip
      .tick(time * this.time.playbackRate)
      .then(({ video, audio }) => {
        if (video != null) {
          this.#lastVf?.close()
          this.#lastVf = video ?? null
        }
        this.#lastAudio = audio ?? []
        if (audio != null && this.time.playbackRate !== 1) {
          this.#lastAudio = audio.map(pcm =>
            changePCMPlaybackRate(pcm, this.time.playbackRate)
          )
        }
      })
      .finally(() => {
        this.#ticking = false
      })
  }

  preFrame (time: number) {
    this.#update(time)
  }

  #updateScale (time: number) {
    const totalDuration = 2 * this.#zoomDuration + this.#holdDuration

    if (time < this.#startTime || time > this.#endTime) {
      return
    }

    const totalAnimationTime = this.#endTime - this.#startTime
    const progress = (time - this.#startTime) / totalAnimationTime

    const focalPoint = this.#getFocalPoint(this.#zoomPositionIndex)

    let zoomFactor = 1.0
    let offsetX = 0
    let offsetY = 0

    const zoomInDuration = this.#zoomDuration / totalDuration
    const holdDuration = this.#holdDuration / totalDuration

    if (progress < zoomInDuration) {
      const t = progress / zoomInDuration
      zoomFactor = 1.0 + (this.#maxZoom - 1.0) * this.#easeInOutSine(t)
    } else if (progress < zoomInDuration + holdDuration) {
      zoomFactor = this.#maxZoom
    } else {
      const t = (progress - zoomInDuration - holdDuration) / zoomInDuration
      zoomFactor =
        this.#maxZoom - (this.#maxZoom - 1.0) * this.#easeInOutSine(t)
    }

    offsetX = (0.5 - focalPoint.x) * this.#originalWidth * (zoomFactor - 1)
    offsetY = (0.5 - focalPoint.y) * this.#originalHeight * (zoomFactor - 1)
    //this should be modified height if applicable
    this.rect.w = this.#originalWidth * zoomFactor
    this.rect.h = this.#originalHeight * zoomFactor

    //[todo]: manage coords
    // this.rect.x = offsetX;
    // this.rect.y = offsetY;
  }

  #lastTime = -1
  #processedFrame: ImageBitmap | null = null

  render (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    time: number
  ): { audio: Float32Array[] } {
    this.animate(time)
    super._render(ctx)
    this.#modifiedHeight = this.rect.h
    this.#modifiedWidth = this.rect.w
    this.#updateScale(time)
    this.#ctx = ctx
    this.#lastTime = time
    const { w, h } = this.rect
    if (this.#lastTime !== time) this.#update(time)
    this.#lastTime = time

    const audio = this.#lastAudio
    this.#lastAudio = []
    const video = this.#lastVf

    if (video != null && this.visible) {
      if (this.#processedFrame) {
        this.#processedFrame.close()
        this.#processedFrame = null
      }

      this.#processedFrame = this.#renderWithWebGL(video)

      if (this.#processedFrame) {
        // ctx.drawImage(this.#processedFrame, -w/2 + x, -h/2 + y, w, h);
        ctx.drawImage(this.#processedFrame, -w / 2, -h / 2, w, h)
      } else {
        // ctx.drawImage(video, -w/2 + x, -h/2 + y, w, h);
        ctx.drawImage(video, -w / 2, -h / 2, w, h)
      }
    }

    return { audio }
  }

  setZoomParameters (
    startTime: number,
    endTime: number,
    holdDuration: number = 8 * 1e6,
    zoomPositionIndex: number = 8
  ) {
    this.#startTime = startTime
    this.#endTime = endTime || startTime + 2 * this.#zoomDuration + holdDuration
    this.#holdDuration = holdDuration
    this.#zoomPositionIndex = zoomPositionIndex
  }

  copyStateTo<T extends BaseSprite> (target: T): void {
    super.copyStateTo(target)
    if ((target as any).visible !== undefined) {
      ;(target as any).visible = this.visible
    }
    if (target instanceof VideoSprite) {
      target.#startTime = this.#startTime
      target.#endTime = this.#endTime
      target.#holdDuration = this.#holdDuration
      target.#zoomPositionIndex = this.#zoomPositionIndex
      // target.#originalWidth = this.#originalWidth;
      // target.#originalHeight = this.#originalHeight;
    }
  }

  #destroyed = false
  destroy (): void {
    if (this.#destroyed) return
    this.#destroyed = true

    super.destroy()
    this.#lastVf?.close()
    this.#lastVf = null
    this.#processedFrame?.close()
    this.#processedFrame = null

    if (this.#gl) {
      const gl = this.#gl
      gl.deleteTexture(this.#texture)
      gl.deleteBuffer(this.#vertexBuffer)
      gl.deleteProgram(this.#program)
    }

    this.#gl = null
    this.#canvas = null
    this.#clip.destroy()
  }
}
