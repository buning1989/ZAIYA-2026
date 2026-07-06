import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  History,
  Trash2,
  type LucideProps,
} from "lucide-react";
import type { ForwardRefExoticComponent } from "react";
import {
  ORGANIZE_AUDIENCE_CONFIG,
  RANGE_OPTIONS,
  SECTION_META,
  SUPPLEMENT_STEP_CONFIG,
  buildPlainText,
  generateSummary,
  type FreeTextMode,
  type GeneratedSummary,
  type OrganizeAudience,
  type OrganizeHistoryEntry,
  type OrganizeRange,
  type OrganizeSectionId,
} from "@/data/organize";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 受众图标（裸符号，弱装饰） —— */
import {
  User,
  Stethoscope,
  Heart,
  GraduationCap,
} from "lucide-react";

const AUDIENCE_ICON: Record<
  OrganizeAudience,
  ForwardRefExoticComponent<LucideProps>
> = {
  self: User,
  professional: Stethoscope,
  parent: Heart,
  school: GraduationCap,
};

const AUDIENCE_ORDER: OrganizeAudience[] = [
  "self",
  "professional",
  "parent",
  "school",
];

const SECTION_ORDER: OrganizeSectionId[] = [
  "mood",
  "sleep",
  "diet",
  "medication",
  "bodyFeeling",
  "weight",
  "freeText",
  "dataCompleteness",
];

/* —— 向导步骤 ——
 * home: 历史列表入口（用户首次进入默认进 audience 步骤；
 *       点 "查看历史" 切到 home；保存成功后也回到 home）
 * audience / range / sections / supplement / preview: 5 个核心步骤
 * preview 后保存 → 回 home */
type Step =
  | "audience"
  | "range"
  | "sections"
  | "supplement"
  | "preview"
  | "history";

const STEP_ORDER: Step[] = [
  "audience",
  "range",
  "sections",
  "supplement",
  "preview",
];

const STEP_TITLE: Record<Step, string> = {
  audience: "这次想整理给谁看？",
  range: "想整理哪段时间？",
  sections: "这些内容可以整理",
  supplement: "有没有想补充的事？",
  preview: "整理好了，先自己看一遍",
  history: "保存过的整理",
};

type Props = {
  /** 返回 more 侧边栏 */
  onBack: () => void;
  /** 历史记录（由 AppMainSurface 持有，跨页面持久） */
  organizeHistory?: OrganizeHistoryEntry[];
  /** 保存到历史回调 */
  onSaveToHistory?: (entry: OrganizeHistoryEntry) => void;
  /** 删除历史条目回调 */
  onDeleteHistory?: (id: string) => void;
};

export default function OrganizePage({
  onBack,
  organizeHistory = [],
  onSaveToHistory,
  onDeleteHistory,
}: Props) {
  const [step, setStep] = useState<Step>("audience");

  // —— 流程状态 ——
  const [audience, setAudience] = useState<OrganizeAudience | null>(null);
  const [range, setRange] = useState<OrganizeRange>(14);
  const [selectedSections, setSelectedSections] = useState<
    OrganizeSectionId[]
  >([]);
  const [freeTextMode, setFreeTextMode] = useState<FreeTextMode>("original");
  const [supplementText, setSupplementText] = useState("");

  // —— 预览态：用户在预览页可手动隐藏 / 切换自由文本模式 ——
  const [hiddenSections, setHiddenSections] = useState<
    Record<string, boolean>
  >({});
  const [previewFreeTextMode, setPreviewFreeTextMode] =
    useState<FreeTextMode>("original");
  const [sensitiveConfirmed, setSensitiveConfirmed] = useState<
    Record<string, boolean>
  >({});

  // —— 查看历史详情 ——
  const [viewingHistory, setViewingHistory] =
    useState<OrganizeHistoryEntry | null>(null);

  // —— 复制 / 保存反馈 ——
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const stepIdx = STEP_ORDER.indexOf(step);
  const isHistory = step === "history";

  // —— 选择受众时初始化默认 sections + freeTextMode ——
  const selectAudience = (a: OrganizeAudience) => {
    const cfg = ORGANIZE_AUDIENCE_CONFIG[a];
    setAudience(a);
    setSelectedSections(cfg.defaultSections);
    setFreeTextMode(cfg.freeTextMode);
    setPreviewFreeTextMode(cfg.freeTextMode);
    setHiddenSections({});
    setSensitiveConfirmed({});
    setStep("range");
  };

  // —— 生成预览（进入 preview 步骤时计算）——
  const generated: GeneratedSummary | null = useMemo(() => {
    if (step !== "preview" || !audience) return null;
    return generateSummary({
      audience,
      range,
      selectedSections,
      supplementText,
      freeTextMode: previewFreeTextMode,
    });
  }, [step, audience, range, selectedSections, supplementText, previewFreeTextMode]);

  // —— 进入预览前重置隐藏 / 确认状态 ——
  const enterPreview = () => {
    setHiddenSections({});
    setSensitiveConfirmed({});
    setStep("preview");
  };

  // —— 复制简版文字 ——
  const handleCopy = async () => {
    if (!generated) return;
    const text = buildPlainText({ range, summary: generated });
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("已复制到剪贴板");
    } catch {
      setCopyFeedback("复制失败，可手动选择文本复制");
    }
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // —— 保存到历史 ——
  const handleSave = () => {
    if (!generated || !audience) return;
    const entry: OrganizeHistoryEntry = {
      id: Math.random().toString(36).slice(2),
      audience,
      audienceLabel: ORGANIZE_AUDIENCE_CONFIG[audience].label,
      range,
      selectedSections,
      freeTextMode: previewFreeTextMode,
      supplementText,
      generatedSummary: generated,
      createdAt: Date.now(),
    };
    onSaveToHistory?.(entry);
    setSaveFeedback("已保存到历史");
    setTimeout(() => {
      setSaveFeedback(null);
      setStep("history");
    }, 900);
  };

  // —— 返回逻辑：history / audience 返回 onBack；其他步骤返回上一步 ——
  const handleBack = () => {
    if (isHistory) {
      setViewingHistory(null);
      // 历史页返回：如果有 audience，回到 audience 步骤开始新流程；否则回 more
      if (audience) {
        setStep("audience");
      } else {
        onBack();
      }
      return;
    }
    if (stepIdx === 0) {
      onBack();
      return;
    }
    setStep(STEP_ORDER[stepIdx - 1]);
  };

  // —— 历史详情视图 ——
  if (viewingHistory) {
    return (
      <HistoryDetailView
        entry={viewingHistory}
        onBack={() => setViewingHistory(null)}
        onDelete={() => {
          onDeleteHistory?.(viewingHistory.id);
          setViewingHistory(null);
        }}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-canvas">
      {/* 顶部：返回 + 标题 + 历史 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={handleBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          {isHistory
            ? STEP_TITLE.history
            : step === "supplement" && audience
              ? SUPPLEMENT_STEP_CONFIG[audience].title
              : STEP_TITLE[step]}
        </h2>
        {!isHistory && (
          <button
            onClick={() => setStep("history")}
            aria-label="查看历史"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
          >
            <History className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {/* 进度指示：仅 5 个核心步骤显示 */}
      {!isHistory && (
        <div className="flex items-center gap-1.5 px-5 pb-2">
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className={`h-[3px] flex-1 rounded-full transition-colors ${
                i <= stepIdx ? "bg-ink/70" : "bg-line"
              }`}
            />
          ))}
        </div>
      )}

      {/* 主体内容区 */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease }}
            className="absolute inset-0 flex flex-col"
          >
            {step === "audience" && (
              <AudienceStep value={audience} onSelect={selectAudience} />
            )}
            {step === "range" && (
              <RangeStep
                value={range}
                onChange={setRange}
                audienceLabel={
                  audience ? ORGANIZE_AUDIENCE_CONFIG[audience].label : ""
                }
              />
            )}
            {step === "sections" && audience && (
              <SectionsStep
                audience={audience}
                value={selectedSections}
                onChange={setSelectedSections}
                freeTextMode={freeTextMode}
                onFreeTextModeChange={setFreeTextMode}
              />
            )}
            {step === "supplement" && audience && (
              <SupplementStep
                audience={audience}
                value={supplementText}
                onChange={setSupplementText}
              />
            )}
            {step === "preview" && generated && audience && (
              <PreviewStep
                audience={audience}
                range={range}
                summary={generated}
                hiddenSections={hiddenSections}
                onToggleHide={(id) =>
                  setHiddenSections((prev) => ({ ...prev, [id]: !prev[id] }))
                }
                freeTextMode={previewFreeTextMode}
                onFreeTextModeChange={setPreviewFreeTextMode}
                sensitiveConfirmed={sensitiveConfirmed}
                onSensitiveConfirm={(id) =>
                  setSensitiveConfirmed((prev) => ({
                    ...prev,
                    [id]: true,
                  }))
                }
              />
            )}
            {step === "history" && (
              <HistoryStep
                history={organizeHistory}
                onView={(entry) => setViewingHistory(entry)}
                onDelete={(id) => onDeleteHistory?.(id)}
                onStartNew={() => {
                  setAudience(null);
                  setSelectedSections([]);
                  setSupplementText("");
                  setStep("audience");
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部操作区：根据步骤显示不同按钮 */}
      {!isHistory && (
        <div className="border-t border-line/60 bg-canvas px-5 py-3">
          {copyFeedback && (
            <p className="mb-2 text-center text-[12px] text-ink-faint">
              {copyFeedback}
            </p>
          )}
          {saveFeedback && (
            <p className="mb-2 text-center text-[12px] text-ink-soft">
              {saveFeedback}
            </p>
          )}

          {step === "range" && (
            <button
              onClick={() => setStep("sections")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas"
            >
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === "sections" && (
            <button
              onClick={() => setStep("supplement")}
              disabled={selectedSections.length === 0}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas transition-opacity disabled:opacity-30"
            >
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === "supplement" && (
            <div className="flex gap-2">
              <button
                onClick={() => setStep("sections")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-3 text-[13px] font-medium text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
                上一步
              </button>
              <button
                onClick={enterPreview}
                className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-lg bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas"
              >
                生成整理单
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {step === "preview" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("supplement")}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-3 text-[13px] font-medium text-ink"
                >
                  <ChevronLeft className="h-4 w-4" />
                  返回修改
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas"
                >
                  保存到历史
                </button>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2.5 text-[12px] font-medium text-ink-soft"
              >
                <Copy className="h-3.5 w-3.5" />
                复制简版文字
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * Step 1: Audience —— 选择整理对象
 * ======================================================= */
function AudienceStep({
  value,
  onSelect,
}: {
  value: OrganizeAudience | null;
  onSelect: (a: OrganizeAudience) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      <p className="mt-1 text-[12px] text-ink-faint">
        不同对象会有不同的默认展示策略，你可以在后续步骤里调整。
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        {AUDIENCE_ORDER.map((a) => {
          const cfg = ORGANIZE_AUDIENCE_CONFIG[a];
          const Icon = AUDIENCE_ICON[a];
          const active = value === a;
          return (
            <button
              key={a}
              onClick={() => onSelect(a)}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
                active
                  ? "border-ink bg-white"
                  : "border-line bg-white hover:border-ink-faint"
              }`}
            >
              <Icon
                className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft"
                strokeWidth={1.6}
              />
              <div className="flex-1">
                <div className="text-[15px] font-medium text-ink">
                  {cfg.label}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-faint">
                  {cfg.desc}
                </p>
              </div>
              {active && (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FC591B]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Step 2: Range —— 选择时间范围
 * ======================================================= */
function RangeStep({
  value,
  onChange,
  audienceLabel,
}: {
  value: OrganizeRange;
  onChange: (r: OrganizeRange) => void;
  audienceLabel: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      <p className="mt-1 text-[12px] text-ink-faint">
        当前整理对象：{audienceLabel}
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        {RANGE_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 transition-colors ${
                active
                  ? "border-ink bg-white"
                  : "border-line bg-white hover:border-ink-faint"
              }`}
            >
              <span className="text-[15px] font-medium text-ink">
                {opt.label}
              </span>
              {opt.default && !active && (
                <span className="text-[10px] text-ink-faint">默认</span>
              )}
              {active && <Check className="h-4 w-4 text-[#FC591B]" />}
            </button>
          );
        })}
        {/* 自定义范围：Demo 阶段仅入口，不做复杂日期选择 */}
        <button
          disabled
          className="flex items-center justify-between rounded-2xl border border-dashed border-line px-4 py-4 opacity-60"
        >
          <span className="text-[15px] font-medium text-ink-soft">
            自定义范围
          </span>
          <span className="text-[10px] text-ink-faint">Demo 暂未开放</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
 * Step 3: Sections —— 选择整理内容
 * ======================================================= */
function SectionsStep({
  audience,
  value,
  onChange,
  freeTextMode,
  onFreeTextModeChange,
}: {
  audience: OrganizeAudience;
  value: OrganizeSectionId[];
  onChange: (v: OrganizeSectionId[]) => void;
  freeTextMode: FreeTextMode;
  onFreeTextModeChange: (m: FreeTextMode) => void;
}) {
  const toggle = (id: OrganizeSectionId) => {
    if (value.includes(id)) {
      onChange(value.filter((s) => s !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      <p className="mt-1 text-[12px] text-ink-faint">
        已按「{ORGANIZE_AUDIENCE_CONFIG[audience].label}」勾选默认项，你可以手动调整。
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {SECTION_ORDER.map((id) => {
          const meta = SECTION_META[id];
          const checked = value.includes(id);
          return (
            <div
              key={id}
              className={`rounded-2xl border px-4 py-3.5 transition-colors ${
                checked
                  ? "border-ink bg-white"
                  : "border-line bg-white"
              }`}
            >
              <button
                onClick={() => toggle(id)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={`mt-0.5 grid shrink-0 place-items-center rounded-[5px] border transition-colors ${
                    checked
                      ? "border-[#FC591B] bg-[#FC591B] text-canvas"
                      : "border-line bg-canvas"
                  }`}
                  style={{ height: 18, width: 18 }}
                >
                  {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-ink">
                    {meta.label}
                  </div>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">
                    {meta.hint}
                  </p>
                </div>
              </button>

              {/* 自由文本模式选择：仅 freeText 选中时显示 */}
              {id === "freeText" && checked && (
                <div className="mt-3 ml-7 flex flex-col gap-1.5 border-t border-line/60 pt-3">
                  <span className="text-[11px] text-ink-faint">
                    自由文本展示方式
                  </span>
                  <div className="flex gap-1 rounded-lg bg-line-soft p-1">
                    {(
                      [
                        { v: "original", label: "显示原文" },
                        { v: "summary", label: "仅显示摘要" },
                        { v: "hidden", label: "不包含" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => onFreeTextModeChange(opt.v)}
                        className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                          freeTextMode === opt.v
                            ? "bg-canvas text-ink shadow-sm"
                            : "text-ink-soft"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-ink-faint">
        未记录或未补充的内容不会被整理出来。
      </p>
    </div>
  );
}

/* =========================================================
 * Step 4: Supplement —— 补充未记录信息
 * 可选补充，不是必填问卷：补一句日常记录里没有、但这次沟通可能需要带上的话。
 * 页面只保留：标题（外层）+ 简短说明 + 输入框 + 底部隐私提示。
 * ======================================================= */
function SupplementStep({
  audience,
  value,
  onChange,
}: {
  audience: OrganizeAudience;
  value: string;
  onChange: (v: string) => void;
}) {
  const cfg = SUPPLEMENT_STEP_CONFIG[audience];

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      {/* 简短说明：仅一段，不并列展示多个问题 */}
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        {cfg.desc}
      </p>

      {/* 输入框：placeholder 按受众动态变化 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={cfg.placeholder}
        rows={5}
        className="mt-4 w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-ink-faint focus:outline-none"
      />

      {/* 底部一行轻量提示 */}
      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-faint">
        这句话会标注为「本次补充」，你可以在下一步隐藏或删除。
      </p>
    </div>
  );
}

/* =========================================================
 * Step 5: Preview —— 整理单预览
 * ======================================================= */
function PreviewStep({
  audience,
  range,
  summary,
  hiddenSections,
  onToggleHide,
  freeTextMode,
  onFreeTextModeChange,
  sensitiveConfirmed,
  onSensitiveConfirm,
}: {
  audience: OrganizeAudience;
  range: OrganizeRange;
  summary: GeneratedSummary;
  hiddenSections: Record<string, boolean>;
  onToggleHide: (id: string) => void;
  freeTextMode: FreeTextMode;
  onFreeTextModeChange: (m: FreeTextMode) => void;
  sensitiveConfirmed: Record<string, boolean>;
  onSensitiveConfirm: (id: string) => void;
}) {
  const audienceLabel = ORGANIZE_AUDIENCE_CONFIG[audience].label;

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      {/* 整理单头部：受众 + 范围 */}
      <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
        <span className="rounded-full bg-line-soft px-2 py-0.5">
          {audienceLabel}
        </span>
        <span>·</span>
        <span>最近 {range} 天</span>
      </div>

      {/* 第一层：一句话总览 */}
      <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          总览
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-ink">
          {summary.overview}
        </p>
      </div>

      {/* 第二层：重点卡片 */}
      {summary.cards.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            重点
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {summary.cards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-line bg-white px-4 py-3.5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[13.5px] font-medium text-ink">
                    {card.title}
                  </div>
                  <SourceTag source={card.source} />
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 第三层：详细摘要 */}
      <div className="mt-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          详细摘要
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {summary.sections.map((section) => {
            const hidden = hiddenSections[section.id];
            const sensitive =
              section.sensitive && !sensitiveConfirmed[section.id];

            return (
              <div
                key={section.id}
                className={`rounded-2xl border bg-white px-4 py-3.5 transition-opacity ${
                  hidden ? "border-line/60 opacity-50" : "border-line"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[13.5px] font-medium text-ink">
                    {section.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <SourceTag source={section.source} />
                    <button
                      onClick={() => onToggleHide(section.id)}
                      aria-label={hidden ? "显示这一项" : "隐藏这一项"}
                      className="grid h-6 w-6 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
                    >
                      {hidden ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {!hidden && (
                  <>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                      {section.text}
                    </p>

                    {/* freeText 原文条目 */}
                    {section.rawItems && section.rawItems.length > 0 && (
                      <div className="mt-2.5 flex flex-col gap-1.5 border-t border-line/60 pt-2.5">
                        {section.rawItems.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-baseline gap-2 text-[12.5px] leading-relaxed"
                          >
                            <span className="shrink-0 text-[11px] text-ink-faint">
                              {item.displayDate}
                            </span>
                            <span className="flex-1 text-ink-soft">
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 敏感内容确认提示 */}
                    {sensitive && (
                      <div className="mt-2.5 rounded-xl bg-line-soft/80 px-3 py-2.5">
                        <p className="text-[12px] leading-relaxed text-ink-soft">
                          这部分内容比较敏感，请确认是否要放入当前版本。
                        </p>
                        <button
                          onClick={() => onSensitiveConfirm(section.id)}
                          className="mt-1.5 text-[11.5px] font-medium text-ink underline-offset-2 hover:underline"
                        >
                          确认放入
                        </button>
                      </div>
                    )}

                    {/* freeText 模式切换：仅 freeText 区块显示 */}
                    {section.id === "freeText" && (
                      <div className="mt-2.5 flex items-center gap-2 border-t border-line/60 pt-2.5">
                        <span className="text-[11px] text-ink-faint">
                          展示方式
                        </span>
                        <div className="flex gap-1 rounded-md bg-line-soft p-0.5">
                          {(
                            [
                              { v: "original", label: "原文" },
                              { v: "summary", label: "摘要" },
                              { v: "hidden", label: "不含" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.v}
                              onClick={() => onFreeTextModeChange(opt.v)}
                              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                                freeTextMode === opt.v
                                  ? "bg-canvas text-ink shadow-sm"
                                  : "text-ink-soft"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 隐私说明 */}
      <div className="mt-4 rounded-xl bg-line-soft/60 px-4 py-3">
        <p className="text-[11.5px] leading-relaxed text-ink-faint">
          本整理单仅在你设备上生成。Demo 阶段不会自动发送给任何人，也不会保存到云端。
          保存到历史后，可以在「整理历史」中重新查看或删除。
        </p>
      </div>
    </div>
  );
}

/* —— 信息来源小标签 —— */
function SourceTag({
  source,
}: {
  source: "daily" | "supplement" | "insufficient";
}) {
  const cfg = {
    daily: { label: "日常记录", cls: "bg-line-soft text-ink-soft" },
    supplement: { label: "本次补充", cls: "bg-accent-soft/60 text-ink-soft" },
    insufficient: {
      label: "记录不足",
      cls: "bg-line-soft/60 text-ink-faint",
    },
  }[source];

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

/* =========================================================
 * Step 6: History —— 历史列表
 * ======================================================= */
function HistoryStep({
  history,
  onView,
  onDelete,
  onStartNew,
}: {
  history: OrganizeHistoryEntry[];
  onView: (entry: OrganizeHistoryEntry) => void;
  onDelete: (id: string) => void;
  onStartNew: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      {history.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 px-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-line-soft">
            <History className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] leading-relaxed text-ink-faint">
            还没有保存过的整理。
            <br />
            完成一次整理后，可以在这里重新查看。
          </p>
          <button
            onClick={onStartNew}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FC591B] px-4 py-2.5 text-[12.5px] font-medium text-canvas"
          >
            开始一次整理
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {history
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((entry) => (
              <div
                key={entry.id}
                className="group rounded-2xl border border-line bg-white px-4 py-3.5"
              >
                <button
                  onClick={() => onView(entry)}
                  className="flex w-full flex-col items-start text-left"
                >
                  <div className="flex w-full items-baseline justify-between gap-2">
                    <span className="text-[13.5px] font-medium text-ink">
                      {entry.audienceLabel}
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {formatTime(entry.createdAt)}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[11.5px] text-ink-faint">
                    最近 {entry.range} 天
                  </span>
                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                    {entry.generatedSummary.overview}
                  </p>
                </button>
                <div className="mt-2.5 flex justify-end">
                  <button
                    onClick={() => onDelete(entry.id)}
                    aria-label="删除"
                    className="grid h-7 w-7 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line-soft hover:text-ink-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* —— 历史详情视图：复用 PreviewStep 的展示逻辑（只读，无隐藏 / 切换）—— */
function HistoryDetailView({
  entry,
  onBack,
  onDelete,
}: {
  entry: OrganizeHistoryEntry;
  onBack: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col bg-canvas">
      {/* 顶部 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={onBack}
          aria-label="返回历史"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          整理详情
        </h2>
        <button
          onClick={onDelete}
          aria-label="删除"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line-soft hover:text-ink-soft"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
          <span className="rounded-full bg-line-soft px-2 py-0.5">
            {entry.audienceLabel}
          </span>
          <span>·</span>
          <span>最近 {entry.range} 天</span>
          <span>·</span>
          <span>{formatTime(entry.createdAt)}</span>
        </div>

        {/* 总览 */}
        <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            总览
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-ink">
            {entry.generatedSummary.overview}
          </p>
        </div>

        {/* 重点卡片 */}
        {entry.generatedSummary.cards.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              重点
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {entry.generatedSummary.cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-line bg-white px-4 py-3.5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-[13.5px] font-medium text-ink">
                      {card.title}
                    </div>
                    <SourceTag source={card.source} />
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 详细摘要 */}
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            详细摘要
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {entry.generatedSummary.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-2xl border border-line bg-white px-4 py-3.5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[13.5px] font-medium text-ink">
                    {section.title}
                  </div>
                  <SourceTag source={section.source} />
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                  {section.text}
                </p>
                {section.rawItems && section.rawItems.length > 0 && (
                  <div className="mt-2.5 flex flex-col gap-1.5 border-t border-line/60 pt-2.5">
                    {section.rawItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-baseline gap-2 text-[12.5px] leading-relaxed"
                      >
                        <span className="shrink-0 text-[11px] text-ink-faint">
                          {item.displayDate}
                        </span>
                        <span className="flex-1 text-ink-soft">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 复制按钮 */}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                buildPlainText({
                  range: entry.range,
                  summary: entry.generatedSummary,
                }),
              );
            } catch {
              /* 静默失败：只读视图，不强提示 */
            }
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2.5 text-[12px] font-medium text-ink-soft"
        >
          <Copy className="h-3.5 w-3.5" />
          复制简版文字
        </button>
      </div>
    </div>
  );
}

/* —— 时间格式化 —— */
function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}
