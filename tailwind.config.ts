import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #9333ea 0%, #ea580c 100%)',
        'gradient-accent': 'linear-gradient(135deg, #c084fc 0%, #fb923c 100%)',
        'gradient-purple': 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'gradient': 'gradient 3s ease infinite',
        'shimmer': 'shimmer 2s infinite',
        'shimmer-slow': 'shimmer-slow 3s infinite',
        'border-spin': 'border-spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'shimmer-slow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'border-spin': {
          '0%': { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px rgb(168 85 247 / 0.4), 0 0 20px rgb(249 115 22 / 0.2), 0 0 35px rgb(168 85 247 / 0.1)' },
          '100%': { boxShadow: '0 0 10px rgb(168 85 247 / 0.6), 0 0 30px rgb(249 115 22 / 0.4), 0 0 50px rgb(168 85 247 / 0.2)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function ({ addVariant }: { addVariant: (name: string, selector: string) => void }) {
      addVariant('autofill', '&:-webkit-autofill')
      addVariant('autofill-hover', '&:-webkit-autofill:hover')
      addVariant('autofill-focus', '&:-webkit-autofill:focus')
      addVariant('autofill-active', '&:-webkit-autofill:active')
    }
  ],
}

export default config 