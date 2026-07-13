import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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
        <AppMainSurface previewMode />
      </PhoneFrame>
    </div>
  );
}

function DesktopIcon() {
  return (
    <div className="rounded-[14px] bg-line-soft shadow-[0_1px_2px_rgba(0,0,0,0.03)]" />
  );
}

function PlaceholderIcons({ count, offset = 0 }: { count: number; offset?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <DesktopIcon key={i + offset} />
      ))}
    </>
  );
}

function WidgetCard() {
  return (
    <div className="col-start-3 row-start-1 col-span-2 row-span-2 relative overflow-hidden rounded-[24px] border border-white/80 bg-white/92 shadow-[0_10px_28px_-18px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <div className="absolute left-3.5 top-3 z-20 font-display text-[16px] font-semibold leading-[1.16] tracking-normal text-ink">
        <div>珍视每一次</div>
        <div>小胜，</div>
        <div>积攒勇气</div>
      </div>
      <div className="absolute bottom-3 left-3 z-20 grid h-7 w-7 place-items-center rounded-full bg-line-soft text-ink shadow-[0_3px_10px_-7px_rgba(39,51,31,0.38)]">
        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="absolute bottom-1.5 right-1.5 z-10">
        <ZaiyaWakeAnimation variant="desktop-widget" />
      </div>
    </div>
  );
}

/* —— Widget 形态：手机桌面局部裁切，展示小组件在屏幕中的位置 —— */
function WidgetSurface() {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative h-[440px] overflow-hidden rounded-t-[42px] bg-ink p-[7px] pb-0 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.14)]">
        <div className="relative h-full overflow-hidden rounded-t-[33px] bg-white">
          <div className="absolute inset-0 bg-white" />

          <div className="relative z-20 flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-ink-faint">
            <span>9:41</span>
            <div className="absolute left-1/2 top-2.5 h-[25px] w-[88px] -translate-x-1/2 rounded-full bg-ink" />
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-[2px]">
                <div className="h-1.5 w-1 rounded-[1px] bg-ink-faint" />
                <div className="h-2 w-1 rounded-[1px] bg-ink-faint" />
                <div className="h-2.5 w-1 rounded-[1px] bg-ink-faint" />
              </div>
              <div className="h-2 w-3 rounded-[2px] bg-ink-faint" />
              <div className="relative ml-0.5 h-3 w-6 rounded-[3px] border border-ink-faint/45 p-[1.5px]">
                <div className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r bg-ink-faint/45" />
                <div className="h-full w-3/4 rounded-[1px] bg-ink-faint" />
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-[repeat(4,68px)] grid-flow-dense auto-rows-[68px] justify-center gap-[13px] px-6">
            <PlaceholderIcons count={2} />
            <WidgetCard />
            <PlaceholderIcons count={10} offset={2} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/65 to-transparent" />
        </div>
      </div>
    </div>
  );
}

/* —— Watch 形态：智能手表表盘（薄壳、大圆角、轻微竖向、单表冠） —— */
function WatchSurface() {
  return (
    <div className="mx-auto w-full max-w-[310px]">
      <div className="relative">
        {/* 表壳：轻薄边框，内部接近参考图的圆角方形表盘 */}
        <div className="relative aspect-square overflow-hidden rounded-[42px] border-[6px] border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.22)]">
          {/* 表盘屏幕 */}
          <div className="relative h-full overflow-hidden rounded-[36px] bg-white">
            {/* 时间作为表盘主信息，和在在形成轻微叠压关系 */}
            <div className="absolute left-0 right-0 top-7 z-20 text-center font-watch text-[78px] font-medium leading-none tracking-normal text-ink sm:text-[84px]">
              20:48
            </div>
            {/* 在在按 GIF 主体视觉中心定位，不按透明画布居中 */}
            <div className="absolute left-1/2 top-[66%] z-10 -translate-x-1/2 -translate-y-1/2">
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
