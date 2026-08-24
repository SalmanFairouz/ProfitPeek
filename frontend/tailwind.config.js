/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E9F1F1',
          100: '#CFE1E1',
          200: '#A9CBC9',
          300: '#7BA5A4',
          500: '#166E82',
          700: '#0F4C5C',
          800: '#0B3A47',
          900: '#0B323D',
          950: '#06232B',
        },
        accent: {
          400: '#3BD79E',
          500: '#17C98A',
          600: '#12B87D',
        },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'none' } },
        toast: { from: { opacity: '0', transform: 'translateX(24px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        rise: 'rise 0.32s ease both',
        toast: 'toast 0.22s ease both',
      },
    },
  },
  plugins: [],
};
