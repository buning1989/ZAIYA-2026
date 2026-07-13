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
        /* Space / 空间 */
        canvas: "#F6F8EF",
        "canvas-soft": "#EEF1E2",
        card: "#FBFCF5",
        "card-soft": "#F1F3E8",
        line: "#D8E0CA",
        "line-soft": "#EEF1E2",
        /* Text / 文字 */
        ink: "#27331F",
        "ink-soft": "#68735C",
        "ink-faint": "#8B947D",
        /* Action / 行动 */
        accent: "#5F745F",
        "accent-soft": "#EEF3ED",
        "accent-pressed": "#536652",
        "accent-disabled": "#D8DDD6",
        "action-primary": "#E6F46B",
        "action-primary-text": "#27331F",
        "action-deep": "#27331F",
        "action-deep-text": "#F8FAEF",
        /* Status / 状态（记录分类色 —— 仅用于数据可视化） */
        "status-mood": "#A7B765",
        "status-sleep": "#88C6CD",
        "status-food": "#F2DDBB",
        "status-medicine": "#D9E98C",
        "status-medication": "#D9E98C",
        "status-meal": "#F2C98F",
        "status-activity": "#B7D8B7",
        "status-social": "#CDBFEA",
        "status-weight": "#CDBFEA",
        /* Praise / 夸夸卡片装饰色例外（仅用于夸夸卡片背景） */
        "praise-card-1": "#F1F3E8",
        "praise-card-2": "#EEF1E2",
        "praise-card-3": "#E6F0F1",
        "praise-card-4": "#FBF6E9",
        "praise-card-5": "#F4F8DD",
        "praise-card-6": "#F2EFF7",
        "praise-card-7": "#F6F8EF",
        "praise-card-8": "#EDF4ED",
        /* Risk / 风险 */
        "risk-low": "#D7C8A3",
        "risk-medium": "#D99C6B",
        "risk-high": "#B9664A",
        "risk-high-bg": "#F7E6DD",
        /* Chart / 图表 */
        "chart-grid": "#D8E0CA",
        "chart-axis": "#9BA58D",
        "chart-line-1": "#A7B765",
        "chart-line-2": "#88C6CD",
        "chart-line-3": "#F2C98F",
        "chart-line-4": "#CDBFEA",
        /* Legacy aliases (remapped to new palette, kept for compatibility) */
        blush: "#A7B765",
        clay: "#B9664A",
        "scene-chat": "#FBFCF5",
        "scene-plaza": "#EEF1E2",
        "scene-calm": "#F1F3E8",
      },
      fontFamily: {
        display: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Hanken Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ['"Songti SC"', '"STSong"', '"Noto Serif CJK SC"', "serif"],
        watch: [
          '"Barlow Condensed"',
          '"Avenir Next Condensed"',
          '"DIN Condensed"',
          '"Arial Narrow"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
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
