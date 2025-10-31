/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        muted: { DEFAULT: '#f7f7f8', foreground: '#6b7280' },
        primary: '#111827',
      },
      fontSize: {
        balance: ['2rem', { lineHeight: '1.05' }],
      },
    },
  },
  plugins: [],
}
