/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme colors using CSS custom properties
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        'border-default': 'var(--color-border)',
        'border-accent': 'var(--color-border-accent)',
        // Status colors
        success: 'var(--color-success)',
        'success-bg': 'var(--color-success-bg)',
        'success-border': 'var(--color-success-border)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        'warning-border': 'var(--color-warning-border)',
        error: 'var(--color-error)',
        'error-bg': 'var(--color-error-bg)',
        'error-border': 'var(--color-error-border)',
        info: 'var(--color-info)',
        'info-bg': 'var(--color-info-bg)',
        'info-border': 'var(--color-info-border)',
        // Keep default purple for backwards compatibility
        purple: {
          100: '#FBE9FB',
          300: '#D8B4FE',
          700: '#7C3AED',
          800: '#5B21B6',
          900: '#4C1D95'
        }
      },
      backgroundColor: {
        page: 'var(--color-background)',
      },
      textColor: {
        base: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        light: 'var(--color-text-light)',
      },
      borderColor: {
        default: 'var(--color-border)',
        accent: 'var(--color-border-accent)',
      }
    },
  },
  plugins: [],
}
