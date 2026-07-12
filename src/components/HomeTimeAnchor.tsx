import { motion } from "framer-motion";
import {
  softRevealContainerVariants,
  softRevealItemVariants,
} from "@/lib/motionVariants";
import { getHomeTimeLabel } from "@/lib/homeTimePhase";

/* —— 首页时间锚点：放在在在动画上方的生活节律信息 ——
 * 两行层级（均黑色系，靠字号/字重/透明度区分，不用灰绿色）：
 *   主信息：时段 + 当前时间，例如「晚上 22:46」——20px medium rgba(0,0,0,0.86)
 *   次信息：日期 · 周几，例如「7月10日 · 周五」——12px regular rgba(0,0,0,0.52)
 *
 * 带时段词以区别于手机状态栏的裸时间。
 * 进入首页时依次浮现（时间 → 日期，复用全局 softReveal 动效语言），
 * 离开首页时轻上移淡出。
 *
 * 由父级 AnimatePresence 控制挂载/卸载：每次回到 home 重新挂载 → 重新交错入场。
 */

const WEEKDAY_CHARS = ["日", "一", "二", "三", "四", "五", "六"];

function formatHHMM(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function HomeTimeAnchor({ now }: { now: Date }) {
  const timeLabel = getHomeTimeLabel(now);
  const hhmm = formatHHMM(now);
  const dateWeekday = `${now.getMonth() + 1}月${now.getDate()}日 · 周${WEEKDAY_CHARS[now.getDay()]}`;

  return (
    <motion.div
      variants={softRevealContainerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="pointer-events-none absolute inset-x-0 top-[20%] z-10 flex flex-col items-center px-8 text-center"
    >
      <motion.div
        variants={softRevealItemVariants}
        className="text-[20px] font-medium leading-[28px] tracking-tight"
        style={{ color: "rgba(0, 0, 0, 0.86)" }}
      >
        {timeLabel} {hhmm}
      </motion.div>
      <motion.div
        variants={softRevealItemVariants}
        className="mt-1.5 text-[12px] font-normal leading-[18px] tracking-wide"
        style={{ color: "rgba(0, 0, 0, 0.52)" }}
      >
        {dateWeekday}
      </motion.div>
    </motion.div>
  );
}
