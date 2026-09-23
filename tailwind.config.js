/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAFA",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F4F4F5",
          muted: "#E4E4E7",
        },
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#EEF2FF",
          container: "#4F46E5",
          fixed: "#E0E7FF"
        },
        secondary: {
          DEFAULT: "#6366F1",
          light: "#F5F3FF"
        },
        emerald: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
          dark: "#047857"
        },
        content: {
          primary: "#09090B",
          secondary: "#27272A",
          muted: "#71717A",
          subtle: "#A1A1AA"
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.02), 0 8px 24px rgba(9, 9, 11, 0.03)',
        'lifted': '0 4px 6px rgba(0, 0, 0, 0.02), 0 16px 32px rgba(79, 70, 229, 0.06)',
        'modal': '0 20px 48px rgba(9, 9, 11, 0.12)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    },
  },
  plugins: [],
}
