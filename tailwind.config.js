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
        canvas: "#FAFAF9",
        ink: "#18181B",
        "ink-soft": "#71717A",
        "ink-faint": "#A1A1AA",
        line: "#E4E4E7",
        "line-soft": "#EDEDEE",
        accent: "#E07A5F",
        "accent-soft": "#F4D9CD",
      },
      fontFamily: {
        display: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Hanken Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
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
