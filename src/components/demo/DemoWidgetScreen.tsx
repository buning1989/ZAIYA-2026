/* —— 手机桌面小组件场景 ——
 * 第一天 06:40 起床失败的手机画面。
 * 不显示在呀 App 内部，而是模拟手机桌面 + 桌面小组件。
 *
 * 设计要点：
 * - 顶部系统状态栏（时间 + iOS 信号/wifi/电池）
 * - 少量弱化的普通 App 图标营造桌面环境
 * - 视觉中心放置在呀桌面小组件
 * - 小组件内显示在在拉开窗帘后的静态画面 + 文案
 * - 不显示 App 的侧边菜单和底部导航
 * - 不使用循环播放的 WebM 视频，采用静态关键帧（GIF 自然播放但尺寸小、动效微弱）
 * - 「在在」名称标识仅在 showLabel=true 时显示，指向角色形象
 */

type Props = {
  time: string;
  showLabel?: boolean;
};

/** 弱化的普通 App 图标（纯色圆角方块，不使用真实图标） */
const APP_ICONS = [
  { color: "#34C759", label: "" },
  { color: "#007AFF", label: "" },
  { color: "#FF9500", label: "" },
  { color: "#5856D6", label: "" },
  { color: "#FF3B30", label: "" },
  { color: "#AF52DE", label: "" },
  { color: "#5AC8FA", label: "" },
  { color: "#FFCC00", label: "" },
];

export default function DemoWidgetScreen({ time, showLabel }: Props) {
  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0b] text-white">
      {/* —— 系统状态栏 —— */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-[13px] font-semibold tracking-tight">{time}</span>
        <div className="flex items-center gap-1.5 opacity-90">
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

      {/* —— App 图标网格（弱化） —— */}
      <div className="grid grid-cols-4 gap-x-5 gap-y-4 px-6 pt-3 opacity-50">
        {APP_ICONS.map((icon, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-[22%]"
            style={{ backgroundColor: icon.color }}
          />
        ))}
      </div>

      {/* —— 在呀桌面小组件 —— */}
      <div className="mx-4 mt-4">
        <div className="relative rounded-3xl bg-white/95 p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          {/* 小组件内容：在在形象 + 文案 */}
          <div className="flex items-center gap-3">
            {/* 在在拉开窗帘的静态画面 */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#f5f5f0]">
              <img
                src="/assets/zaiya/wake-up.gif"
                alt="在在拉开窗帘"
                className="absolute left-1/2 top-1/2 h-[180%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
                style={{ transform: "translate(-50%, -50%) scale(1.1)" }}
                draggable={false}
              />
            </div>

            {/* 文案 */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-tight text-ink">
                你好，我是在在。
              </p>
              <p className="mt-1 text-[11px] leading-[1.5] text-ink-soft">
                我只把窗帘拉开了一条小缝，光就自己挤进来了。
              </p>
            </div>
          </div>

          {/* 「在在」名称标识：短引导线 + 标签，指向角色形象 */}
          {showLabel && (
            <div className="pointer-events-none absolute -right-1 top-2 flex items-center gap-0.5">
              <span className="rounded-md border border-black/10 bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-ink-soft shadow-sm">
                在在
              </span>
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                <path d="M0 4 L12 4" stroke="rgba(0,0,0,0.38)" strokeWidth="1" />
                <path d="M10 1 L15 4 L10 7 Z" fill="rgba(0,0,0,0.38)" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* —— 底部 Dock（弱化） —— */}
      <div className="mt-auto px-4 pb-3">
        <div className="flex items-center justify-center gap-5 rounded-3xl bg-white/10 px-5 py-3 backdrop-blur-xl">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 w-12 rounded-[22%] bg-white/20"
              style={{
                backgroundColor: ["#34C759", "#007AFF", "#FF9500", "#5856D6"][i],
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Home Indicator */}
      <div className="flex justify-center pb-1.5">
        <div className="h-1 w-28 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
