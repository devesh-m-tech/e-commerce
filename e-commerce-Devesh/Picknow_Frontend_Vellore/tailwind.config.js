/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon:   '#6D1734',
        burgundy: '#4A1025',
        gold:     '#C5A15A',
        ivory:    '#FFF9F0',
        beige:    '#EDE2D2',
        charcoal: '#282321',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans:  ['Karla', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm:      '2px',
        md:      '2px',
        lg:      '2px',
        xl:      '2px',
      },
    },
  },
  plugins: [],
};
