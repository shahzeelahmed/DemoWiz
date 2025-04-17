import * as React from "react"
import { SVGProps, memo } from "react"
const PauseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} height={28} width={28}  xmlns="http://www.w3.org/2000/svg" fill="none">
    <path
      fill="#171717"
      fillRule="evenodd"
      d="M5.5 4v8a1 1 0 1 1-2 0V4a1 1 0 0 1 2 0Zm-3 0a2 2 0 1 1 4 0v8a2 2 0 1 1-4 0V4Zm10 0v8a1 1 0 1 1-2 0V4a1 1 0 1 1 2 0Zm-3 0a2 2 0 1 1 4 0v8a2 2 0 1 1-4 0V4Z"
      clipRule="evenodd"
    />
  </svg>
)
const Memo = memo(PauseIcon)
export default Memo