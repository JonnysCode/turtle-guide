/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Calming Color Palette
        'chalk': '#F6F4F1',
        'flaxseed': '#F7E6C6',
        'blue-glass': '#B8DCDC',
        'royal-palm': '#418D84',
        'earie-black': '#1A1F16',
        'tropical-indigo': '#9381FF',

        // Legacy support - map to new palette
        'turtle-teal': {
          '50': '#f4f9f8',
          '100': '#d9eeea',
          '200': '#b8dcdc',
          '300': '#84c4b9',
          '400': '#5aa79c',
          '500': '#418d84',
          '600': '#326f69',
          '700': '#2b5a56',
          '800': '#264947',
          '900': '#233e3c',
          '950': '#102323'
        },
        'turtle-cream': {
          '50': '#fdf9ef',
          '100': '#faf0da',
          '200': '#f7e6c6',
          '300': '#edc684',
          '400': '#e5a552',
          '500': '#df8d30',
          '600': '#d17425',
          '700': '#ad5a21',
          '800': '#8a4822',
          '900': '#703d1e',
          '950': '#3c1d0e'
        },
        'turtle-indigo': {
          '50': '#f4f2ff',
          '100': '#e9e8ff',
          '200': '#d7d4ff',
          '300': '#bab2ff',
          '400': '#9381ff',
          '500': '#7655fd',
          '600': '#6532f5',
          '700': '#5620e1',
          '800': '#481abd',
          '900': '#3d189a',
          '950': '#230c69'
        },
        'turtle-sage': {
          50: '#F6F4F1',
          100: '#B8DCDC',
          200: '#B8DCDC',
          300: '#418D84',
          400: '#418D84',
          500: '#418D84',
          600: '#418D84',
          700: '#418D84',
          800: '#1A1F16',
          900: '#1A1F16'
        },
        'turtle-green': '#418D84',
        'turtle-amber': '#9381FF',
        'success': '#418D84',
        'warning': '#9381FF',
        'error': '#FF6B6B',
        'info': '#9381FF'
      },
      fontFamily: {
        'inter': ['Inter-Regular'],
        'inter-bold': ['Inter-Bold'],
        'inter-semibold': ['Inter-SemiBold']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(20, 184, 166, 0.15)',
        'nature': '0 4px 20px rgba(20, 184, 166, 0.1)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: []
};