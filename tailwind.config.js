/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1120px",
      },
    },
    extend: {
      colors: {
        canvas: "#FAF7F0",
        ink: "#3A362E",
        "ink-soft": "#7A7263",
        "ink-faint": "#B3AB99",
        line: "#EAE3D6",
        "line-soft": "#F1EBDE",
        accent: "#5F7050",
        "accent-soft": "#E9EDDF",
        card: "#FFFEFA",
        blush: "#F2A98E",
        clay: "#B0563F",
        "scene-chat": "#FCFAF4",
        "scene-plaza": "#F6F0E1",
        "scene-calm": "#EDF2EE",
      },
      fontFamily: {
        display: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Hanken Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ['"Songti SC"', '"STSong"', '"Noto Serif CJK SC"', "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        prose: "640px",
      },
    },
  },
  plugins: [],
};
