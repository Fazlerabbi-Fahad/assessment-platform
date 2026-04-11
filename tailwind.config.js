/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: { DEFAULT: '#7C3AED', dark: '#6D28D9', light: '#EDE9FE', 100: '#F5F3FF' },
      },
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        poppins: ["'Poppins'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
