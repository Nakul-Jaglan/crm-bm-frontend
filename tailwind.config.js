/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#999B30',
        'primary-dark': '#58641D',
        'primary-light': '#B8BB5A',
        accent: '#D4D700',
        highlight: '#EF8354',
        
        // Light mode colors
        'surface': '#FFFFFF',
        'surface-secondary': '#F8F9FA',
        'surface-tertiary': '#F1F3F4',
        'border-custom': '#E5E7EB',
        'border-light': '#F3F4F6',
        'text-primary-custom': '#111827',
        'text-secondary-custom': '#6B7280',
        'text-tertiary-custom': '#9CA3AF',
        
        // Legacy dark mode colors (keeping for compatibility)
        'bg-dark': '#0F0F0F',
        'bg-light': '#FAFAFA',
        'text-dark': '#1A1A1A',
        'text-light': '#F1F1F1',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon': '0 0 20px rgba(153, 155, 48, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
