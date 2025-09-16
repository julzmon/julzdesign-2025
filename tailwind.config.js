export default {
  safelist: [
    'p-2', 'py-2', 'px-3'
  ],
  content: [
    "./src/**/*.{html,js,njk}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Ubuntu", "Cantarell", "Noto Sans", "Helvetica Neue", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#0ea5e9" // sky-500
        }
      }
    },
  },
  plugins: [],
}
