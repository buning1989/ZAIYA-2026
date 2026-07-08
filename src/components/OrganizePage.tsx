import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Loader2,
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
  buildSheetSnapshot,
  computeRangeStats,
  generateSummary,
  type FreeTextMode,
  type GeneratedSummary,
  type OrganizeAudience,
  type OrganizeHistoryEntry,
  type OrganizeRange,
  type OrganizeSectionId,
} from "@/data/organize";
import VoiceInputBar from "./VoiceInputBar";
import DoctorSheet, { buildDoctorPlainText } from "./DoctorSheet";

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

/* —— 整理单命名规则：按受众类型 + 日期生成主标题 ——
 * 同一天多份时追加 HH:mm 以区分。 */
const AUDIENCE_TITLE_PREFIX: Record<OrganizeAudience, string> = {
  self: "自看整理单",
  professional: "医生沟通整理单",
  parent: "家人沟通整理单",
  school: "学校沟通说明",
};

export function buildSheetTitle(
  audience: OrganizeAudience,
  createdAt: number,
  existingTimestamps: number[] = [],
): string {
  const prefix = AUDIENCE_TITLE_PREFIX[audience];
  const d = new Date(createdAt);
  const md = `${d.getMonth() + 1}月${d.getDate()}日`;
  // 同一天多份：判断是否已有同日条目
  const sameDay = existingTimestamps.filter((ts) => {
    const od = new Date(ts);
    return (
      od.getMonth() === d.getMonth() &&
      od.getDate() === d.getDate() &&
      od.getFullYear() === d.getFullYear()
    );
  });
  if (sameDay.length > 0) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${prefix} · ${md} ${hh}:${mm}`;
  }
  return `${prefix} · ${md}`;
}

/* —— Mock 整理单：Demo 阶段默认展示，体现「整理夹」概念 ——
 * 字段结构与 OrganizeHistoryEntry 一致，可无缝替换为真实数据。 */
const MOCK_SHEETS: OrganizeHistoryEntry[] = [
  {
    id: "mock-sheet-001",
    audience: "professional",
    audienceLabel: "给专业人士看",
    range: 14,
    selectedSections: ["mood", "sleep", "medication"],
    freeTextMode: "summary",
    supplementText: "",
    generatedSummary: {
      overview: "记录 14 天，已整理情绪、睡眠和服用情况。",
      cards: [],
      sections: [],
    },
    createdAt: new Date().setHours(0, 0, 0, 0),
  },
  {
    id: "mock-sheet-002",
    audience: "self",
    audienceLabel: "给自己看",
    range: 7,
    selectedSections: ["mood", "sleep", "diet"],
    freeTextMode: "original",
    supplementText: "",
    generatedSummary: {
      overview: "整理了睡眠、饮食和情绪变化。",
      cards: [],
      sections: [],
    },
    createdAt: new Date().setHours(0, 0, 0, 0) - 2 * 24 * 60 * 60 * 1000,
  },
];

/* —— 向导步骤 ——
 * home: 整理夹首页（默认入口，展示已保存整理单 + 新建入口）
 * audience / range / sections / supplement / preview: 5 个核心创建步骤
 * preview 后保存 → 回 home */
type Step =
  | "home"
  | "audience"
  | "range"
  | "generating"
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
  home: "帮我整理",
  audience: "这次想整理给谁看？",
  range: "整理哪段时间？",
  generating: "正在整理近期记录",
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
  const [step, setStep] = useState<Step>("home");

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

  // —— 查看导出医生报告 ——
  const [viewingExport, setViewingExport] =
    useState<OrganizeHistoryEntry | null>(null);

  // —— 复制 / 保存反馈 ——
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  // —— 离开当前整理确认（仅医生预览态提示） ——
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const stepIdx = STEP_ORDER.indexOf(step);
  const isHome = step === "home";
  const isHistory = step === "history";
  const isGenerating = step === "generating";
  const isDoctor = audience === "professional";
  // 创建流程页（audience/range/generating/preview/sections/supplement）显示右上角返回首页
  const inFlow = !isHome && !isHistory;
  // 医生预览态：草稿未保存，离开需确认
  const isDraftPreview = step === "preview" && isDoctor;

  // —— generating loading：医生版点击「生成整理单」后短 loading → preview ——
  useEffect(() => {
    if (step !== "generating") return;
    const id = window.setTimeout(() => setStep("preview"), 1300);
    return () => window.clearTimeout(id);
  }, [step]);

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

  // —— 复制简版文字：医生版用专属短文案，其他受众沿用通用 buildPlainText ——
  const handleCopy = async () => {
    const text = isDoctor
      ? buildDoctorPlainText(range)
      : generated
        ? buildPlainText({ range, summary: generated })
        : "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("已复制");
    } catch {
      setCopyFeedback("复制失败，可手动选择文本复制");
    }
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // —— 保存到历史（保存后默认回首页） ——
  const handleSave = (opts?: { silent?: boolean }) => {
    if (!audience) return;
    const summary =
      generated ??
      generateSummary({
        audience,
        range,
        selectedSections,
        supplementText,
        freeTextMode: previewFreeTextMode,
      });
    const now = Date.now();
    const title = buildSheetTitle(audience, now);
    // 生成快照：App 内详情 + 导出报告共用同一份数据
    const snapshot = buildSheetSnapshot({
      title,
      audience,
      audienceLabel: ORGANIZE_AUDIENCE_CONFIG[audience].label,
      range,
      selectedSections,
      supplementText,
      freeTextMode: previewFreeTextMode,
      generatedSummary: summary,
      savedAt: now,
    });
    const entry: OrganizeHistoryEntry = {
      id: Math.random().toString(36).slice(2),
      audience,
      audienceLabel: ORGANIZE_AUDIENCE_CONFIG[audience].label,
      range,
      selectedSections,
      freeTextMode: previewFreeTextMode,
      supplementText,
      generatedSummary: summary,
      createdAt: now,
      sheetSnapshot: snapshot,
    };
    onSaveToHistory?.(entry);
    if (!opts?.silent) {
      setSaveFeedback("已保存");
      setTimeout(() => {
        setSaveFeedback(null);
        setStep("home");
      }, 900);
    }
  };

  // —— 保存并导出：先保存，再触发导出流程；导出失败不影响已保存 ——
  const handleSaveAndExport = () => {
    if (!audience) return;
    handleSave({ silent: true });
    // Demo 阶段导出能力暂未开放，给极短反馈
    setSaveFeedback("已保存，导出失败，可稍后再试");
    setTimeout(() => {
      setSaveFeedback(null);
      setStep("home");
    }, 1100);
  };

  // —— 返回逻辑：home 返回 onBack；audience 返回 home；其他步骤返回上一步 ——
  const handleBack = () => {
    if (isHome) {
      onBack();
      return;
    }
    if (isHistory) {
      setViewingHistory(null);
      setStep("home");
      return;
    }
    if (step === "audience") {
      setStep("home");
      return;
    }
    if (isGenerating) {
      setStep("range");
      return;
    }
    // 医生版预览返回 → 回到时间选择（医生版无 sections/supplement 步骤）
    if (step === "preview" && isDoctor) {
      setStep("range");
      return;
    }
    if (stepIdx <= 0) {
      onBack();
      return;
    }
    setStep(STEP_ORDER[stepIdx - 1]);
  };

  // —— 右上角「回到我的整理」：草稿预览态弹极短确认；其他直接回 home ——
  const handleBackHome = () => {
    if (isDraftPreview) {
      setShowLeaveConfirm(true);
      return;
    }
    setStep("home");
  };

  // —— 导出医生报告视图 ——
  if (viewingExport) {
    return (
      <DoctorReportView
        entry={viewingExport}
        onBack={() => setViewingExport(null)}
      />
    );
  }

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
        onExport={() => setViewingExport(viewingHistory)}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-white">
      {/* 顶部：返回 + 标题 + 右上角回到首页（home/history 态无右上角） */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={handleBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          {isHome
            ? STEP_TITLE.home
            : isHistory
              ? STEP_TITLE.history
              : step === "supplement" && audience
                ? SUPPLEMENT_STEP_CONFIG[audience].title
                : STEP_TITLE[step]}
        </h2>
        {inFlow && (
          <button
            onClick={handleBackHome}
            aria-label="回到我的整理"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line-soft hover:text-ink-soft"
          >
            <FolderOpen className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {/* home 态：模块说明文字 */}
      {isHome && (
        <p className="px-5 pb-2 text-[12.5px] leading-relaxed text-ink-faint">
          把最近的记录整理成可以带去沟通的材料。
        </p>
      )}

      {/* 医生预览态：右上「修改时间」弱入口（紧贴标题下方） */}
      {isDraftPreview && (
        <div className="px-5 pb-2">
          <button
            onClick={() => setStep("range")}
            className="inline-flex items-center gap-1 text-[11.5px] text-ink-faint transition-colors hover:text-ink-soft"
          >
            <Clock className="h-3 w-3" />
            修改时间
          </button>
        </div>
      )}

      {/* 离开整理确认浮层（仅 draft 预览态触发） */}
      {showLeaveConfirm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/20 px-8">
          <div className="w-full max-w-[260px] rounded-2xl bg-white px-5 py-4 shadow-lg">
            <p className="text-center text-[13.5px] font-medium text-ink">
              离开这份整理？
            </p>
            <p className="mt-1.5 text-center text-[11.5px] leading-relaxed text-ink-faint">
              当前整理单还未保存，离开后会丢失。
            </p>
            <div className="mt-3.5 flex gap-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 rounded-lg border border-line bg-white py-2 text-[12.5px] font-medium text-ink"
              >
                继续查看
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setStep("home");
                }}
                className="flex-1 rounded-lg bg-action-primary py-2 text-[12.5px] font-medium text-action-primary-text"
              >
                离开
              </button>
            </div>
          </div>
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
            {step === "home" && (
              <HomeStep
                history={organizeHistory}
                onView={(entry) => setViewingHistory(entry)}
                onCreate={() => setStep("audience")}
              />
            )}
            {step === "audience" && (
              <AudienceStep value={audience} onSelect={selectAudience} />
            )}
            {step === "range" && (
              <RangeStep
                value={range}
                onChange={setRange}
                isDoctor={isDoctor}
              />
            )}
            {step === "generating" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
                <p className="text-[14px] font-medium text-ink">
                  正在整理近期记录
                </p>
                <p className="text-[12px] leading-relaxed text-ink-faint">
                  只整理已有记录，不生成诊断或治疗建议。
                </p>
              </div>
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
            {step === "preview" && audience && isDoctor && (
              <DoctorSheet
                range={range}
                hiddenSections={hiddenSections}
                onToggleHide={(id) =>
                  setHiddenSections((prev) => ({ ...prev, [id]: !prev[id] }))
                }
                freeTextMode={previewFreeTextMode}
                onFreeTextModeChange={setPreviewFreeTextMode}
              />
            )}
            {step === "preview" && generated && audience && !isDoctor && (
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
        <div className="border-t border-line/60 bg-white px-5 py-3">
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

          {step === "home" && (
            <button
              onClick={() => setStep("audience")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text"
            >
              整理一份新的
            </button>
          )}
          {step === "range" && (
            <button
              onClick={() => setStep(isDoctor ? "generating" : "sections")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text"
            >
              {isDoctor ? "生成整理单" : "下一步"}
              {!isDoctor && <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {step === "sections" && (
            <button
              onClick={() => setStep("supplement")}
              disabled={selectedSections.length === 0}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text transition-opacity disabled:opacity-30"
            >
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === "supplement" && (
            <div className="flex gap-2">
              <button
                onClick={() => setStep("sections")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
                上一步
              </button>
              <button
                onClick={enterPreview}
                className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text"
              >
                生成整理单
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {step === "preview" && isDoctor && (
            <div className="flex gap-2">
              <button
                onClick={() => handleSave({})}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink"
              >
                仅保存
              </button>
              <button
                onClick={handleSaveAndExport}
                className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-lg border border-ink-faint bg-white px-4 py-3 text-[13px] font-semibold text-ink"
              >
                保存并导出医生报告
              </button>
            </div>
          )}
          {step === "preview" && !isDoctor && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("supplement")}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink"
                >
                  <ChevronLeft className="h-4 w-4" />
                  返回修改
                </button>
                <button
                  onClick={() => handleSave()}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text"
                >
                  保存到历史
                </button>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 py-2.5 text-[12px] font-medium text-ink-soft"
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
 * Home: 整理夹首页 —— 展示已保存整理单 + 空状态
 * 不是流程页，不显示进度条。用户从这里进入新建或查看详情。
 * ======================================================= */
function HomeStep({
  history,
  onView,
  onCreate,
}: {
  history: OrganizeHistoryEntry[];
  onView: (entry: OrganizeHistoryEntry) => void;
  onCreate: () => void;
}) {
  // 合并 mock + 真实历史，按保存时间倒序
  const sheets = [...MOCK_SHEETS, ...history].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  const isEmpty = sheets.length === 0;

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
      {/* 区域标题 */}
      <div className="mt-3">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          我的整理
        </h3>
      </div>

      {isEmpty ? (
        /* 空状态 */
        <div className="mt-10 flex flex-col items-center gap-3 px-6 text-center">
          <p className="text-[15px] font-medium text-ink">还没有整理过</p>
          <p className="text-[12.5px] leading-relaxed text-ink-faint">
            可以把最近的记录整理成一份自己确认过的材料，需要时再带去沟通。
          </p>
          <button
            onClick={onCreate}
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-action-primary px-5 py-2.5 text-[13px] font-medium text-action-primary-text"
          >
            整理最近 14 天
          </button>
          <button
            onClick={onCreate}
            className="text-[12px] text-ink-faint underline-offset-2 hover:underline"
          >
            自己选择时间
          </button>
        </div>
      ) : (
        /* 整理单卡片列表 */
        <div className="mt-3 flex flex-col gap-2">
          {sheets.map((sheet, idx) => {
            // 三层信息：主标题（受众+日期） / 副标题（对象+范围） / 摘要 / 保存时间
            // 同日多份时，后面生成的卡片追加 HH:mm
            const priorTs = idx === 0 ? [] : sheets.slice(idx + 1).map((s) => s.createdAt);
            const title = buildSheetTitle(sheet.audience, sheet.createdAt, priorTs);
            return (
              <button
                key={sheet.id}
                onClick={() => onView(sheet)}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition-colors hover:border-ink-faint"
              >
                <div className="flex-1 min-w-0">
                  {/* 主标题 */}
                  <div className="text-[14px] font-medium text-ink">
                    {title}
                  </div>
                  {/* 副标题：对象 + 时间范围 */}
                  <div className="mt-0.5 text-[11.5px] text-ink-faint">
                    {sheet.audienceLabel}｜最近 {sheet.range} 天
                  </div>
                  {/* 摘要 */}
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                    {sheet.generatedSummary.overview}
                  </p>
                  {/* 保存时间 */}
                  <div className="mt-1.5 text-[11px] text-ink-faint">
                    {formatDate(sheet.createdAt)}保存
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* —— 仅显示月日的轻量日期格式 —— */
function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
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
  // Demo 阶段仅医生版可点击；其他对象锁定，点击给轻提示
  const [lockHint, setLockHint] = useState<string | null>(null);
  const showLockHint = (a: OrganizeAudience) => {
    if (a === "professional") return;
    setLockHint("这个版本后续会开放，当前先支持医生版整理单。");
    window.setTimeout(() => setLockHint(null), 2200);
  };

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
      {lockHint && (
        <p className="mt-3 rounded-lg bg-line-soft/80 px-3 py-2 text-center text-[12px] text-ink-soft">
          {lockHint}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2.5">
        {AUDIENCE_ORDER.map((a) => {
          const cfg = ORGANIZE_AUDIENCE_CONFIG[a];
          const Icon = AUDIENCE_ICON[a];
          const active = value === a;
          const locked = a !== "professional";
          return (
            <button
              key={a}
              onClick={() => (locked ? showLockHint(a) : onSelect(a))}
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
                  {a === "professional"
                    ? "整理成复诊、咨询或专业沟通前可查看的记录单。"
                    : cfg.desc}
                </p>
              </div>
              {locked ? (
                <span className="mt-0.5 shrink-0 rounded-full bg-line-soft px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                  后续开放
                </span>
              ) : (
                active && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                )
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
  isDoctor,
}: {
  value: OrganizeRange;
  onChange: (r: OrganizeRange) => void;
  isDoctor: boolean;
}) {
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
      <p className="mt-1 text-center text-[12px] text-ink-faint">
        {isDoctor
          ? "会根据这段时间里的记录生成医生版整理单。"
          : "选择想整理的时间范围。"}
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
              {active && <Check className="h-4 w-4 text-accent" />}
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
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
      <p className="mt-1 text-center text-[12px] text-ink-faint">
        当前整理对象：{ORGANIZE_AUDIENCE_CONFIG[audience].label}
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
                      ? "border-accent bg-accent text-canvas"
                      : "border-line bg-white"
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
                            ? "bg-white text-ink shadow-sm"
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
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
      {/* 与上一页保持一致的提示 */}
      <p className="mt-1 text-center text-[12px] text-ink-faint">
        当前整理对象：{ORGANIZE_AUDIENCE_CONFIG[audience].label}
      </p>

      {/* 输入区：复用全局 VoiceInputBar，支持文字和语音输入 */}
      <div className="mt-4">
        <VoiceInputBar
          value={value}
          onChange={onChange}
          onSend={() => {}}
          canSend={true}
          placeholder={cfg.desc}
          showSendButton={false}
          inline
        />
      </div>

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
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
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
                                  ? "bg-white text-ink shadow-sm"
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
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
      {history.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 px-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-line-soft">
            <FileText className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] leading-relaxed text-ink-faint">
            还没有保存过的整理。
            <br />
            完成一次整理后，可以在这里重新查看。
          </p>
          <button
            onClick={onStartNew}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-2.5 text-[12.5px] font-medium text-action-primary-text"
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

/* —— 历史详情视图：读取 sheetSnapshot 渲染（只读，与创建预览页结构一致）—— */
function HistoryDetailView({
  entry,
  onBack,
  onDelete,
  onExport,
}: {
  entry: OrganizeHistoryEntry;
  onBack: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  // 优先使用快照数据，兜底使用 generatedSummary
  const snapshot = entry.sheetSnapshot;
  const sections = snapshot?.appViewSections ?? entry.generatedSummary.sections;
  const overview = snapshot?.summary ?? entry.generatedSummary.overview;
  const cards = snapshot?.metrics.cards ?? entry.generatedSummary.cards;

  return (
    <div className="relative flex h-full w-full flex-col bg-white">
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

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8">
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
            {overview}
          </p>
        </div>

        {/* 重点卡片 */}
        {cards.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              重点
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {cards.map((card) => (
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

        {/* 详细摘要：从快照读取，与创建预览页结构一致 */}
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            详细摘要
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {sections.map((section) => (
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

        {/* 已保存详情：复制简版文字 + 导出医生报告 */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  entry.audience === "professional"
                    ? buildDoctorPlainText(entry.range)
                    : buildPlainText({
                        range: entry.range,
                        summary: entry.generatedSummary,
                      }),
                );
              } catch {
                /* 静默失败：只读视图，不强提示 */
              }
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 py-2.5 text-[12px] font-medium text-ink-soft"
          >
            <Copy className="h-3.5 w-3.5" />
            复制简版文字
          </button>
          <button
            onClick={onExport}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-2.5 text-[12px] font-medium text-action-primary-text"
          >
            导出医生报告
          </button>
        </div>
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

/* =========================================================
 * 导出医生报告视图：基于 sheetSnapshot 生成更完整的 App 外版本
 * 版式更严肃，适合 PDF、图片、打印
 * ======================================================= */
function DoctorReportView({
  entry,
  onBack,
}: {
  entry: OrganizeHistoryEntry;
  onBack: () => void;
}) {
  const snapshot = entry.sheetSnapshot;
  // 兜底：如果没有快照，使用 generatedSummary
  const sections = snapshot?.appViewSections ?? entry.generatedSummary.sections;
  const overview = snapshot?.summary ?? entry.generatedSummary.overview;
  const cards = snapshot?.metrics.cards ?? entry.generatedSummary.cards;
  const title = snapshot?.title ?? buildSheetTitle(entry.audience, entry.createdAt);

  // 计算统计信息
  const stats = computeRangeStats(entry.range);

  return (
    <div className="relative flex h-full w-full flex-col bg-white">
      {/* 顶部 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={onBack}
          aria-label="返回详情"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          医生报告
        </h2>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8">
        {/* 报告头部 */}
        <div className="mt-2 rounded-2xl border border-line bg-white px-5 py-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            医生沟通报告
          </div>
          <h3 className="mt-1.5 text-[18px] font-semibold tracking-tight text-ink">
            {title}
          </h3>
          <div className="mt-4 flex flex-col gap-1.5 text-[12.5px] text-ink-soft">
            <div className="flex gap-3">
              <span className="w-20 text-ink-faint">整理对象</span>
              <span>{entry.audienceLabel}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-20 text-ink-faint">记录范围</span>
              <span>最近 {entry.range} 天</span>
            </div>
            <div className="flex gap-3">
              <span className="w-20 text-ink-faint">生成时间</span>
              <span>{formatTime(entry.createdAt)}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-20 text-ink-faint">记录天数</span>
              <span>{stats.recordedDays} / {entry.range} 天</span>
            </div>
          </div>
        </div>

        {/* 记录概况 */}
        <div className="mt-4 rounded-2xl border border-line bg-white px-5 py-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            记录概况
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-ink">
            {overview}
          </p>
        </div>

        {/* 关键指标 */}
        {cards.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line bg-white px-5 py-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              关键指标
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {cards.map((card) => (
                <div key={card.id} className="flex items-baseline gap-3">
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-ink">
                      {card.title}
                    </div>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                      {card.text}
                    </p>
                  </div>
                  <SourceTag source={card.source} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 分维度摘要 */}
        <div className="mt-4 rounded-2xl border border-line bg-white px-5 py-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            分维度摘要
          </div>
          <div className="mt-3 flex flex-col gap-4">
            {sections.map((section) => (
              <div key={section.id} className="border-b border-line/40 pb-4 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[14px] font-medium text-ink">
                    {section.title}
                  </div>
                  <SourceTag source={section.source} />
                </div>
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
              </div>
            ))}
          </div>
        </div>

        {/* 边界说明 */}
        <div className="mt-4 rounded-xl bg-ink/[0.03] px-5 py-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            边界说明
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">
            本报告仅基于用户已有记录生成，不包含诊断、病情判断或治疗/用药建议。
            记录不足的项目显示「记录不足」，不代表未发生。
            本报告仅供沟通参考，不替代专业医疗意见。
          </p>
        </div>

        {/* 导出操作 */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={async () => {
              try {
                const text = buildDoctorPlainText(entry.range);
                await navigator.clipboard.writeText(text);
              } catch {
                /* 静默失败 */
              }
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 py-2.5 text-[12px] font-medium text-ink-soft"
          >
            <Copy className="h-3.5 w-3.5" />
            复制简版文字
          </button>
          <button
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-2.5 text-[12px] font-medium text-action-primary-text"
          >
            导出为图片
          </button>
        </div>
      </div>
    </div>
  );
}
