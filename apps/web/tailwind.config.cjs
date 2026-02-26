/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#d9ebff",
          200: "#b7d9ff",
          500: "#5e9bd7",
          600: "#4b86c0"
        },
        sage: {
          100: "#e8f1ea",
          500: "#7ba989"
        }
      }
    }
  },
  plugins: []
};
