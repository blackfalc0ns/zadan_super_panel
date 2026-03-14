/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Cairo', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: "#127C8C",
        "primary-dark": "#0E5F6B",
        "accent-orange": "#f97316",
        "background-light": "#f6f8f8",
        "background-dark": "#111f21",
        zadna: {
          primary: "#127C8C",
          primaryDark: "#0E5F6B",
          primaryLight: "#1FA3B5",
          accent: "#e48215",
          accentDark: "#c16d0f",
          accentLight: "#f2a145",
          bgLight: "#F6FAFB",
          bgDark: "#0F172A",
          surfaceLight: "#FFFFFF",
          surfaceDark: "#1E293B"
        },
      },
      keyframes: {
        'puzzle-left': {
          '0%': { transform: 'translateX(-150px) scale(0.9) rotate(-15deg)', filter: 'blur(20px)', opacity: '0' },
          '60%': { transform: 'translateX(10px) scale(1.02)', filter: 'blur(0)', opacity: '1' },
          '100%': { transform: 'translateX(0) scale(1) rotate(0)', opacity: '1' },
        },
        'puzzle-right': {
          '0%': { transform: 'translateX(150px) scale(0.9) rotate(15deg)', filter: 'blur(20px)', opacity: '0' },
          '60%': { transform: 'translateX(-10px) scale(1.02)', filter: 'blur(0)', opacity: '1' },
          '100%': { transform: 'translateX(0) scale(1) rotate(0)', opacity: '1' },
        },
        'puzzle-up': {
          '0%': { transform: 'translateY(60px) scale(0.95)', filter: 'blur(10px)', opacity: '0' },
          '70%': { transform: 'translateY(-5px) scale(1.01)', filter: 'blur(0)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'puzzle-down': {
          '0%': { transform: 'translateY(-60px) scale(0.95)', filter: 'blur(10px)', opacity: '0' },
          '70%': { transform: 'translateY(5px) scale(1.01)', filter: 'blur(0)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'puzzle-scale-rotate': {
          '0%': { transform: 'scale(0.4) rotate(-20deg)', opacity: '0', filter: 'blur(30px) brightness(1.5)' },
          '60%': { transform: 'scale(1.08) rotate(2deg)', opacity: '0.8', filter: 'blur(0)' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        'slow-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        }
      },
      animation: {
        'puzzle-left': 'puzzle-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'puzzle-right': 'puzzle-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'puzzle-up': 'puzzle-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'puzzle-down': 'puzzle-down 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'puzzle-scale-rotate': 'puzzle-scale-rotate 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slow-float': 'slow-float 20s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
