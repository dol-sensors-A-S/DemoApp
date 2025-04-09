/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        "dol-blue": "#004077",
        "dol-green": "#00994C"
      },
    },
  },
  plugins: [],
}