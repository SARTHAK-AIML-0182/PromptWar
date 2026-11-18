/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563EB",
          dark: "#1E3A8A",
          green: "#16A34A",
          light: "#EFF6FF",
          border: "#E2E8F0"
        }
      }
    },
  },
  plugins: [],
}
