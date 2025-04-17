import { IClip, VisibleSprite } from '@webav/av-cliper'
import { BaseSprite, changePCMPlaybackRate, Rect } from './baseSprite'

export class VideoSprite extends BaseSprite {
  #clip: IClip
  #startTime: number = 0
  #endTime: number = 0
  #currentTime: number = 0
  #zoomDuration: number = 10*1e6
  #maxZoom: number = 2.0
  #focalPoints: { x: number; y: number }[] = []
  focalPoint: { x: number; y: number } = { x: 1, y: 0.5 }
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
    startTime: number = 1 * 1e6,
    endTime: number = 10 * 1e6,
    holdDuration: number = 3 * 1e6,
    zoomPositionIndex: number = 8
  ) {
    super()
    this.#clip = clip
    this.#startTime = startTime
    this.#endTime = endTime
    this.#holdDuration = holdDuration
    this.ready = clip.ready.then(({ width, height, duration }) => {
      this.rect.w = this.rect.w === 0 ? width : this.rect.w
      this.rect.h = this.rect.h === 0 ? height : this.rect.h
      this.time.duration =
        this.time.duration === 0 ? duration : this.time.duration
      this.#originalX = this.rect.x
      this.#originalY = this.rect.y
      this.#focalPoints = [
        { x: 0.25, y: 0.25 },
        { x: 0.75, y: 0.25 },
        {x:0.5,y:0.5}
      ]; 
      this.focalPoint = this.#getFocalPoint(8);
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

  setZoomParameters (
    startTime: number = 1 * 1e6,
    endTime: number = 15 * 1e6,
    holdDuration: number = 5 * 1e6,
    zoomPositionIndex: number = 4
  ) {
    this.#startTime = startTime
    this.#endTime = endTime || startTime + 2 * this.#zoomDuration + holdDuration
    this.#holdDuration = holdDuration

  }
  // #easeInOutSine (t: number): number {
  //   return -(Math.cos(Math.PI * t) - 1) / 2
  // }

  //https://easings.net/#easeInOutQuint
  #easeInOutQuint(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }



  #updateScale (time: number): void {


    const totalDuration = 2 * this.#zoomDuration + this.#holdDuration;

    if (time < this.#startTime || time > this.#endTime) {
      this.#originalX = this.rect.x;
      this.#originalY = this.rect.y;
      this.#originalWidth = this.rect.w;
      this.#originalHeight = this.rect.h;
      return;
    }
    
    const totalAnimationTime = this.#endTime - this.#startTime;
    const progress = Math.max(
      0,
      Math.min(1, (time - this.#startTime) / totalAnimationTime)
    );
    
    let zoomFactor = 1.0;
    const zoomInDurationRelative = this.#zoomDuration / totalDuration;
    const holdDurationRelative = this.#holdDuration / totalDuration; // Use holdDuration here!
    
    if (progress < zoomInDurationRelative) {
      const t = progress / zoomInDurationRelative;
      zoomFactor = 1.0 + (this.#maxZoom - 1.0) * this.#easeInOutQuint(t);
      console.log('zoomIn:', zoomFactor);
    } else if (progress < zoomInDurationRelative + holdDurationRelative) {
      zoomFactor = this.#maxZoom;
      console.log('hold:', zoomFactor);
    } else {
      const t =
        (progress - zoomInDurationRelative - holdDurationRelative) /
        zoomInDurationRelative;
      zoomFactor =
        this.#maxZoom - (this.#maxZoom - 1.0) * this.#easeInOutQuint(t);
      console.log('zoomOut:', zoomFactor);
    }
    


    zoomFactor = Math.max(1.0, zoomFactor)

    const finalWidth = this.#originalWidth * zoomFactor
    const finalHeight = this.#originalHeight * zoomFactor

    const focalPoint = this.#getFocalPoint(8)
    const newRectX =
      this.#originalX + focalPoint.x * this.#originalWidth * (1 - zoomFactor)
    const newRectY =
      this.#originalY + focalPoint.y * this.#originalHeight * (1 - zoomFactor)

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
    this.#updateScale(time)

    const audio = this.#lastAudio
    this.#lastAudio = []
    const video = this.#lastVf

    if (video != null) {
      if (this.#processedFrame) {
        this.#processedFrame.close()
        this.#processedFrame = null
      }

      this.#processedFrame = this.#renderWithWebGL(video)
      if (this.#processedFrame) {
        ctx.drawImage(this.#processedFrame, -w / 2, -h / 2, w, h)
      } else {
        ctx.drawImage(video, -w / 2, -h / 2, w, h)
      }
    }

    return { audio }
  }

  copyStateTo<T extends BaseSprite> (target: T): void {
    super.copyStateTo(target)
    if ((target as any).visible !== undefined) {
      ;(target as any).visible = this.visible
    }
    if (target instanceof VideoSprite) {
      target.#startTime = this.#startTime
      target.#endTime = this.#endTime
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
