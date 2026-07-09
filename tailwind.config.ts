import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#6500D6',
          50: '#F3E8FE',
          100: '#E6D0FD',
          200: '#CDA1FB',
          300: '#B473F8',
          400: '#9B44F6',
          500: '#6500D6',
          600: '#5200AB',
          700: '#3E0080',
          800: '#2B0056',
          900: '#17002B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
