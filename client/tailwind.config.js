/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gov: {
          navy:    '#0f294a', // Trustworthy deep navy used by government portals
          blue:    '#1a5fb4', // Interactive royal blue
          saffron: '#f37021', // National Saffron accent
          green:   '#0d7a3c', // National Green accent
          ash:     '#f8fafc', // Soft light background gray
          border:  '#e2e8f0', // Crisp, clean border slate
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'gov-card':  '0 2px 8px rgba(15, 41, 74, 0.05), 0 1px 3px rgba(15, 41, 74, 0.03)',
        'gov-hover': '0 12px 24px rgba(15, 41, 74, 0.08), 0 4px 8px rgba(15, 41, 74, 0.04)',
        'gov-nav':   '0 4px 20px rgba(15, 41, 74, 0.06)',
        'gov-modal': '0 24px 48px rgba(15, 41, 74, 0.16)',
      },
    },
  },
  plugins: [],
};
