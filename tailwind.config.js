/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#101010',
          card: '#090d10',
          text: '#d6def0',
          muted: '#8895b5',
          border: '#1c2330',
          'border-md': '#283040',
          input: '#111a24',
          hover: '#1a2230',
          accent: '#fbcc0e',
        },
      },
    },
  },
  plugins: [],
};
