import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ZaizaiVideo from "./ZaizaiVideo";
import AppMainSurface from "./AppMainSurface";
import ZaiyaWakeAnimation from "./ZaiyaWakeAnimation";

const ease = [0.22, 1, 0.36, 1] as const;

type Surface = "app" | "widget" | "watch";
const SURFACES: Surface[] = ["app", "widget", "watch"];
const SURFACE_DURATION = 4200;

/* —— 统一手机外框（轻薄边框） —— */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[40px] border-[7px] border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[33px] bg-white">
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
        <AppMainSurface previewMode zaizaiClassName="h-72 w-72" />
      </PhoneFrame>
    </div>
  );
}

function DesktopIcon({ index }: { index: number }) {
  return (
    <div className="grid h-full w-full place-items-center rounded-[14px] bg-line-soft shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div
        className={`rounded-full bg-line ${
          index % 3 === 0 ? "h-5 w-5" : index % 3 === 1 ? "h-4 w-7" : "h-6 w-6"
        }`}
      />
    </div>
  );
}

function PlaceholderIcons({ count, offset = 0 }: { count: number; offset?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <DesktopIcon key={i + offset} index={i + offset} />
      ))}
    </>
  );
}

function WidgetCard() {
  return (
    <div className="col-start-3 row-start-1 col-span-2 row-span-2 grid place-items-center overflow-hidden rounded-[24px] border border-white/80 bg-white/90 shadow-[0_10px_28px_-18px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <ZaiyaWakeAnimation variant="desktop-widget" />
    </div>
  );
}

/* —— Widget 形态：手机桌面局部裁切（外层固定高 + 内部更高手机 mockup，只露上半） —— */
function WidgetSurface() {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      {/* 外层是真实裁切手机框：黑色边框包住屏幕，底部半屏渐隐 */}
      <div className="relative h-[440px] overflow-hidden rounded-t-[42px] bg-ink p-[7px] pb-0 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.14)]">
        <div className="relative h-full overflow-hidden rounded-t-[33px] bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,252,245,0.9),rgba(255,255,255,1))]" />

          {/* 状态栏 + 动态岛 */}
          <div className="relative z-20 flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-ink-faint">
            <span>9:41</span>
            <div className="absolute left-1/2 top-2.5 h-[25px] w-[88px] -translate-x-1/2 rounded-full bg-ink" />
            <div className="flex items-center gap-1.5">
              {/* 信号条 */}
              <div className="flex items-end gap-[2px]">
                <div className="h-1.5 w-1 rounded-[1px] bg-ink-faint" />
                <div className="h-2 w-1 rounded-[1px] bg-ink-faint" />
                <div className="h-2.5 w-1 rounded-[1px] bg-ink-faint" />
              </div>
              {/* wifi 抽象占位 */}
              <div className="h-2 w-3 rounded-[2px] bg-ink-faint" />
              {/* 电量 */}
              <div className="relative ml-0.5 h-3 w-6 rounded-[3px] border border-ink-faint/45 p-[1.5px]">
                <div className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r bg-ink-faint/45" />
                <div className="h-full w-3/4 rounded-[1px] bg-ink-faint" />
              </div>
            </div>
          </div>

          {/* 桌面占位网格：固定单元尺寸，widget 严格占据 2x2 */}
          <div className="relative z-10 mt-8 grid grid-cols-[repeat(4,68px)] grid-flow-dense auto-rows-[68px] justify-center gap-[13px] px-6">
            <PlaceholderIcons count={2} />
            <WidgetCard />
            <PlaceholderIcons count={10} offset={2} />
          </div>

          {/* 底部渐隐：融入屏幕色，自然收住，不露完整底部 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/65 to-transparent" />
        </div>
      </div>
    </div>
  );
}

/* —— Watch 形态：智能手表表盘（薄壳、大圆角、轻微竖向、单表冠） —— */
function WatchSurface() {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative">
        {/* 表壳：轻薄边框，接近方形的轻微竖向比例 */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[38px] border-[6px] border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.22)]">
          {/* 表盘屏幕 */}
          <div className="relative h-full overflow-hidden rounded-[32px] bg-white">
            {/* 时间 */}
            <div className="absolute left-0 right-0 top-5 text-center text-[13px] font-semibold tracking-wide text-ink-soft">
              20:00
            </div>
            {/* 在在居中偏下，放大 */}
            <div className="absolute inset-0 grid place-items-center pt-6">
              <ZaiyaWakeAnimation variant="watch" />
            </div>
          </div>
        </div>
        {/* 单表冠：右侧细小突起 */}
        <div className="absolute -right-[7px] top-[38%] h-9 w-[5px] rounded-r-full bg-ink/85 shadow-sm" />
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
