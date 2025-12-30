/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'argus': {
          'primary': '#0a1628',
          'secondary': '#1a2942',
          'accent': '#00d4aa',
          'warning': '#ff6b35',
          'danger': '#ff3366',
          'info': '#3b82f6',
          'surface': '#0f1d32',
          'border': '#2a3f5f',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'display': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

