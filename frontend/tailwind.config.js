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
      },
      fontFamily: {
        // Apple system font stack — applies everywhere via font-sans (Tailwind default)
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        // Keep serif for headings (Fraunces)
        serif: ['Fraunces', 'Georgia', 'serif'],
        // Display alias for hero headings
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
}
