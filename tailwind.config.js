/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--adm-color-primary)',
        secondary: 'var(--adm-color-secondary)',
        tertiary: 'var(--adm-color-tertiary)',
        quaternary: 'var(--adm-color-quaternary)',
        black1: '#555767',
        black2: '#2B2D41',
        gray1: '#575757',
        gray2: '#F5F5F5',
        gray3: '#737373',

        bgPrimary: 'var(--adm-background-primary)',
      },
      borderRadius: {
        '4xl': '1.75rem' /* 24px */,
      },
      borderWidth: {
        1: '1px',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [require('tailwindcss-safe-area')],
}
