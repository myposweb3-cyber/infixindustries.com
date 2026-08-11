module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          soft: '#2563eb',
          crystal: '#38bdf8'
        }
      },
      boxShadow: {
        glow: '0 20px 80px rgba(59,130,246,0.18)',
        soft: '0 14px 40px rgba(15,23,42,0.12)'
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 36%), radial-gradient(circle at bottom right, rgba(14,165,233,0.22), transparent 28%)'
      }
    }
  },
  plugins: []
}
