// credits: https://github.com/WebAV-Tech/WebAV/blob/6dcbcb325800e92f7ed73c91af4fb1e8527741a2/packages/av-cliper/src/chromakey.ts
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
  uniform vec2 resolution;
  uniform float time;
  uniform vec2 zoomCoords;
  uniform sampler2D inputTexture;
  const float ZOOM_DURATION = 0.8;
  const float HOLD_DURATION = 2.0;
  const float MAX_ZOOM = 3.0;
  const float MOTION_BLUR_STRENGTH = 5.0;
  const int MOTION_BLUR_SAMPLES = 100;
  
  float easeInOutSine(float t) {
    float eased = 0.5 * (1.0 - cos(3.141592653589793 * pow(t, 0.95)));
    return eased + (sin(t * 3.141592653589793) * 0.02 * (1.0 - t));
  }
  
  void getZoomParams(float animTime, out float zoomLevel, out vec2 focalPoint) {
    float totalDuration = ZOOM_DURATION * 2.0 + HOLD_DURATION;
    float cyclicTime = mod(animTime, totalDuration);
    if (cyclicTime < ZOOM_DURATION) {
      float t = cyclicTime / ZOOM_DURATION;
      zoomLevel = 1.0 + (MAX_ZOOM - 1.0) * easeInOutSine(t);
      focalPoint = zoomCoords;
    } else if (cyclicTime < ZOOM_DURATION + HOLD_DURATION) {
      zoomLevel = MAX_ZOOM;
      focalPoint = zoomCoords;
    } else {
      float t = (cyclicTime - ZOOM_DURATION - HOLD_DURATION) / ZOOM_DURATION;
      zoomLevel = MAX_ZOOM - (MAX_ZOOM - 1.0) * easeInOutSine(t);
      focalPoint = zoomCoords;
    }
  }
  
  vec4 sampleWithMotionBlur(vec2 uv, float animTime) {
    float totalDuration = ZOOM_DURATION * 2.0 + HOLD_DURATION;
    float cyclicTime = mod(animTime, totalDuration);
    bool isZooming = cyclicTime < ZOOM_DURATION || cyclicTime > ZOOM_DURATION + HOLD_DURATION;
    if (!isZooming) {
      return texture2D(inputTexture, uv);
    }
    float zoomSpeed;
    if (cyclicTime < ZOOM_DURATION) {
      float t = cyclicTime / ZOOM_DURATION;
      float dt = 0.01;
      float z1 = 1.0 + (MAX_ZOOM - 1.0) * easeInOutSine(t);
      float z2 = 1.0 + (MAX_ZOOM - 1.0) * easeInOutSine(t + dt);
      zoomSpeed = (z2 - z1) / dt;
    } else {
      float t = (cyclicTime - ZOOM_DURATION - HOLD_DURATION) / ZOOM_DURATION;
      float dt = 0.01;
      float z1 = MAX_ZOOM - (MAX_ZOOM - 1.0) * easeInOutSine(t);
      float z2 = MAX_ZOOM - (MAX_ZOOM - 1.0) * easeInOutSine(t + dt);
      zoomSpeed = (z2 - z1) / dt;
    }
    vec4 color = vec4(0.0);
    float blurAmount = abs(zoomSpeed) * MOTION_BLUR_STRENGTH / float(MOTION_BLUR_SAMPLES);
    for (int i = 0; i < MOTION_BLUR_SAMPLES; i++) {
      float t = float(i) / float(MOTION_BLUR_SAMPLES - 1);
      float zoomFactor = 1.0 + (zoomSpeed * blurAmount * (t - 0.5));
      vec2 offsetUV = zoomCoords + (uv - zoomCoords) * zoomFactor;
      color += texture2D(inputTexture, offsetUV);
    }
    return color / float(MOTION_BLUR_SAMPLES);
  }
  
  void main() {
    vec2 uv = vUv;
    float zoomLevel;
    vec2 focalPoint;
    getZoomParams(time, zoomLevel, focalPoint);
    vec2 zoomedUV = focalPoint + (uv - focalPoint) / zoomLevel;
    vec4 color = sampleWithMotionBlur(zoomedUV, time);
    gl_FragColor = color;
  }
`

const VERTEX_POS = [-1, 1, -1, -1, 1, 1, 1, -1]

function initShaderProgram (
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)!
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)!
  const shaderProgram = gl.createProgram()!
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw Error(
      gl.getProgramInfoLog(shaderProgram) ??
        'Unable to initialize the shader program'
    )
  }
  return shaderProgram
}

function loadShader (gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const errMsg = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw Error(errMsg ?? 'An error occurred compiling the shaders')
  }
  return shader
}

function updateTexture (
  gl: WebGLRenderingContext,
  img: TImgSource,
  texture: WebGLTexture
) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

function initTexture (gl: WebGLRenderingContext) {
  const texture = gl.createTexture()
  if (!texture) throw Error('Create WebGL texture error')
  gl.bindTexture(gl.TEXTURE_2D, texture)
  const level = 0
  const internalFormat = gl.RGBA
  const width = 1
  const height = 1
  const border = 0
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  const pixel = new Uint8Array([0, 0, 255, 255]) 
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return texture
}

function initCanvas (opts: { width: number; height: number }) {
  const cvs =
    'document' in globalThis
      ? globalThis.document.createElement('canvas')
      : new OffscreenCanvas(opts.width, opts.height)
  cvs.width = opts.width
  cvs.height = opts.height
  const gl = cvs.getContext('webgl', {
    premultipliedAlpha: false,
    alpha: true
  }) as WebGLRenderingContext | null
  if (!gl) throw Error('Cannot create WebGL context')
  return { cvs, gl }
}

type TImgSource =
  | HTMLVideoElement
  | HTMLCanvasElement
  | HTMLImageElement
  | ImageBitmap
  | OffscreenCanvas
  | VideoFrame


interface motionShaderOpts {
  zoomCoords: [number, number]
  zoomDepth: number
}


export const createZoomBlurShader = (opts: motionShaderOpts) => {
  let cvs: HTMLCanvasElement | OffscreenCanvas | null = null
  let gl: WebGLRenderingContext | null = null
  let texture: WebGLTexture | null = null

  return async (imgSource: TImgSource) => {
    const { width, height } =
      imgSource instanceof VideoFrame
        ? { width: imgSource.codedWidth, height: imgSource.codedHeight }
        : { width: imgSource.width, height: imgSource.height }

    if (!cvs || !gl || !texture) {
      ;({ cvs, gl } = initCanvas({ width, height }))
      const shaderProgram = initShaderProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
      )
      gl.useProgram(shaderProgram)

      gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'resolution'), [
        width,
        height
      ])

      gl.uniform1f(
        gl.getUniformLocation(shaderProgram, 'time'),
        performance.now() / 1000
      )
      gl.uniform1f(
        gl.getUniformLocation(shaderProgram, 'MAX_ZOOM'),
        opts.zoomDepth
      )

      gl.uniform2fv(
        gl.getUniformLocation(shaderProgram, 'zoomCoords'),
        opts.zoomCoords
      )

      gl.uniform1i(gl.getUniformLocation(shaderProgram, 'inputTexture'), 0)

      const posBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(VERTEX_POS),
        gl.STATIC_DRAW
      )
      const posAttrib = gl.getAttribLocation(shaderProgram, 'position')
      gl.enableVertexAttribArray(posAttrib)
      gl.vertexAttribPointer(
        posAttrib,
        2,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 2,
        0
      )

      texture = initTexture(gl)
    } else {
      const shaderProgram = gl.getParameter(gl.CURRENT_PROGRAM)
      if (shaderProgram) {
        gl.uniform1f(
          gl.getUniformLocation(shaderProgram, 'time'),
          performance.now() / 1000
        )
      }
    }

    updateTexture(gl, imgSource, texture)

    if (
      globalThis.VideoFrame != null &&
      imgSource instanceof globalThis.VideoFrame
    ) {
      const rs = new VideoFrame(cvs, {
        alpha: 'keep',
        timestamp: imgSource.timestamp,
        duration: imgSource.duration ?? undefined
      })
      imgSource.close()
      return rs
    }
    return createImageBitmap(cvs, {
      imageOrientation: imgSource instanceof ImageBitmap ? 'flipY' : 'none'
    })
  }
}
