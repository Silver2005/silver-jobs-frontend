/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'silver-blue': '#2563eb',
        'silver-dark': '#1e3a8a',
      },
    },
  },
  plugins: [],
}