import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette - minimalist professional
        slate: {
          50: 'hsl(210, 40%, 98%)',
          100: 'hsl(210, 40%, 96%)',
          200: 'hsl(210, 13%, 91%)',
          300: 'hsl(210, 11%, 85%)',
          400: 'hsl(210, 10%, 66%)',
          500: 'hsl(210, 10%, 52%)',
          600: 'hsl(210, 12%, 43%)',
          700: 'hsl(210, 13%, 33%)',
          800: 'hsl(210, 14%, 20%)',
          900: 'hsl(210, 15%, 13%)',
          950: 'hsl(210, 20%, 3%)',
        },
        // Accent colors
        accent: {
          light: 'hsl(199, 89%, 48%)',
          DEFAULT: 'hsl(199, 89%, 48%)',
          dark: 'hsl(199, 100%, 35%)',
        },
        // Semantic colors
        success: 'hsl(142, 71%, 45%)',
        warning: 'hsl(38, 92%, 50%)',
        error: 'hsl(0, 84%, 60%)',
        info: 'hsl(199, 89%, 48%)',
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.900'),
            a: {
              color: theme('colors.accent.DEFAULT'),
              '&:hover': {
                color: theme('colors.accent.dark'),
              },
            },
          },
        },
      }),
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  darkMode: ['class', '[data-theme="dark"]'],
  plugins: [],
}
export default config
