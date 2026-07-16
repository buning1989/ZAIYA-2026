/* 自托管字体（替代 Google Fonts，保证国内可正常加载）。
 * 字重与原 fonts.googleapis.com 请求一致；构建时打包进本站产物。
 * 注意：@fontsource/geist-sans 声明的 font-family 为 "Geist Sans"，
 * 因此 tailwind.config.js 与 index.css 的字体栈已同步加入该名称。 */

// Geist Sans — 标题（font-display），400/500/600/700
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";

// Hanken Grotesk — 正文（font-body），400/500/600
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";

// Cormorant Garamond — 首屏「ZÀIYA」衬线品牌字（hero-brand-en），400/500/600
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";

// Barlow Condensed — 手表表盘数字（font-watch），400/500/600
import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
