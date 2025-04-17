import * as React from "react"
import { SVGProps, memo } from "react"
const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} height={28} width={28} xmlns="http://www.w3.org/2000/svg"  fill="none">
    <path
      fill="#171717"
      fillRule="evenodd"
      d="m5.744 13.432 6.984-4.527c.33-.213.524-.549.524-.905s-.194-.691-.524-.905L5.744 2.568a1.481 1.481 0 0 0-1.37-.107c-.444.192-.724.584-.724 1.012v9.054c0 .429.28.82.724 1.012.443.192.974.15 1.37-.107Zm6.44-5.498L5.201 3.407a.483.483 0 0 0-.43-.028.264.264 0 0 0-.112.081.068.068 0 0 0-.01.016v9.048l.01.016a.264.264 0 0 0 .111.081.483.483 0 0 0 .43-.028l6.984-4.527a.194.194 0 0 0 .064-.06L12.251 8l-.003-.005a.194.194 0 0 0-.064-.061ZM4.65 12.523Zm0-9.045v-.002.002Z"
      clipRule="evenodd"
    />
  </svg>
)
const Memo = memo(PlayIcon)
export default Memo
