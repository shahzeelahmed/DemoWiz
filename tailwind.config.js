/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      blur:{
        xs: '2px',
      },
      height:{
        xl: '80%'
      },
      width:{
        xl: '75%'
      },
      dropShadow:{
        '4xl': [
          '0 25px 25px rgba(0, 0, 0, 0.5)',
          '0 35px 25px rgba(0, 0, 0, 0.25)'
      ]
      }
    },
  },
  plugins: [],
}

