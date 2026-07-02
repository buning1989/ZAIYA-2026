import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ZaizaiRive, { ZAIZAI_WAVE_ANIMATIONS } from "./ZaizaiRive";
import AppMainSurface from "./AppMainSurface";

const ease = [0.22, 1, 0.36, 1] as const;

type Surface = "app" | "widget" | "watch";
const SURFACES: Surface[] = ["app", "widget", "watch"];
const SURFACE_DURATION = 4200;

/* —— 统一手机外框 —— */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[44px] border-[10px] border-ink bg-ink p-1 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[36px] bg-canvas">
        {children}
      </div>
    </div>
  );
}

/* —— App 形态：完整手机 App 主界面 —— */
function AppSurface() {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <PhoneFrame>
        <AppMainSurface previewMode />
      </PhoneFrame>
    </div>
  );
}

/* —— Widget 形态：手机桌面局部裁切（只露出上半部分，底部渐隐） —— */
function WidgetSurface() {
  return (
    <div className="mx-auto w-full max-w-[340px]">
      {/* 外层：iPhone 局部 mockup，带边框，底部内容渐隐收住 */}
      <div className="relative overflow-hidden rounded-[38px] border-[10px] border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="relative aspect-[9/14] overflow-hidden rounded-[28px] bg-gradient-to-b from-zinc-100 via-stone-50 to-zinc-100">
          {/* 状态栏 + 动态岛 */}
          <div className="relative z-20 flex items-center justify-between px-7 pt-3.5 pb-1 text-[11px] font-semibold text-ink">
            <span>9:41</span>
            <div className="absolute left-1/2 top-2.5 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-ink" />
            <div className="flex items-center gap-1.5">
              {/* 信号条 */}
              <div className="flex items-end gap-[2px]">
                <div className="h-1.5 w-1 rounded-[1px] bg-ink" />
                <div className="h-2 w-1 rounded-[1px] bg-ink" />
                <div className="h-2.5 w-1 rounded-[1px] bg-ink" />
              </div>
              {/* wifi 抽象占位 */}
              <div className="h-2 w-3 rounded-[2px] bg-ink/80" />
              {/* 电量 */}
              <div className="relative ml-0.5 h-3 w-6 rounded-[3px] border border-ink/50 p-[1.5px]">
                <div className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r bg-ink/50" />
                <div className="h-full w-3/4 rounded-[1px] bg-ink" />
              </div>
            </div>
          </div>

          {/* 桌面图标网格：置灰占位 + 在呀小组件位于右上角 2×2 */}
          <div className="relative z-10 mt-3 grid grid-cols-4 grid-flow-dense gap-x-4 gap-y-4 px-6">
            {/* 第 1 行：左侧两枚灰图标，右上角留给在呀小组件 */}
            {[0, 1].map((i) => (
              <div
                key={`r1-${i}`}
                className="aspect-square rounded-[13px] bg-zinc-300/45 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              />
            ))}
            {/* 在呀小组件：右上角 2×2，占据真实桌面网格区域 */}
            <div className="col-start-3 row-start-1 col-span-2 row-span-2 flex items-center justify-center rounded-[22px] border border-white/70 bg-white/90 shadow-[0_6px_24px_-8px_rgba(252,89,27,0.22)] backdrop-blur-md">
              <ZaizaiRive className="h-24 w-24" animations={ZAIZAI_WAVE_ANIMATIONS} />
            </div>
            {/* 第 2 行：左侧两枚灰图标（右侧被小组件占据） */}
            {[0, 1].map((i) => (
              <div
                key={`r2-${i}`}
                className="aspect-square rounded-[13px] bg-zinc-300/45 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              />
            ))}
            {/* 第 3 行 */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={`r3-${i}`}
                className="aspect-square rounded-[13px] bg-zinc-300/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              />
            ))}
            {/* 第 4 行（进入渐隐区，更弱） */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={`r4-${i}`}
                className="aspect-square rounded-[13px] bg-zinc-300/25"
              />
            ))}
          </div>

          {/* 底部渐隐 mask：自然收住，不显示完整 Dock / 底部 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-stone-50 via-stone-50/85 to-transparent" />
        </div>
      </div>
    </div>
  );
}

/* —— Watch 形态：放大的智能手表 mockup —— */
function WatchSurface() {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative">
        {/* 手表主体 */}
        <div className="relative rounded-[44px] border-[10px] border-ink bg-ink p-1 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.22)]">
          <div className="relative aspect-square overflow-hidden rounded-[34px] bg-canvas">
            {/* 屏幕顶部时间 */}
            <div className="absolute left-0 right-0 top-0 flex justify-center py-5 text-[15px] font-medium tracking-wide text-ink-soft">
              20:00
            </div>
            {/* 屏幕中央在在 */}
            <div className="absolute inset-0 grid place-items-center">
              <ZaizaiRive className="h-32 w-32" animations={ZAIZAI_WAVE_ANIMATIONS} />
            </div>
          </div>
        </div>
        {/* 表冠 + 侧边按钮 */}
        <div className="absolute -right-[10px] top-1/3 h-6 w-[6px] -translate-y-1/2 rounded-r bg-ink shadow-sm" />
        <div className="absolute -right-[10px] top-2/3 h-4 w-[6px] -translate-y-1/2 rounded-r bg-ink shadow-sm" />
      </div>
    </div>
  );
}

export default function MultiFormShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SURFACES.length);
    }, SURFACE_DURATION);
    return () => clearInterval(t);
  }, [paused]);

  const surface = SURFACES[index];

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 固定外层舞台：保证三个状态切换时尺寸稳定 */}
      <div className="grid h-[560px] w-full place-items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={surface}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease }}
            className="w-full"
          >
            {surface === "app" && <AppSurface />}
            {surface === "widget" && <WidgetSurface />}
            {surface === "watch" && <WatchSurface />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 指示点：极轻 */}
      <div className="mt-2 flex gap-1.5">
        {SURFACES.map((s, i) => (
          <button
            key={s}
            onClick={() => setIndex(i)}
            aria-label={`形态 ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-ink" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
