/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#fafafa',
        'bg-secondary': '#ffffff',
        'medical-pink': '#f43f5e',
        'medical-rose': '#e11d48',
        'medical-blush': '#fff1f2',
        'medical-teal': '#0d9488',
        'medical-cyan': '#0284c7',
        'accent-primary': '#f43f5e',
        'accent-secondary': '#ec4899',
        'accent-success': '#10b981',
        'accent-danger': '#ef4444',
        'accent-warning': '#f59e0b',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'medical': '0 10px 30px -5px rgba(244, 63, 94, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'medical-hover': '0 20px 40px -10px rgba(244, 63, 94, 0.2), 0 8px 10px -4px rgba(0, 0, 0, 0.04)',
        'clean': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
