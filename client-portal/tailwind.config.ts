import type { Config } from 'tailwindcss'

/**
 * Responsive breakpoints (defaults; use for mobile/iPad/desktop):
 * - default: 0 (mobile-first base)
 * - sm: 640px (large phones, small tablets)
 * - md: 768px (portrait iPad, large phones)
 * - lg: 1024px (landscape iPad, small laptops)
 * - xl: 1280px (desktop)
 * - 2xl: 1536px (large desktop)
 * Test at 375px (phone), 768px (iPad portrait), 1024px (iPad landscape).
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'site-gold': '#8B6F47',
        'site-gray': '#666',
        'site-gray-light': '#777',
        'ebony': '#0a0a0a',
        'brass': '#8B6F47',
        'stone': {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config

