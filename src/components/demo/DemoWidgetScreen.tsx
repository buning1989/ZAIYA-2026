/* —— 手机桌面小组件场景 ——
 * 第一天 06:40 起床失败的手机画面。
 * 不显示在呀 App 内部，而是模拟浅色手机桌面 + 2×2 方形桌面小组件。
 *
 * 设计要点：
 * - 白色手机主屏（只保留极轻过渡）
 * - 4×5 iPhone 主屏布局（普通 App 仅作低噪声占位符）
 * - 2×2 浅绿白在呀小组件（视觉中心偏右）
 * - 小组件内：在在静态关键帧 + 短文案
 * - 不显示 App 的侧边菜单和底部导航
 * - 不使用循环 WebM 视频
 * - 无点击提示、无箭头、无手指素材
 */

import LazyVideo from "@/components/LazyVideo";

type Props = {
  /** 系统时间显示 */
  time?: string;
};

const PLACEHOLDER_COLOR = "#F2F3EF";
const DOCK_PLACEHOLDER_COLOR = "#F5F5F2";

function AppPlaceholder({ color = PLACEHOLDER_COLOR }: { color?: string }) {
  return (
    <div
      className="aspect-square rounded-[22%] border border-white/55 shadow-[0_1px_2px_rgba(39,51,31,0.035)]"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

export default function DemoWidgetScreen({ time = "06:40" }: Props) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* —— 系统状态栏 —— */}
      <div className="flex items-center justify-between px-6 pb-1 pt-3 text-ink">
        <span className="text-[14px] font-semibold tracking-tight">{time}</span>
        <div className="flex items-center gap-1.5">
          {/* 信号 */}
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
            <rect x="0" y="6" width="3" height="4" rx="0.5" />
            <rect x="4" y="4" width="3" height="6" rx="0.5" />
            <rect x="8" y="2" width="3" height="8" rx="0.5" />
            <rect x="12" y="0" width="3" height="10" rx="0.5" />
          </svg>
          {/* WiFi */}
          <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
            <path d="M7 9.5a1 1 0 100-2 1 1 0 000 2zM3.5 6.5a4.95 4.95 0 017 0l-1 1a3.55 3.55 0 00-5 0l-1-1zM1 4a8.49 8.49 0 0112 0l-1 1a7.07 7.07 0 00-10 0L1 4z" />
          </svg>
          {/* 电池 */}
          <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
            <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.4" />
            <rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" />
            <rect x="21.5" y="3.5" width="1.5" height="4" rx="0.75" fill="currentColor" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* —— 4×5 App 占位网格 + 2×2 小组件 —— */}
      <div className="flex flex-1 flex-col px-6 pt-6">
        <div className="grid grid-cols-4 grid-flow-dense gap-[13px]">
          <AppPlaceholder />
          <AppPlaceholder />

          {/* 2×2 在呀小组件 */}
          <div className="col-span-2 row-span-2">
            <WidgetCard />
          </div>

          {Array.from({ length: 14 }, (_, index) => (
            <AppPlaceholder key={index + 2} />
          ))}
        </div>
      </div>

      {/* —— 底部 Dock —— */}
      <div className="px-6 pb-2">
        <div className="grid grid-cols-3 gap-6 rounded-[28px] bg-white/48 px-7 py-3 shadow-[0_10px_28px_-22px_rgba(39,51,31,0.28)] backdrop-blur-xl">
          {Array.from({ length: 3 }, (_, index) => (
            <AppPlaceholder key={index} color={DOCK_PLACEHOLDER_COLOR} />
          ))}
        </div>
      </div>

      {/* Home Indicator */}
      <div className="flex justify-center pb-1.5">
        <div className="h-1 w-28 rounded-full bg-ink/25" />
      </div>
    </div>
  );
}

/* —— 2×2 方形在呀桌面小组件 ——
 * 场景图铺满 + 顶部渐变遮罩 + 左上叠加文案
 * 文案：
 *   窗帘拉开了一点，
 *   光会自己进来
 *
 * 素材为 9:16 透明背景 WebM（由原 GIF 转换，VP9 + yuva420p），
 * 按"组件专用裁切参数"放大定位，让窗帘和在在主体铺满组件有效区域，裁掉透明留白。
 * 性能优化（2026-07-13）：GIF → 透明 WebM，poster 静态首帧先于视频淡入。
 */
function WidgetCard() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/60 bg-[#FBFCF5] shadow-[0_8px_24px_-12px_rgba(39,51,31,0.18)]">
      {/* 在在拉开窗帘的场景图（按主体 bbox 校准，裁掉透明留白） */}
      <LazyVideo
        src="./assets/zaiya/wake-up.webm"
        poster="./assets/zaiya/wake-up-poster.png"
        eager
        layout="natural"
        className="absolute inset-0 h-full w-full"
        mediaClassName="absolute left-[48%] top-[53%] h-[250%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
        mediaStyle={{ transformOrigin: "center center" }}
        alt="在在拉开窗帘"
        fadeDuration={300}
      />

      {/* 顶部渐变遮罩：保证文案可读性 */}
      <div
        className="absolute inset-x-0 top-0 h-3/5"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden="true"
      />

      {/* 产品文案（左上叠加，放大字号） */}
      <div className="absolute left-4 right-4 top-4 z-10">
        <p className="text-[16px] font-semibold leading-[1.3] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          窗帘拉开了一点
          <br />
          光会自己进来
        </p>
      </div>
    </div>
  );
}
