type EventKey = string | symbol

type EventToolType = Record<EventKey, (...args: any[]) => any>

export class EventTool<T extends EventToolType> {
  static forwardEvent<
    T1 extends EventToolType,
    T2 extends EventToolType,
    EvtType extends (keyof T1 | [keyof T1, keyof T2])[]
  >(
    from: { on: EventTool<T1>['on'] },
    to: { emit: EventTool<T2>['emit'] },

    evtTypes: EvtType
  ): () => void {
    const removeHandlers = evtTypes.map(evtType => {
      const [fromEvtType, toEvtType] = (
        Array.isArray(evtType) ? evtType : [evtType, evtType]
      ) as [keyof T1, keyof T2]

      //@ts-expect-error
      return from.on(fromEvtType, (...args) => {
        //@ts-expect-error
        to.emit(toEvtType, ...args)
      })
    })
    return () => {
      removeHandlers.forEach(fn => fn())
    }
  }

  #listeners = new Map<keyof T, Set<T[keyof T]>>()

  on = <Type extends keyof T>(type: Type, listener: T[Type]): (() => void) => {
    const handlers = this.#listeners.get(type) ?? new Set<T[keyof T]>()
    handlers.add(listener)

    if (!this.#listeners.has(type)) {
      this.#listeners.set(type, handlers)
    }

    return () => {
      handlers.delete(listener)
      if (handlers.size === 0) {
        this.#listeners.delete(type)
      }
    }
  }

  once = <Type extends keyof T>(
    type: Type,
    listener: T[Type]
  ): (() => void) => {
    //@ts-expect-error
    const off = this.on(type, (...args) => {
      off()
      listener(...args)
    })

    return off
  }

  emit = <Type extends keyof T>(
    type: Type,
    ...args: Type extends string
      ? T[Type] extends (...args: any[]) => any
        ? Parameters<T[Type]>
        : never
      : never
  ): void => {
    const handlers = this.#listeners.get(type)
    if (handlers == null) return

    handlers.forEach(handler => handler(...args))
  }

  destroy (): void {
    this.#listeners.clear()
  }
}
interface IAnimationOpts {
  duration: number
  delay?: number
  iterCount?: number
}

interface IPoint {
  x: number
  y: number
}

export interface IRectBaseProps {
  x: number
  y: number
  w: number
  h: number
  angle: number
}

export class Rect implements IRectBaseProps {
  #evtTool = new EventTool<{
    propsChange: (props: Partial<IRectBaseProps>) => void
  }>()

  on = this.#evtTool.on

  #x = 0

  get x () {
    return this.#x
  }
  set x (v) {
    this.#setBaseProps('x', v)
  }
  #y = 0
  get y () {
    return this.#y
  }

  set y (v) {
    this.#setBaseProps('y', v)
  }
  #w = 0

  get w () {
    return this.#w
  }
  set w (v) {
    this.#setBaseProps('w', v)
  }
  #h = 0

  get h () {
    return this.#h
  }
  set h (v) {
    this.#setBaseProps('h', v)
  }
  #angle = 0

  get angle () {
    return this.#angle
  }
  set angle (v) {
    this.#setBaseProps('angle', v)
  }

  #setBaseProps (prop: keyof IRectBaseProps, v: number) {
    const changed = this[prop] !== v
    switch (prop) {
      case 'x':
        this.#x = v
        break
      case 'y':
        this.#y = v
        break
      case 'w':
        this.#w = v
        break
      case 'h':
        this.#h = v
        break
      case 'angle':
        this.#angle = v
        break
    }
    if (changed) this.#evtTool.emit('propsChange', { [prop]: v })
  }

  #master: Rect | null = null

  constructor (
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    master?: Rect | null
  ) {
    this.x = x ?? 0
    this.y = y ?? 0
    this.w = w ?? 0
    this.h = h ?? 0
    this.#master = master ?? null
  }

  get center (): IPoint {
    const { x, y, w, h } = this
    return { x: x + w / 2, y: y + h / 2 }
  }

  fixedAspectRatio = false

  fixedScaleCenter = false

  clone (): Rect {
    const { x, y, w, h } = this
    const rect = new Rect(x, y, w, h, this.#master)
    rect.angle = this.angle
    rect.fixedAspectRatio = this.fixedAspectRatio
    rect.fixedScaleCenter = this.fixedScaleCenter
    return rect
  }

  checkHit (tx: number, ty: number): boolean {
    let { angle, center, x, y, w, h } = this

    const cnt = this.#master?.center ?? center
    const agl = this.#master?.angle ?? angle

    if (this.#master == null) {
      x = x - cnt.x
      y = y - cnt.y
    }

    const tOX = tx - cnt.x
    const tOY = ty - cnt.y

    let mx = tOX
    let my = tOY
    if (agl !== 0) {
      mx = tOX * Math.cos(agl) + tOY * Math.sin(agl)
      my = tOY * Math.cos(agl) - tOX * Math.sin(agl)
    }

    if (mx < x || mx > x + w || my < y || my > y + h) return false

    return true
  }
}
export function changePCMPlaybackRate(
  pcmData: Float32Array,
  playbackRate: number,
) {
  // 计算新的采样率
  const newLength = Math.floor(pcmData.length / playbackRate);
  const newPcmData = new Float32Array(newLength);

  // 线性插值
  for (let i = 0; i < newLength; i++) {
    // 原始数据中的位置
    const originalIndex = i * playbackRate;
    const intIndex = Math.floor(originalIndex);
    const frac = originalIndex - intIndex;

    // 边界检查
    if (intIndex + 1 < pcmData.length) {
      newPcmData[i] =
        pcmData[intIndex] * (1 - frac) + pcmData[intIndex + 1] * frac;
    } else {
      newPcmData[i] = pcmData[intIndex]; // 最后一个样本
    }
  }

  return newPcmData;
}
type TAnimateProps = IRectBaseProps & { opacity: number }

export type TAnimationKeyFrame = Array<[number, Partial<TAnimateProps>]>

type TKeyFrameOpts = Partial<
  Record<`${number}%` | 'from' | 'to', Partial<TAnimateProps>>
>

export abstract class BaseSprite {
  rect = new Rect()

  #time = {
    offset: 0,
    duration: 0,
    playbackRate: 1
  }
  get time (): { offset: number; duration: number; playbackRate: number } {
    return this.#time
  }
  set time (v: { offset: number; duration: number; playbackRate?: number }) {
    Object.assign(this.#time, v)
  }

  #evtTool = new EventTool<{
    propsChange: (
      value: Partial<{ rect: Partial<Rect>; zIndex: number }>
    ) => void
  }>()

  on = this.#evtTool.on

  #zIndex = 0
  get zIndex (): number {
    return this.#zIndex
  }

  set zIndex (v: number) {
    const changed = this.#zIndex !== v
    this.#zIndex = v
    if (changed) this.#evtTool.emit('propsChange', { zIndex: v })
  }

  opacity = 1

  flip: 'horizontal' | 'vertical' | null = null

  #animatKeyFrame: TAnimationKeyFrame | null = null

  #animatOpts: Required<IAnimationOpts> | null = null

  ready = Promise.resolve()

  constructor () {
    this.rect.on('propsChange', props => {
      this.#evtTool.emit('propsChange', { rect: props })
    })
  }

  protected _render (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ): void {
    const {
      rect: { center, angle }
    } = this
    ctx.setTransform(
      this.flip === 'horizontal' ? -1 : 1,
      0,

      0,
      this.flip === 'vertical' ? -1 : 1,

      center.x,
      center.y
    )

    ctx.rotate((this.flip == null ? 1 : -1) * angle)

    ctx.globalAlpha = this.opacity
  }

  setAnimation (keyFrame: TKeyFrameOpts, opts: IAnimationOpts): void {
    this.#animatKeyFrame = Object.entries(keyFrame).map(([k, val]) => {
      const numK = { from: 0, to: 100 }[k] ?? Number(k.slice(0, -1))
      if (isNaN(numK) || numK > 100 || numK < 0) {
        throw Error('keyFrame must between 0~100')
      }
      return [numK / 100, val]
    }) as TAnimationKeyFrame
    this.#animatOpts = Object.assign({}, this.#animatOpts, {
      duration: opts.duration,
      delay: opts.delay ?? 0,
      iterCount: opts.iterCount ?? Infinity
    })
  }

  animate (time: number): void {
    if (
      this.#animatKeyFrame == null ||
      this.#animatOpts == null ||
      time < this.#animatOpts.delay
    )
      return
    const updateProps = linearTimeFn(
      time,
      this.#animatKeyFrame,
      this.#animatOpts
    )
    for (const k in updateProps) {
      switch (k) {
        case 'opacity':
          this.opacity = updateProps[k] as number
          break
        case 'x':
        case 'y':
        case 'w':
        case 'h':
        case 'angle':
          this.rect[k] = updateProps[k] as number
          break
      }
    }
  }

  copyStateTo<T extends BaseSprite> (target: T) {
    target.#animatKeyFrame = this.#animatKeyFrame
    target.#animatOpts = this.#animatOpts
    target.zIndex = this.zIndex
    target.opacity = this.opacity
    target.flip = this.flip
    target.rect = this.rect.clone()
    target.time = { ...this.time }
  }

  protected destroy () {
    this.#evtTool.destroy()
  }
}

export function linearTimeFn (
  time: number,
  kf: TAnimationKeyFrame,
  opts: Required<IAnimationOpts>
): Partial<TAnimateProps> {
  const offsetTime = time - opts.delay
  if (offsetTime / opts.duration >= opts.iterCount) return {}

  const t = offsetTime % opts.duration

  const process = offsetTime === opts.duration ? 1 : t / opts.duration
  const idx = kf.findIndex(it => it[0] >= process)
  if (idx === -1) return {}

  const startState = kf[idx - 1]
  const nextState = kf[idx]
  const nextFrame = nextState[1]
  if (startState == null) return nextFrame
  const startFrame = startState[1]

  const rs: Partial<TAnimateProps> = {}

  const stateProcess =
    (process - startState[0]) / (nextState[0] - startState[0])
  for (const prop in nextFrame) {
    const p = prop as keyof TAnimateProps
    if (startFrame[p] == null) continue
//@ts-expect-error
    rs[p] = (nextFrame[p] - startFrame[p]) * stateProcess + startFrame[p]
  }

  return rs
}
