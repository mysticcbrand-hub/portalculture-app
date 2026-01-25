import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Premium color palette
        premium: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.12)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        'glow-white': 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        'glow-soft': 'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 60%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 10s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'blur-in': 'blur-in 0.6s ease-out',
        'mesh-float-1': 'mesh-float-1 20s ease-in-out infinite',
        'mesh-float-2': 'mesh-float-2 25s ease-in-out infinite',
        'mesh-float-3': 'mesh-float-3 22s ease-in-out infinite',
        'mesh-float-4': 'mesh-float-4 28s ease-in-out infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(255,255,255,0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(255,255,255,0.2)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blur-in': {
          '0%': { opacity: '0', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        'mesh-float-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(50px, -80px) scale(1.1) rotate(5deg)' },
          '66%': { transform: 'translate(-30px, 60px) scale(0.95) rotate(-3deg)' },
        },
        'mesh-float-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(-60px, 70px) scale(1.08) rotate(-4deg)' },
          '66%': { transform: 'translate(40px, -50px) scale(0.92) rotate(6deg)' },
        },
        'mesh-float-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(70px, 40px) scale(1.12) rotate(3deg)' },
          '66%': { transform: 'translate(-50px, -70px) scale(0.9) rotate(-5deg)' },
        },
        'mesh-float-4': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(-40px, -60px) scale(1.15) rotate(-2deg)' },
          '66%': { transform: 'translate(60px, 50px) scale(0.88) rotate(4deg)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(255,255,255,0.1)' },
          '50%': { borderColor: 'rgba(255,255,255,0.2)' },
        },
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
        '5xl': '96px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(255,255,255,0.05)',
        'glow': '0 0 30px rgba(255,255,255,0.1)',
        'glow-lg': '0 0 60px rgba(255,255,255,0.15)',
        'glow-xl': '0 0 100px rgba(255,255,255,0.2)',
        'inner-glow': 'inset 0 0 20px rgba(255,255,255,0.05)',
        'premium': '0 4px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        'premium-hover': '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
