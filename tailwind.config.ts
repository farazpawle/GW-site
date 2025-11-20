import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact colors extracted from Garrit Wulf website using Chrome DevTools
        brand: {
          // Primary red from top bar and branding - rgb(147, 32, 32)
          red: "#932020",
          // Maroon/burgundy from GW logo - darker reddish brown
          maroon: "#8B1538",
          // Blue from buttons and links - rgb(40, 114, 250) 
          blue: "#2872FA",
          // Navigation blue - rgb(21, 89, 237)
          navBlue: "#1559ED",
          // Coral/pink from category titles - rgb(215, 109, 119)
          coral: "#D76D77",
          // Dark hero section background - rgba(18, 21, 25, 0.98)
          darkHero: "#121519",
          // Body text color - rgb(58, 79, 102)
          bodyText: "#3A4F66",
          // Light text on dark backgrounds - rgba(255, 255, 255, 0.95)
          lightText: "#FFFFFF",
          // Muted text color - rgb(204, 204, 204)
          mutedText: "#CCCCCC",
          // Light gray text - rgb(220, 220, 220)
          grayText: "#DCDCDC",
          // Button text color - rgba(255, 255, 255, 0.7)
          buttonText: "#FFFFFF",
          // Footer/body background - rgb(250, 251, 252)
          lightBg: "#FAFBFC",
        },
        // Custom color palette matching original
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2872FA", // Updated to match exact blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        red: {
          500: "#932020", // Updated to match exact red
          600: "#7f1d1d",
          700: "#6b1f1f",
        },
        coral: {
          500: "#D76D77", // New coral color from original
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        'aclonica': ["Aclonica", "sans-serif"],
        'oswald': ["Oswald", "sans-serif"],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(135deg, #121519 0%, #1e293b 100%)",
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'slide-up': 'slideUp 1s ease-out forwards',
        'slide-in-left': 'slideInLeft 1s ease-out forwards',
        'slide-in-right': 'slideInRight 1s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'count-up': 'countUp 2s ease-out forwards',
        'wave-pulse': 'wave-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(50px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wave-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;