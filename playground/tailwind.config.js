/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#fbfaf7',
        ink: {
          900: '#181715',
          800: '#2c2925',
          700: '#433e38',
          500: '#756f66',
          400: '#a39c92',
          300: '#c8c2b7',
          200: '#e5e1d8',
          100: '#f0ece3',
          50: '#f7f5f0'
        },
        sage: {
          50: '#f2f7f4',
          100: '#e5f0e9',
          200: '#cce1d4',
          300: '#a8ceb6',
          700: '#2d634d',
          800: '#234e3d',
          900: '#173629'
        },
        peach: {
          50: '#fef5f0',
          100: '#fdebe2',
          200: '#fad7c5',
          300: '#f5b597',
          700: '#b84928',
          800: '#94371c',
          900: '#682411'
        },
        amber: {
          50: '#fefcf3',
          100: '#fdf7e7',
          200: '#f9eccf',
          300: '#f2dba6',
          700: '#8c6512',
          800: '#6f500d',
          900: '#4d3708'
        },
        coral: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337'
        },
        pastel: {
          lavender: {
            DEFAULT: '#EEF0FD',
            text: '#4D3DB5',
            border: '#DCDCF8',
            hover: '#E5E8FC',
            light: '#F8F9FE'
          },
          mint: {
            DEFAULT: '#EAF7F0',
            text: '#1C7352',
            border: '#D0EFE0',
            hover: '#E0F3E8',
            light: '#F4FBF7'
          },
          peach: {
            DEFAULT: '#FFF1E8',
            text: '#A04818',
            border: '#FDE2D2',
            hover: '#FEE8DC',
            light: '#FFF8F4'
          },
          sky: {
            DEFAULT: '#EBF5FF',
            text: '#1E65A8',
            border: '#D5E9FC',
            hover: '#DFEEFD',
            light: '#F5FAFF'
          },
          rose: {
            DEFAULT: '#FDEFF3',
            text: '#A3294C',
            border: '#FBDCE4',
            hover: '#FCE4EB',
            light: '#FFF5F8'
          },
          butter: {
            DEFAULT: '#FEF9E7',
            text: '#8C6314',
            border: '#FDF1C8',
            hover: '#FDF4D4',
            light: '#FFFDF5'
          },
          lilac: {
            DEFAULT: '#F5EFFE',
            text: '#7638B0',
            border: '#EADBFB',
            hover: '#EFE3FC',
            light: '#FAF6FF'
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(24, 23, 21, 0.04)',
        'soft-md': '0 4px 6px -1px rgba(24, 23, 21, 0.05), 0 2px 4px -2px rgba(24, 23, 21, 0.03)',
        'soft-lg': '0 10px 15px -3px rgba(24, 23, 21, 0.06), 0 4px 6px -4px rgba(24, 23, 21, 0.03)',
        'elevated': '0 20px 25px -5px rgba(24, 23, 21, 0.08), 0 8px 10px -6px rgba(24, 23, 21, 0.04)'
      }
    },
  },
  plugins: [],
}
