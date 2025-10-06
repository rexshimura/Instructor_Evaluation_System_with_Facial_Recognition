/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        animation: {
            slideIn: 'slideIn 0.5s ease-out forwards',
        },
        keyframes: {
            slideIn: {
                '0%': {transform: 'translateX(100%)', opacity: '0'},
                '100%': {transform: 'translateX(0)', opacity: '1'},
            },
        },
    },
  },
  plugins: [],
};