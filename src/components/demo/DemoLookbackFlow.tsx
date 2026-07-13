import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import {
  TimeModeTabs,
  TimeRangeSwitcher,
  SceneTabs,
  TrendArea,
  themes,
  scenes,
  tx,
  ease,
  PAGE_BG,
} from "@/components/LookbackPage";
import {
  SLEEP_TREND_14_DAYS,
  MEAL_RECORD_DAYS,
  DATE_RANGE_LABEL,
  formatSleepTime,
  averageSleepMinutes,
  toDailyLookbackData,
} from "./demoLookbackData";

/* —— 第二周 21:00 节点：回头看看 近两周趋势 演示页 ——
 *
 * 核心表达：
 *   小晨第一次不只依靠当下感受判断自己，而是通过连续记录，
 *   从外部看见这两周真实发生的变化。
 *
 * 展示两个事实：
 *   1. 入睡时间整体有所提前，但仍存在波动；
 *   2. 第二周留下饮食记录的天数比第一周增加。
 *
 * UI 对齐：直接复用 LookbackPage 的 TimeModeTabs / TimeRangeSwitcher /
 *   SceneTabs / TrendArea / themes / tx 等正式组件与 token，
 *   Guided Demo 仅以固定近两周数据驱动，不改变正式页面行为。
 *
 * 数据隔离：所有数据为组件内固定 Demo 数据，不写入 localStorage、
 * 不读取真实记录、不影响自由体验模式。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时滚动恢复顶部。
 */

export default function DemoLookbackFlow() {
  const prefersReducedMotion = useReducedMotion();

  /* 转换为 DailyLookbackData[] 供正式 SleepTrend 组件消费 */
  const data = useMemo(() => toDailyLookbackData(SLEEP_TREND_14_DAYS), []);

  /* 周平均值（使用原始分钟数据计算，不改数值） */
  const firstWeekAvg = useMemo(
    () => averageSleepMinutes(SLEEP_TREND_14_DAYS, 0, 6),
    [],
  );
  const secondWeekAvg = useMemo(
    () => averageSleepMinutes(SLEEP_TREND_14_DAYS, 7, 13),
    [],
  );

  const sleepTheme = themes.sleep;
  const mealTheme = themes.meals;

  /* Demo 固定参数 */
  const fixedReferenceDate = new Date("2026-07-13T23:59:59+08:00");
  const fixedWeekStartKey = "2026-06-30";
  const fixedMonthKey = "2026-07";
  const sleepSceneIdx = 1; // scenes[1] = { key: "sleep", label: "入睡" }

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col"
      style={{ backgroundColor: PAGE_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
    >
      {/* === 顶部导航：返回按钮 + 标题（与正式 LookbackPage 一致）=== */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={() => {}}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
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
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 睡眠指标标题 */}
        <div className="pb-2 pt-1">
          <span
            className="font-medium"
            style={{ fontSize: tx.cardTitle, color: sleepTheme.text }}
          >
            入睡时间趋势
          </span>
        </div>

        {/* 趋势图：直接复用正式 TrendArea + SleepTrend */}
        <div className="relative">
          <TrendArea sceneKey="sleep" data={data} />
          {/* 周分界虚线：覆盖在图表区域上 */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: "50%",
              top: "14px" /* TrendArea py-3.5 */,
              height: "80px" /* TrendArea chart height */,
              borderLeft: `1px dashed ${sleepTheme.mark}`,
              opacity: 0.3,
            }}
          />
        </div>

        {/* 周次标记 */}
        <div className="mt-1.5 flex items-center justify-between px-1">
          <span
            style={{
              fontSize: tx.chartAxisLabel,
              color: sleepTheme.text,
              opacity: 0.5,
            }}
          >
            第一周
          </span>
          <span
            style={{
              fontSize: tx.chartAxisLabel,
              color: sleepTheme.text,
              opacity: 0.3,
            }}
          >
            |
          </span>
          <span
            style={{
              fontSize: tx.chartAxisLabel,
              color: sleepTheme.text,
              opacity: 0.5,
            }}
          >
            第二周
          </span>
        </div>

        {/* === 第一周 / 第二周平均值 === */}
        <div className="mt-3 flex gap-3">
          <div className="flex-1 rounded-[20px] border border-line-soft bg-white px-3 py-2.5 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
            <div
              style={{
                fontSize: tx.cardMeta,
                color: sleepTheme.text,
                opacity: 0.5,
              }}
            >
              第一周平均
            </div>
            <div
              className="mt-0.5 font-medium"
              style={{ fontSize: tx.cardTitle, color: sleepTheme.text }}
            >
              {formatSleepTime(firstWeekAvg)}
            </div>
          </div>
          <div className="flex-1 rounded-[20px] border border-line-soft bg-white px-3 py-2.5 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
            <div
              style={{
                fontSize: tx.cardMeta,
                color: sleepTheme.text,
                opacity: 0.5,
              }}
            >
              第二周平均
            </div>
            <div
              className="mt-0.5 font-medium"
              style={{ fontSize: tx.cardTitle, color: sleepTheme.text }}
            >
              {formatSleepTime(secondWeekAvg)}
            </div>
          </div>
        </div>

        {/* === 睡眠摘要文案（弱于核心数据）=== */}
        <p
          className="mt-3 leading-relaxed"
          style={{
            fontSize: tx.listContent,
            color: sleepTheme.text,
            opacity: 0.6,
          }}
        >
          入睡时间整体有所提前，但仍有波动。
        </p>

        {/* === 饮食记录摘要 === */}
        <section className="mt-6">
          <span
            className="font-medium"
            style={{ fontSize: tx.cardTitle, color: mealTheme.text }}
          >
            饮食记录
          </span>

          {/* 数据摘要卡：白底 + 浅描边，视觉权重低于趋势图 */}
          <div className="mt-3 rounded-[20px] border border-line-soft bg-white px-4 py-3.5 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
            <div
              style={{
                fontSize: tx.listContent,
                color: mealTheme.text,
                opacity: 0.6,
              }}
            >
              留下饮食记录的天数
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <div>
                <div
                  style={{
                    fontSize: tx.cardMeta,
                    color: mealTheme.text,
                    opacity: 0.5,
                  }}
                >
                  第一周
                </div>
                <div
                  className="font-medium"
                  style={{ fontSize: tx.cardTitle, color: mealTheme.text }}
                >
                  {MEAL_RECORD_DAYS.firstWeek} 天
                </div>
              </div>
              <span
                style={{
                  fontSize: tx.cardTitle,
                  color: mealTheme.text,
                  opacity: 0.3,
                }}
              >
                →
              </span>
              <div>
                <div
                  style={{
                    fontSize: tx.cardMeta,
                    color: mealTheme.text,
                    opacity: 0.5,
                  }}
                >
                  第二周
                </div>
                <div
                  className="font-medium"
                  style={{ fontSize: tx.cardTitle, color: mealTheme.text }}
                >
                  {MEAL_RECORD_DAYS.secondWeek} 天
                </div>
              </div>
            </div>
            <p
              className="mt-3 leading-relaxed"
              style={{
                fontSize: tx.cardMeta,
                color: mealTheme.text,
                opacity: 0.5,
              }}
            >
              第二周比第一周多留下了{" "}
              {MEAL_RECORD_DAYS.secondWeek - MEAL_RECORD_DAYS.firstWeek} 天记录。
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
