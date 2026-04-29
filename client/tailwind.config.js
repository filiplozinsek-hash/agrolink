/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        soil: 'var(--soil)',
        bark: 'var(--bark)',
        hay: 'var(--hay)',
        sage: 'var(--sage)',
        moss: 'var(--moss)',
        cream: 'var(--cream)',
        mist: 'var(--mist)',
        'off-white': 'var(--white)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '100px',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
}
