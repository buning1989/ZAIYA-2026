import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, BookOpen } from "lucide-react";
import MultiFormShowcase from "./MultiFormShowcase";

type Props = {
  onOpenDemo: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ onOpenDemo }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const brandY = useTransform(scrollYProgress, [0, 0.55], [0, -58]);
  const brandScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.9]);
  const brandOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.12]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="container grid gap-14 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-12 md:py-20">
        {/* 左侧：品牌名 + 定位文案 + 按钮 */}
        <div className="max-w-2xl">
          <motion.div style={{ y: brandY, scale: brandScale, opacity: brandOpacity }}>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-[12px] text-ink-soft"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#FC591B]" />
              面向社会功能受损青少年的 AI 健康生活管理助手
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease }}
              className="mt-7 whitespace-nowrap font-brand text-[54px] font-semibold leading-none tracking-normal text-ink sm:text-[72px] md:text-[88px]"
            >
              在呀 <span className="text-ink-faint">ZÀIYA</span>
            </motion.h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease }}
            className="mt-8 max-w-xl font-display text-[34px] font-semibold leading-[1.05] tracking-normal text-ink sm:text-[42px] md:text-[52px]"
          >
            不靠意志力启动，
            <br />
            从一个生活节点开始。
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="mt-8 flex flex-col items-start gap-3 sm:flex-row"
          >
            <button
              onClick={onOpenDemo}
              className="group inline-flex items-center gap-2 rounded-md bg-[#FC591B] px-5 py-3 text-sm font-medium text-canvas"
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

        {/* 右侧：多形态展示（App / Widget / Watch） */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.34, ease }}
          className="mx-auto w-full max-w-[680px]"
        >
          <MultiFormShowcase />
        </motion.div>
      </div>
    </section>
  );
}
