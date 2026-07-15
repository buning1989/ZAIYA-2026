import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PhoneStatusBar from "@/components/PhoneStatusBar";
import {
  TimeModeTabs,
  TimeRangeSwitcher,
  SceneTabs,
  TrendArea,
  SleepRow,
  themes,
  scenes,
  tx,
  ease,
  PAGE_BG,
} from "@/components/LookbackPage";
import {
  SLEEP_TREND_14_DAYS,
  DATE_RANGE_LABEL,
  toDailyLookbackData,
} from "./demoLookbackData";

/* —— 第二周 21:00 节点：回头看看 近两周趋势 演示页 ——
 *
 * UI 对齐体验模式「回头看看」页面布局：
 *   导航 → 时间模式 → 时间范围 → 场景标签 → 趋势图 → 每日记录列表
 *
 * 内容保留演示模块所需：
 *   - 趋势图下方保留周分界虚线
 *   - 每日记录列表使用 SleepRow（对齐体验模式行结构）
 *   - 列表下方保留演示专属的睡眠摘要文案和饮食记录摘要
 *
 * 数据隔离：所有数据为组件内固定 Demo 数据，不写入 localStorage、
 * 不读取真实记录、不影响自由体验模式。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时滚动恢复顶部。
 */

export default function DemoLookbackFlow() {
  const prefersReducedMotion = useReducedMotion();

  /* 转换为 DailyLookbackData[] 供正式组件消费 */
  const data = useMemo(() => toDailyLookbackData(SLEEP_TREND_14_DAYS), []);

  const sleepTheme = themes.sleep;

  /* Demo 固定参数 */
  const fixedReferenceDate = new Date("2026-07-13T23:59:59+08:00");
  const fixedWeekStartKey = "2026-06-30";
  const fixedMonthKey = "2026-07";
  const sleepSceneIdx = 1; // scenes[1] = { key: "sleep", label: "入睡" }

  /* 每日列表：降序（最近一天在顶部），与体验模式 ScenePanel 一致 */
  const reversedData = useMemo(() => [...data].reverse(), [data]);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col"
      style={{ backgroundColor: PAGE_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
    >
      {/* iOS 风格状态栏 */}
      <PhoneStatusBar />

      {/* === 顶部导航：返回按钮 + 标题 === */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={() => {}}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          回头看看
        </h2>
      </div>

      {/* === 时间模式切换（固定按周，Demo 不可切换）=== */}
      <div className="px-5 pb-2">
        <TimeModeTabs value="week" onChange={() => {}} />
      </div>

      {/* === 时间范围（固定近两周，箭头禁用）=== */}
      <div className="px-5 pb-2.5">
        <TimeRangeSwitcher
          timeMode="week"
          weekStartKey={fixedWeekStartKey}
          monthKey={fixedMonthKey}
          referenceDate={fixedReferenceDate}
          onPrev={() => {}}
          onNext={() => {}}
          label={DATE_RANGE_LABEL}
          disableNav
        />
      </div>

      {/* === 场景标签栏（固定选中「入睡」，其余不可切换）=== */}
      <SceneTabs
        scenes={scenes}
        activeIdx={sleepSceneIdx}
        onSelect={() => {}}
        theme={sleepTheme}
      />

      {/* === 内容区：可滚动 === */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-1">
        {/* 趋势图：复用正式 TrendArea */}
        <div className="relative">
          <TrendArea sceneKey="sleep" data={data} />
          {/* 周分界虚线：覆盖在图表区域上 */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: "50%",
              top: "14px",
              height: "80px",
              borderLeft: `1px dashed ${sleepTheme.mark}`,
              opacity: 0.3,
            }}
          />
        </div>

        {/* === 每日记录列表：对齐体验模式 ScenePanel 的日列表结构 === */}
        <div className="mt-4 flex flex-col gap-3">
          {/* 月份分组标题 */}
          <div className="mb-1.5 px-1 text-[12px] font-medium text-ink-faint">
            2026年7月
          </div>
          {/* 当月详情卡 */}
          <div className="overflow-hidden rounded-[20px] border border-line-soft bg-white shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
            {reversedData.map((day, idx) => (
              <div
                key={day.date}
                className="flex items-center gap-3 px-4"
                style={{
                  height: 52,
                  borderBottom:
                    idx === reversedData.length - 1
                      ? "none"
                      : "1px solid var(--color-line, #D8E0CA)",
                }}
              >
                {/* 左：日期 + 星期 */}
                <div className="w-12 shrink-0 text-left">
                  <div
                    className="font-medium text-ink"
                    style={{ fontSize: tx.listDate }}
                  >
                    {day.displayDate.replace("月", "/").replace("日", "")}
                  </div>
                  <div className="text-ink-faint" style={{ fontSize: tx.listWeekday }}>
                    {weekday(day.date)}
                  </div>
                </div>
                {/* 中：SleepRow 入睡可视化 */}
                <div className="flex h-full flex-1 items-center">
                  <SleepRow day={day} />
                </div>
                {/* 右：弱箭头 */}
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint/40" />
              </div>
            ))}
          </div>
        </div>


      </div>
    </motion.div>
  );
}

/* —— 工具：YYYY-MM-DD → 星期 —— */
function weekday(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
}
