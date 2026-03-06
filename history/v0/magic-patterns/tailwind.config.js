
export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'eqx-base': 'var(--eqx-base)',
        'eqx-surface': 'var(--eqx-surface)',
        'eqx-raised': 'var(--eqx-raised)',
        'eqx-primary': 'var(--eqx-primary)',
        'eqx-secondary': 'var(--eqx-secondary)',
        'eqx-tertiary': 'var(--eqx-tertiary)',
        'eqx-hairline': 'var(--eqx-hairline)',
        'eqx-mint': '#84EFB6',
        'eqx-coral': '#ED6A67',
        'eqx-orange': '#FE9E6D',
        'eqx-periwinkle': '#7F8DE0',
        'eqx-cyan': '#44C2DD',
      },
      fontFamily: {
        sans: [
          'DM Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Helvetica Neue',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
}
