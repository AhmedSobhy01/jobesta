/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        customFont: ['"Baumans"'],
      },
    },
  },
  safelist: [
    { pattern: /text-(orange|purple|cyan)-600/ },
    { pattern: /bg-(orange|purple|cyan)-100/ },
  ],
  plugins: [],
};
