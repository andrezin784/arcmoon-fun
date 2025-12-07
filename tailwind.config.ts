import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        moon: {
          gold: '#FFD700',
          purple: {
            dark: '#1A0033',
            DEFAULT: '#2D1B4E',
            light: '#4A2C7C',
          },
          blue: {
            dark: '#0A2540',
            DEFAULT: '#1E3A5F',
            light: '#2E5A8F',
          },
        },
      },
      backgroundImage: {
        'moon-gradient': 'linear-gradient(135deg, #1A0033 0%, #0A2540 100%)',
        'moon-gradient-radial': 'radial-gradient(ellipse at center, #2D1B4E 0%, #0A2540 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(45, 27, 78, 0.8) 0%, rgba(30, 58, 95, 0.6) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'rocket': 'rocket 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px #FFD700, 0 0 40px #FFD700' },
          '100%': { boxShadow: '0 0 40px #FFD700, 0 0 80px #FFD700' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        rocket: {
          '0%, 100%': { transform: 'translateY(0) rotate(-45deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-45deg)' },
        },
      },
      boxShadow: {
        'moon': '0 0 30px rgba(255, 215, 0, 0.3)',
        'moon-lg': '0 0 60px rgba(255, 215, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
export default config

