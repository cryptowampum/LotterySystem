/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          800: '#5B21B6',
          900: '#4C1D95'
        }
      }
    },
  },
  plugins: [],
}