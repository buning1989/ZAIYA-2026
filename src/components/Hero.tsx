import { motion } from "framer-motion";
import { useState } from "react";
import { Play, BookOpen } from "lucide-react";
import ZaizaiRive from "./ZaizaiRive";

type Props = {
  onOpenDemo: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

const idleButtons = ["早上起不来", "吃饭没胃口", "记录一下"];

export default function Hero({ onOpenDemo }: Props) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="container grid gap-14 py-20 md:grid-cols-2 md:py-28 md:gap-10 md:items-center">
        {/* 左侧：定位文案 + 按钮 */}
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-[12px] text-ink-soft"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            面向社会功能受损青少年的 AI 健康生活管理助手
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease }}
            className="mt-7 text-[40px] leading-[1.06] tracking-tightest text-ink sm:text-[52px] md:text-[60px]"
          >
            不靠意志力启动，
            <br />
            从一个生活节点开始。
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft"
          >
            在呀 ZÀIYA 通过虚拟形象「在在」出现在早起、吃饭、睡前、情绪波动和复诊前等关键时刻，帮助社会功能受损的青少年把日常状态记录下来，并逐步恢复更稳定的生活节奏。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="mt-9 flex flex-col items-start gap-3 sm:flex-row"
          >
            <button
              onClick={onOpenDemo}
              className="group inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              <Play className="h-4 w-4 fill-canvas" />
              开始体验 Demo
            </button>
            <a
              href="#problem"
              className="group inline-flex items-center gap-2 rounded-md border border-line bg-canvas px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-line-soft"
            >
              <BookOpen className="h-4 w-4 text-ink-faint" />
              查看产品逻辑
            </a>
          </motion.div>
        </div>

        {/* 右侧：demo 主页闲置态预览 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="mx-auto w-full max-w-[300px]"
        >
          <DemoIdlePreview active={active} setActive={setActive} />
        </motion.div>
      </div>
    </section>
  );
}

/** Hero 右侧的 demo 闲置态：手机框 + 在在 Rive + 三个生活节点按钮（浅层反馈） */
function DemoIdlePreview({
  active,
  setActive,
}: {
  active: number | null;
  setActive: (n: number | null) => void;
}) {
  return (
    <div className="rounded-[36px] border border-line bg-canvas p-3 shadow-[0_2px_24px_-8px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] bg-line-soft">
        {/* 顶部两个图标占位 */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 py-4">
          <span className="h-6 w-6 rounded-full border border-line bg-canvas" />
          <span className="h-6 w-6 rounded-full border border-line bg-canvas" />
        </div>

        {/* 在在动画 */}
        <div className="absolute inset-0 grid place-items-center">
          <ZaizaiRive className="h-28 w-28" />
        </div>

        {/* 底部三按钮 */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-5">
          {idleButtons.map((label, i) => (
            <button
              key={label}
              onPointerDown={() => setActive(i)}
              onPointerUp={() => setActive(null)}
              onPointerLeave={() => setActive(null)}
              className={`w-full rounded-lg border px-4 py-3 text-[13px] font-medium transition-colors ${
                active === i
                  ? "border-ink bg-ink text-canvas"
                  : "border-line bg-canvas text-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
