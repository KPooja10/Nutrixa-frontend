/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          bg: '#070a13',
          card: 'rgba(15, 23, 42, 0.6)',
          accent: '#06b6d4',
          glow: '#0ea5e9',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-blue': '0 0 15px rgba(14, 165, 233, 0.3)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
      },
    },
  },
  plugins: [],
}
