/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'classroom': "url('../assets/ghanaian_classroom_bg_1776547738730.png')",
      }
    },
  },
  plugins: [],
}
