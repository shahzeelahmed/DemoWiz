import * as React from 'react'
import { SVGProps } from 'react'
const DeleteIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns='http://www.w3.org/2000/svg' fill='none'  width="24"
  height="24"
  viewBox="0 0 15 15"
  >
    <path
      height={60}
      width={props.width}
      fill='#2e2e2e'
      fillRule='evenodd'
      d='M3.676 2.465h2.095v-.23a1.5 1.5 0 0 1 1.5-1.5h1.458a1.5 1.5 0 0 1 1.5 1.5v.23h2.595v.008H14a.5.5 0 0 1 0 1h-1.176v9.292a2.5 2.5 0 0 1-2.5 2.5H5.676a2.5 2.5 0 0 1-2.5-2.5V3.473H2a.5.5 0 1 1 0-1h1.176v-.008h.5Zm.5 1.008v9.292a1.5 1.5 0 0 0 1.5 1.5h4.648a1.5 1.5 0 0 0 1.5-1.5V3.473H4.176ZM9.23 2.465H6.771v-.23a.5.5 0 0 1 .5-.5h1.458a.5.5 0 0 1 .5.5v.23Z'
      clipRule='evenodd'
    />
  </svg>
)
export default DeleteIcon
