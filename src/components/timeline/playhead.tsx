interface PlayheadProps {
    currentTime: number;
    duration: number;
    height: number;
    width: number;
  }

const  Playhead=(props: PlayheadProps) => {<div
className="absolute top-0 h-full"
style={{ left: `${(props.currentTime / props.duration) * 100}%` }}
>
<g>
    <rect
        x={props.width / 2 - 1}
        y={props.width / 4}
        width={2}
        height={props.height - props.width / 4}
        fill="hsl(0, 0%, 100%)"
        stroke="black"
    />
    <path
        d="
          M0 0
          H{props.width}
          V{props.width / 2}
          L{props.width / 2} ${props.width}
          L0 {props.width / 2}
          Z
        "
        fill="hsla(0, 0%, 90%, 0.8)"
        stroke="black"
        stroke-width="0.5"
      />
    </g>

<div className="absolute -left-1 top-0 w-2 h-full bg-blue-500" />
<div className="absolute -left-2 -top-3 w-4 h-4 bg-blue-500 rounded-full" />
</div>}