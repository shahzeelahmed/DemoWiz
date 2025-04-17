import React from "react"

const SplitIcon = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 12 12"
      className={`w-8 h-8 ${props.className || ""}`}
    >
      <g clipPath="url(#a)">
        <path
          stroke="#3e3e3e"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.021 4.622 5.946 4.85m0-6.576L4.02 7.746m4.576-1.562-.011.01m2.213-.01-.01.01M2.843 5.088a1.644 1.644 0 1 1 0-3.288 1.644 1.644 0 0 1 0 3.288Zm0 5.48a1.644 1.644 0 1 1 0-3.289 1.644 1.644 0 0 1 0 3.288Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M12 0v12H0V0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default SplitIcon
