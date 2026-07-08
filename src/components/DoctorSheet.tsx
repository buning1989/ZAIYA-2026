import { useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  computeRangeStats,
  type FreeTextMode,
  type OrganizeRange,
} from "@/data/organize";
import { lookbackData, type DailyLookbackData } from "@/data/lookback";

/* 医生版整理单：静态、清晰、可截图打印的近期记录摘要。
 * 按维度整合：趋势图、关键数字、摘要、相关文字均放回对应模块。
 * 不输出诊断/治疗/用药建议；所有内容来自用户日常记录。 */

interface DoctorSheetProps {
  range: OrganizeRange;
  hiddenSections: Record<string, boolean>;
  onToggleHide: (id: string) => void;
  freeTextMode: FreeTextMode;
  onFreeTextModeChange: (m: FreeTextMode) => void;
}

export default function DoctorSheet({
  range,
  hiddenSections,
  onToggleHide,
  freeTextMode,
  onFreeTextModeChange,
}: DoctorSheetProps) {
  const data = lookbackData[range];
  const stats = useMemo(() => computeRangeStats(range), [range]);

  // —— 额外统计：平均睡眠时长、三餐完整天数、服用确认率 ——
  const extra = useMemo(() => {
    const sleepMins = data
      .filter((d) => d.sleepDurationMin != null)
      .map((d) => d.sleepDurationMin as number);
    const avgSleepHours =
      sleepMins.length > 0
        ? sleepMins.reduce((a, b) => a + b, 0) / sleepMins.length / 60
        : null;
    const fullMealDays = data.filter(
      (d) =>
        d.meals.breakfast === "yes" &&
        d.meals.lunch === "yes" &&
        d.meals.dinner === "yes",
    ).length;
    const moodRecordDays = data.filter((d) => d.mood != null).length;
    const sleepRecordDays = data.filter((d) => d.sleepTime != null).length;
    const medRecordDays = range - stats.medication.noRecordDays;
    const dietRecordDays = range - stats.diet.noRecordDays;
    const confirmRate =
      medRecordDays > 0
        ? Math.round((stats.medication.takenDays / range) * 100)
        : null;
    const lowMoodDays = data.filter((d) => d.mood != null && d.mood <= 2);
    const lowMoodPeriod =
      lowMoodDays.length > 0
        ? lowMoodDays.length === 1
          ? lowMoodDays[0].displayDate
          : `${lowMoodDays[0].displayDate} 至 ${lowMoodDays[lowMoodDays.length - 1].displayDate}`
        : null;
    const partialMealDays = Math.max(0, dietRecordDays - fullMealDays);
    const weightValues = stats.weight.values.map((v) => v.weight);
    return {
      avgSleepHours,
      fullMealDays,
      moodRecordDays,
      sleepRecordDays,
      medRecordDays,
      dietRecordDays,
      confirmRate,
      lowMoodPeriod,
      partialMealDays,
      weightMin: weightValues.length ? Math.min(...weightValues) : null,
      weightMax: weightValues.length ? Math.max(...weightValues) : null,
    };
  }, [data, range, stats]);

  // —— 用户文字按维度归类 ——
  const { moodTexts, otherTexts } = useMemo(() => {
    const mood: { displayDate: string; text: string }[] = [];
    const other: { displayDate: string; text: string }[] = [];
    stats.freeText.items.forEach((it) => {
      if (it.kind === "mood") {
        mood.push({ displayDate: it.displayDate, text: it.text });
      } else {
        other.push({ displayDate: it.displayDate, text: it.text });
      }
    });
    return { moodTexts: mood, otherTexts: other };
  }, [stats]);

  const today = new Date();
  const todayLabel = `${today.getMonth() + 1}月${today.getDate()}日`;
  const isHidden = (id: string) => !!hiddenSections[id];
  const userTextHidden = freeTextMode === "hidden" || isHidden("userText");

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
      {/* —— 顶部概况 —— */}
      <div className="mt-2 rounded-2xl border border-line bg-white px-4 py-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          近期记录整理单
        </div>
        <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-ink">
          给医生 / 专业人士看
        </h3>
        <div className="mt-3 flex flex-col gap-1 text-[12px] text-ink-soft">
          <div className="flex gap-2">
            <span className="text-ink-faint">记录范围</span>
            <span>最近 {range} 天</span>
          </div>
          <div className="flex gap-2">
            <span className="text-ink-faint">生成时间</span>
            <span>{todayLabel}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-ink-faint">记录天数</span>
            <span>{stats.recordedDays} / {range} 天</span>
          </div>
          <div className="flex gap-2">
            <span className="text-ink-faint">记录来源</span>
            <span>用户日常记录</span>
          </div>
        </div>
        <p className="mt-3 border-t border-line/60 pt-2 text-[11px] leading-relaxed text-ink-faint">
          本整理单仅基于用户记录生成，不包含诊断或治疗建议。
        </p>
      </div>

      {/* —— 关键指标 —— */}
      <SectionBlock
        title="关键指标"
        hidden={isHidden("metrics")}
        onToggle={() => onToggleHide("metrics")}
      >
        <div className="grid grid-cols-3 gap-2">
          <MetricItem
            label="情绪低分天数"
            value={
              extra.moodRecordDays > 0
                ? `${stats.mood.lowDays} 天`
                : "记录不足"
            }
          />
          <MetricItem
            label="平均睡眠时长"
            value={
              extra.avgSleepHours != null
                ? `${extra.avgSleepHours.toFixed(1)} 小时`
                : "记录不足"
            }
          />
          <MetricItem
            label="晚睡天数"
            value={
              extra.sleepRecordDays > 0
                ? `${stats.sleep.lateDays} 天`
                : "记录不足"
            }
          />
          <MetricItem
            label="服用确认率"
            value={
              extra.confirmRate != null ? `${extra.confirmRate}%` : "记录不足"
            }
          />
          <MetricItem
            label="三餐完整记录"
            value={
              extra.dietRecordDays > 0
                ? `${extra.fullMealDays} 天`
                : "记录不足"
            }
          />
          <MetricItem
            label="身体感受记录"
            value={
              stats.bodyFeeling.mentionedDays > 0
                ? `${stats.bodyFeeling.mentionedDays} 次`
                : "记录不足"
            }
          />
        </div>
      </SectionBlock>

      {/* —— 情绪模块（趋势图 + 关键数字 + 标签 + 摘要 + 相关文字） —— */}
      <SectionBlock
        title="情绪记录"
        hidden={isHidden("mood")}
        onToggle={() => onToggleHide("mood")}
      >
        {extra.moodRecordDays > 0 ? (
          <TrendCard label="情绪趋势">
            <MoodTrendStatic data={data} />
          </TrendCard>
        ) : (
          <p className="py-2 text-center text-[11.5px] text-ink-faint">
            记录较少，暂不判断趋势。
          </p>
        )}
        <DomainBlock
          fact={
            stats.mood.lowDays > 0
              ? `最近 ${range} 天中，有 ${stats.mood.lowDays} 天出现较低情绪记录${
                  extra.lowMoodPeriod ? `，主要集中在 ${extra.lowMoodPeriod}` : ""
                }。`
              : `最近 ${range} 天中，未出现较低情绪记录。`
          }
          numbers={[
            { k: "低分天数", v: `${stats.mood.lowDays} 天` },
            {
              k: "常见标签",
              v:
                stats.mood.topWords.length > 0
                  ? stats.mood.topWords.map((w) => w.word).join("、")
                  : "无",
            },
          ]}
        />
        {/* 相关用户文字：情绪 mood 文字归入这里 */}
        {freeTextMode === "original" && moodTexts.length > 0 && (
          <RelatedTexts
            title="相关记录文字"
            items={moodTexts}
          />
        )}
        {freeTextMode === "summary" && moodTexts.length > 0 && (
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">
            有 {moodTexts.length} 条记录提到情绪相关内容（默认仅摘要，可切换显示原文）。
          </p>
        )}
      </SectionBlock>

      {/* —— 睡眠模块（趋势图 + 关键数字 + 摘要） —— */}
      <SectionBlock
        title="睡眠记录"
        hidden={isHidden("sleep")}
        onToggle={() => onToggleHide("sleep")}
      >
        {extra.sleepRecordDays > 0 ? (
          <TrendCard label="睡眠时长趋势">
            <SleepTrendStatic data={data} />
          </TrendCard>
        ) : (
          <p className="py-2 text-center text-[11.5px] text-ink-faint">
            记录较少，暂不判断趋势。
          </p>
        )}
        <DomainBlock
          fact={`这段时间睡眠记录${stats.sleep.lateDays > 0 ? "波动较大" : "较稳定"}，有 ${stats.sleep.lateDays} 天入睡较晚。`}
          numbers={[
            {
              k: "平均睡眠",
              v:
                extra.avgSleepHours != null
                  ? `${extra.avgSleepHours.toFixed(1)} 小时`
                  : "记录不足",
            },
            { k: "晚睡天数", v: `${stats.sleep.lateDays} 天` },
            { k: "未记录", v: `${stats.sleep.noRecordDays} 天` },
          ]}
        />
      </SectionBlock>

      {/* —— 服用模块 —— */}
      <SectionBlock
        title="服用记录"
        hidden={isHidden("medication")}
        onToggle={() => onToggleHide("medication")}
      >
        <DomainBlock
          fact={`这段时间共有 ${stats.medication.takenDays} 天服用确认记录。`}
          numbers={[
            {
              k: "确认率",
              v: extra.confirmRate != null ? `${extra.confirmRate}%` : "记录不足",
            },
            { k: "未确认", v: `${stats.medication.noRecordDays} 天` },
            { k: "服用变化", v: stats.medication.changedDays > 0 ? `${stats.medication.changedDays} 天` : "无记录" },
          ]}
          note="仅基于用户记录，不代表实际医学依从判断。"
        />
      </SectionBlock>

      {/* —— 饮食模块 —— */}
      <SectionBlock
        title="饮食记录"
        hidden={isHidden("diet")}
        onToggle={() => onToggleHide("diet")}
      >
        <DomainBlock
          fact={`最近 ${range} 天中，有 ${extra.fullMealDays} 天三餐记录较完整，有 ${extra.partialMealDays} 天只记录了部分餐次。`}
          note="未记录不等于未进食。"
        />
      </SectionBlock>

      {/* —— 身体感受模块 —— */}
      <SectionBlock
        title="身体感受"
        hidden={isHidden("bodyFeeling")}
        onToggle={() => onToggleHide("bodyFeeling")}
      >
        <DomainBlock
          fact={`共记录 ${stats.bodyFeeling.mentionedDays} 次身体感受${
            stats.bodyFeeling.topFeelings.length > 0
              ? `，较常出现的标签为 ${stats.bodyFeeling.topFeelings
                  .map((f) => f.feeling)
                  .join("、")}`
              : ""
          }。`}
          note="仅整理用户记录，不判断原因。"
        />
      </SectionBlock>

      {/* —— 体重模块（记录足够才展示趋势图） —— */}
      {stats.weight.recordedDays > 0 && (
        <SectionBlock
          title="体重变化"
          hidden={isHidden("weight")}
          onToggle={() => onToggleHide("weight")}
        >
          {stats.weight.recordedDays >= 3 ? (
            <>
              <TrendCard label="体重趋势">
                <WeightTrendStatic data={data} />
              </TrendCard>
              <DomainBlock
                fact={`这段时间共有 ${stats.weight.recordedDays} 次体重记录，区间变化为 ${extra.weightMin?.toFixed(1)}–${extra.weightMax?.toFixed(1)}kg。`}
              />
            </>
          ) : (
            <p className="text-[12.5px] leading-relaxed text-ink-faint">
              体重记录较少，暂不整理趋势。
            </p>
          )}
        </SectionBlock>
      )}

      {/* —— 其他记录文字（无法归类的用户文字） —— */}
      {!userTextHidden && otherTexts.length > 0 && (
        <SectionBlock
          title="其他记录文字"
          hidden={isHidden("otherText")}
          onToggle={() => onToggleHide("otherText")}
        >
          {/* 模式切换 */}
          <div className="mb-3 flex gap-1 rounded-lg bg-line-soft p-1">
            {(
              [
                { v: "summary", label: "仅摘要" },
                { v: "original", label: "显示原文" },
                { v: "hidden", label: "不包含" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                onClick={() => onFreeTextModeChange(opt.v)}
                className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  freeTextMode === opt.v
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-soft"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {freeTextMode === "summary" ? (
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              这段时间用户保留了 {otherTexts.length} 条其他原文片段。
            </p>
          ) : (
            <RelatedTexts items={otherTexts} />
          )}
        </SectionBlock>
      )}

      {/* —— 边界说明 —— */}
      <div className="mt-4 rounded-xl bg-line-soft/60 px-4 py-3">
        <p className="text-[11.5px] leading-relaxed text-ink-faint">
          本整理单仅基于用户已有记录生成，不包含诊断、病情判断或治疗/用药建议。记录不足的项目显示「记录较少，暂不判断趋势」，不代表未发生。
        </p>
      </div>
    </div>
  );
}

/* =========================================================
 * 子组件
 * ======================================================= */

function SectionBlock({
  title,
  hidden,
  onToggle,
  children,
}: {
  title: string;
  hidden: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  if (hidden) {
    return <CollapsedBlock title={title} onRestore={onToggle} />;
  }
  return (
    <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          {title}
        </div>
        <button
          onClick={onToggle}
          aria-label="不放入这份整理"
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] text-ink-faint transition-colors hover:bg-line-soft hover:text-ink-soft"
        >
          <EyeOff className="h-3 w-3" />
          不放入
        </button>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function CollapsedBlock({
  title,
  onRestore,
}: {
  title: string;
  onRestore: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-line bg-white/60 px-4 py-2.5">
      <span className="text-[12px] text-ink-faint">「{title}」已不放入这份整理</span>
      <button
        onClick={onRestore}
        aria-label="恢复这一项"
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] text-ink-faint transition-colors hover:bg-line-soft hover:text-ink-soft"
      >
        <Eye className="h-3 w-3" />
        恢复
      </button>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  const insufficient = value === "记录不足";
  return (
    <div className="rounded-lg border border-line/60 px-2.5 py-2.5 text-center">
      <div className="text-[10px] text-ink-faint">{label}</div>
      <div
        className={`mt-1 text-[14px] font-medium ${
          insufficient ? "text-ink-faint" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function TrendCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-lg border border-line/60 px-3 py-2.5">
      <div className="mb-1.5 text-[11px] text-ink-faint">{label}</div>
      {children}
    </div>
  );
}

function DomainBlock({
  fact,
  numbers,
  note,
}: {
  fact: string;
  numbers?: { k: string; v: string }[];
  note?: string;
}) {
  return (
    <div>
      <p className="text-[12.5px] leading-relaxed text-ink">{fact}</p>
      {numbers && numbers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {numbers.map((n) => (
            <div key={n.k} className="text-[11.5px]">
              <span className="text-ink-faint">{n.k}：</span>
              <span className="text-ink-soft">{n.v}</span>
            </div>
          ))}
        </div>
      )}
      {note && (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">{note}</p>
      )}
    </div>
  );
}

function RelatedTexts({
  title,
  items,
}: {
  title?: string;
  items: { displayDate: string; text: string }[];
}) {
  return (
    <div className="mt-2.5">
      {title && (
        <div className="mb-1 text-[10.5px] text-ink-faint">{title}</div>
      )}
      <div className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-baseline gap-2 text-[12.5px] leading-relaxed"
          >
            <span className="shrink-0 text-[11px] text-ink-faint">
              {it.displayDate}
            </span>
            <span className="flex-1 text-ink-soft">{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
 * 静态趋势图：纯 SVG，单主题，可截图，无交互依赖
 * ======================================================= */

function MoodTrendStatic({ data }: { data: DailyLookbackData[] }) {
  const values = data.map((d) => (d.mood != null ? (d.mood as number) : null));
  return (
    <Sparkline
      values={values}
      min={1}
      max={5}
      color="#5F745F"
      yTicks={[
        { v: 5, label: "好" },
        { v: 3, label: "中" },
        { v: 1, label: "低" },
      ]}
    />
  );
}

function SleepTrendStatic({ data }: { data: DailyLookbackData[] }) {
  const raw = data.map((d) =>
    d.sleepDurationMin != null ? d.sleepDurationMin / 60 : null,
  );
  const valid = raw.filter((v): v is number => v != null);
  if (valid.length === 0) return null;
  const max = Math.max(10, Math.ceil(Math.max(...valid)));
  return <Sparkline values={raw} min={0} max={max} color="#88C6CD" unit="小时" />;
}

function WeightTrendStatic({ data }: { data: DailyLookbackData[] }) {
  const raw = data.map((d) => d.weight);
  const valid = raw.filter((v): v is number => v != null);
  if (valid.length === 0) return null;
  const lo = Math.min(...valid);
  const hi = Math.max(...valid);
  const pad = Math.max(0.5, (hi - lo) * 0.2);
  return (
    <Sparkline values={raw} min={lo - pad} max={hi + pad} color="#A7B765" unit="kg" />
  );
}

function Sparkline({
  values,
  min,
  max,
  color,
  unit,
  yTicks,
}: {
  values: (number | null)[];
  min: number;
  max: number;
  color: string;
  unit?: string;
  yTicks?: { v: number; label: string }[];
}) {
  const H = 72;
  const W = 300;
  const padTop = 6;
  const padBottom = 6;
  const n = values.length;
  if (n === 0) return null;
  const xFor = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const yFor = (v: number) =>
    padTop + (1 - (v - min) / (max - min || 1)) * (H - padTop - padBottom);

  const segments: { x: number; y: number }[][] = [];
  let cur: { x: number; y: number }[] = [];
  values.forEach((v, i) => {
    if (v == null) {
      if (cur.length > 0) {
        segments.push(cur);
        cur = [];
      }
      return;
    }
    cur.push({ x: xFor(i), y: yFor(v) });
  });
  if (cur.length > 0) segments.push(cur);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: H }}
      >
        <line
          x1={0}
          x2={W}
          y1={H - padBottom}
          y2={H - padBottom}
          stroke="#D8E0CA"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {segments.map((seg, si) => (
          <polyline
            key={si}
            points={seg.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {segments.flatMap((seg, si) =>
          seg.map((p, pi) => (
            <circle
              key={`${si}-${pi}`}
              cx={p.x}
              cy={p.y}
              r={2}
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          )),
        )}
      </svg>
      <div className="mt-1 flex items-center justify-between text-[10px] text-ink-faint">
        <span>{values[0] != null ? `起 ${values[0].toFixed(1)}` : ""}</span>
        {unit && <span>单位：{unit}</span>}
        <span>
          {values[n - 1] != null ? `末 ${values[n - 1]!.toFixed(1)}` : ""}
        </span>
      </div>
      {yTicks && (
        <div className="mt-0.5 flex justify-between text-[9.5px] text-ink-faint">
          {yTicks.map((t) => (
            <span key={t.v}>{t.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * 复制简版文字：短文本，用于快速粘贴
 * ======================================================= */
export function buildDoctorPlainText(range: OrganizeRange): string {
  const data = lookbackData[range];
  const stats = computeRangeStats(range);
  const sleepMins = data
    .filter((d) => d.sleepDurationMin != null)
    .map((d) => d.sleepDurationMin as number);
  const avgSleepHours =
    sleepMins.length > 0
      ? (sleepMins.reduce((a, b) => a + b, 0) / sleepMins.length / 60).toFixed(1)
      : null;
  const confirmRate =
    stats.medication.takenDays > 0
      ? Math.round((stats.medication.takenDays / range) * 100)
      : null;
  const parts: string[] = [`最近 ${range} 天整理：共有 ${stats.recordedDays} 天记录。记录显示，情绪低分有 ${stats.mood.lowDays} 天`];
  if (avgSleepHours) parts.push(`平均睡眠 ${avgSleepHours} 小时`);
  parts.push(`晚睡 ${stats.sleep.lateDays} 天`);
  if (confirmRate != null) parts.push(`服用确认率 ${confirmRate}%`);
  parts.push("本整理仅基于用户记录，不包含诊断或治疗建议。");
  return parts.join("，") + "。";
}
