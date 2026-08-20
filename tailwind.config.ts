import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08090A',
          900: '#101113',
          800: '#17191C',
          700: '#1E2126',
          600: '#2A2F36',
          500: '#3B424C',
          400: '#6B7280',
          300: '#9CA3AF',
          200: '#D1D5DB',
          100: '#E5E7EB',
          50: '#F3F4F6',
        },
        accent: {
          DEFAULT: '#3B82F6',
          soft: '#60A5FA',
          deep: '#1D4ED8',
        },
        critical: '#DC2626',
        high: '#EA580C',
        medium: '#CA8A04',
        low: '#2563EB',
        info: '#64748B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.35)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
