/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'heading': ['var(--font-poppins)', 'sans-serif'],
        'body': ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        primary: '#ff0000',
        secondary: '#f8f9fa',
      }
    },
  },
  plugins: [],
}
