import { useRef, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  BookOpen,
  Clock,
  FolderOpen,
  Sparkles,
  Shield,
  Settings,
  HelpCircle,
  ImagePlus,
  X,
  Plus,
  Zap,
  type LucideProps,
} from "lucide-react";
import type { ForwardRefExoticComponent } from "react";
import VoiceInputBar from "./VoiceInputBar";
import type { Answers, RecordTypeId } from "@/data/record";
import type { OrganizeHistoryEntry } from "@/data/organize";

/* 性能优化（2026-07-13）：MoreMenu 中各功能页按需懒加载，
 * 首屏 / 主菜单态不加载 RecordFlow / LookbackPage / OrganizePage / PraisePage / PrivacyPage 代码。
 * 各页仅在选择对应 itemId 后才加载对应 chunk。 */
const RecordFlow = lazy(() => import("./RecordFlow"));
const LookbackPage = lazy(() => import("./LookbackPage"));
const OrganizePage = lazy(() => import("./OrganizePage"));
const PraisePage = lazy(() => import("./PraisePage"));
const PrivacyPage = lazy(() => import("./PrivacyPage"));

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 更多页菜单项 ID —— */
export type MoreItemId =
  | "note"
  | "review"
  | "organize"
  | "praise"
  | "energy"
  | "privacy"
  | "help"
  | "settings";

/* —— 上半部分功能区菜单项（与用户自身生活管理、自我支持、隐私直接相关） —— */
export const moreMenuItems: {
  id: MoreItemId;
  label: string;
  Icon: ForwardRefExoticComponent<LucideProps>;
}[] = [
  { id: "note", label: "记一下", Icon: BookOpen },
  { id: "review", label: "回头看看", Icon: Clock },
  { id: "organize", label: "帮我整理", Icon: FolderOpen },
  { id: "praise", label: "夸夸自己", Icon: Sparkles },
  { id: "energy", label: "我的能量", Icon: Zap },
  { id: "privacy", label: "我的隐私", Icon: Shield },
];

/* —— 底部应用级入口（低权重，与上方功能区通过留白区分） —— */
const bottomMenuItems: {
  id: MoreItemId;
  label: string;
  Icon: ForwardRefExoticComponent<LucideProps>;
}[] = [
  { id: "help", label: "帮助与反馈", Icon: HelpCircle },
  { id: "settings", label: "应用设置", Icon: Settings },
];

/* —— 更多侧边栏内容 ——
 * 上半部分：功能区（记一下 / 回头看看 / 帮我整理 / 夸夸自己 / 我的能量 / 我的隐私）
 * 底部固定：应用级入口（帮助与反馈 / 设置），低权重色 */
export function MoreContent({
  onSelect,
  onUnavailable,
}: {
  onSelect: (id: MoreItemId) => void;
  onClose: () => void;
  /** 点击「暂未开放」入口时触发，由父级展示统一提示 */
  onUnavailable?: (msg: string) => void;
}) {
  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 上半部分：功能区 */}
      <nav className="flex-1 px-8 pt-16">
        <ul className="flex flex-col">
          {moreMenuItems.map((item, i) => {
            const isUnavailable = item.id === "energy";
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [...ease],
                  delay: 0.08 + i * 0.05,
                }}
              >
                <button
                  onClick={() => {
                    if (isUnavailable) {
                      onUnavailable?.("Demo 阶段暂未开放");
                    } else {
                      onSelect(item.id);
                    }
                  }}
                  className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:text-ink-faint"
                >
                  <item.Icon
                    className="h-[21px] w-[21px] shrink-0 text-ink-soft"
                    strokeWidth={1.8}
                  />
                  <span className="text-[17px] font-medium tracking-tight text-ink">
                    {item.label}
                  </span>
                  {isUnavailable && (
                    <span className="ml-auto rounded-full bg-line-soft px-2 py-0.5 text-[10px] text-ink-faint">
                      暂未开放
                    </span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* 底部固定区：应用级入口，通过留白与上方区分，低权重色 */}
      <div className="shrink-0 px-8 pb-6">
        <ul className="flex flex-col">
          {bottomMenuItems.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                ease: [...ease],
                delay: 0.38 + i * 0.05,
              }}
            >
              <button
                onClick={() => onSelect(item.id)}
                className="flex w-full items-center gap-4 py-3.5 text-left transition-colors hover:text-ink-soft"
              >
                <item.Icon
                  className="h-[19px] w-[19px] shrink-0 text-ink-faint"
                  strokeWidth={1.8}
                />
                <span className="text-[15px] text-ink-soft">
                  {item.label}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* —— 极简 Switch（无外部依赖，settings 详情层使用） —— */
function Switch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        disabled
          ? "cursor-not-allowed bg-line opacity-50"
          : checked
            ? "bg-accent"
            : "bg-line"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </button>
  );
}

/* —— 设置页内子页面 ID —— */
type SettingsSubPage = "deletion" | "privacy-policy" | "user-agreement" | null;

/* —— 设置详情层 ——
 * 三组列表：功能设置 / 账号与安全 / 关于与规则
 * 子页面（注销确认 / 隐私条款 / 用户协议）通过内部状态切换 */
function SettingsDetail({
  onBack,
  homeShortcut,
  setHomeShortcut,
  appLock,
  setAppLock,
}: {
  onBack: () => void;
  homeShortcut: boolean;
  setHomeShortcut: (v: boolean) => void;
  appLock: boolean;
  setAppLock: (v: boolean) => void;
}) {
  const [subPage, setSubPage] = useState<SettingsSubPage>(null);

  /* —— 子页面：账号注销确认 —— */
  if (subPage === "deletion") {
    return (
      <div className="relative flex h-full flex-col bg-white">
        <div className="flex items-center gap-3 px-5 pt-14 pb-2">
          <button
            onClick={() => setSubPage(null)}
            aria-label="返回设置"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">
            账号注销
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <p className="text-center text-[14px] leading-relaxed text-ink-soft">
            注销将清除本机所有记录、回看、整理内容、夸夸与家人/用药安排，且无法恢复。
          </p>
          <button
            disabled
            className="mt-8 rounded-xl border border-line bg-white px-6 py-3 text-[14px] text-ink-faint opacity-60"
          >
            Demo 暂未开放
          </button>
        </div>
      </div>
    );
  }

  /* —— 子页面：应用隐私条款 —— */
  if (subPage === "privacy-policy") {
    return (
      <div className="relative flex h-full flex-col bg-white">
        <div className="flex items-center gap-3 px-5 pt-14 pb-2">
          <button
            onClick={() => setSubPage(null)}
            aria-label="返回设置"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">
            应用隐私条款
          </h2>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6" />
      </div>
    );
  }

  /* —— 子页面：用户协议 —— */
  if (subPage === "user-agreement") {
    return (
      <div className="relative flex h-full flex-col bg-white">
        <div className="flex items-center gap-3 px-5 pt-14 pb-2">
          <button
            onClick={() => setSubPage(null)}
            aria-label="返回设置"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">
            用户协议
          </h2>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6" />
      </div>
    );
  }

  /* —— 设置主页 —— */
  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          设置
        </h2>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-8">
        {/* 第一组：功能设置 */}
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          功能设置
        </div>
        <div className="mt-2 flex flex-col gap-2.5">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4">
            <div className="flex-1 pr-3">
              <div className="text-[14px] font-medium text-ink">
                记一下快捷入口
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                开启后，首页右上角出现「记一下」入口。
              </p>
            </div>
            <Switch checked={homeShortcut} onChange={setHomeShortcut} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 opacity-60">
            <div className="flex-1 pr-3">
              <div className="text-[14px] font-medium text-ink">
                家长模式
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                暂未开放
              </p>
            </div>
            <Switch checked={false} onChange={() => {}} disabled />
          </div>
        </div>

        {/* 第二组：账号与安全 */}
        <div className="mt-8 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          账号与安全
        </div>
        <div className="mt-2 rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex-1 pr-3">
              <div className="text-[14px] font-medium text-ink">应用锁</div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                保护历史记录、整理内容和隐私页面
              </p>
            </div>
            <Switch checked={appLock} onChange={setAppLock} />
          </div>
          <div className="mx-5 h-px bg-line" />
          <button
            onClick={() => setSubPage("deletion")}
            className="flex w-full items-center px-5 py-4 text-left transition-colors hover:bg-line-soft/40"
          >
            <span className="text-[14px] text-ink">账号注销</span>
          </button>
        </div>

        {/* 第三组：关于与规则 */}
        <div className="mt-8 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          关于与规则
        </div>
        <div className="mt-2 rounded-2xl border border-line bg-white">
          <button
            onClick={() => setSubPage("privacy-policy")}
            className="flex w-full items-center px-5 py-4 text-left transition-colors hover:bg-line-soft/40"
          >
            <span className="text-[14px] text-ink">隐私条款</span>
          </button>
          <div className="mx-5 h-px bg-line" />
          <button
            onClick={() => setSubPage("user-agreement")}
            className="flex w-full items-center px-5 py-4 text-left transition-colors hover:bg-line-soft/40"
          >
            <span className="text-[14px] text-ink">用户协议</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* —— 帮助与反馈页 ——
 * 常见问题列表 + 反馈输入区（文字 / 图片 / 语音）+ 提交按钮
 * Demo 阶段提交不接真实接口，仅展示本地 toast */
function HelpFeedbackPage({ onBack }: { onBack: () => void }) {
  const [feedback, setFeedback] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    const validFiles = files.filter((f) => validTypes.includes(f.type));
    const remaining = 3 - images.length;
    if (remaining <= 0) {
      showToast("最多上传 3 张图片");
      e.target.value = "";
      return;
    }
    const toAdd = validFiles.slice(0, remaining);
    if (validFiles.length > remaining) {
      showToast("最多上传 3 张图片");
    }
    setImages((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx]);
      next.splice(idx, 1);
      return next;
    });
  };

  const canSubmit =
    feedback.trim().length > 0 || images.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    showToast("已收到反馈，Demo 阶段暂不做真实提交");
    images.forEach((url) => URL.revokeObjectURL(url));
    setFeedback("");
    setImages([]);
  };

  const faqs = [
    "记录的数据会被谁看到？",
    "家长模式什么时候开放？",
    "如何生成复诊前整理内容？",
  ];

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* Toast 固定在页面顶部居中，不随滚动漂移 */}
      {toastMsg && (
        <div className="pointer-events-none absolute inset-x-0 top-14 z-20 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-[85%] rounded-full bg-ink/90 px-3 py-1.5 text-center text-[12px] text-canvas"
          >
            {toastMsg}
          </motion.div>
        </div>
      )}

      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          帮助与反馈
        </h2>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-8">
        {/* 常见问题 */}
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          常见问题
        </div>
        <div className="mt-2 rounded-2xl border border-line bg-white">
          {faqs.map((q, i) => (
            <div key={q}>
              {i > 0 && <div className="mx-5 h-px bg-line" />}
              <div className="px-5 py-4">
                <p className="text-[14px] text-ink">{q}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 提交反馈 */}
        <div className="mt-8 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          提交反馈
        </div>
        <div className="relative mt-2 rounded-2xl border border-line bg-white p-4">
          {/* 文本输入 */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="写下你遇到的问题或建议。"
            rows={4}
            className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
          />

          {/* 图片预览区 */}
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div
                  key={url}
                  className="relative h-16 w-16 overflow-hidden rounded-xl bg-line-soft"
                >
                  <img
                    src={url}
                    alt={`反馈图片 ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    aria-label="删除图片"
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/55 text-white backdrop-blur-sm transition-colors hover:bg-ink/75"
                  >
                    <X className="h-3 w-3" strokeWidth={1.8} />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="添加图片"
                  className="grid h-16 w-16 place-items-center rounded-xl border border-action-primary bg-action-primary text-action-primary-text transition-opacity hover:opacity-90"
                >
                  <Plus className="h-5 w-5" strokeWidth={2.4} />
                </button>
              )}
            </div>
          )}

          {/* 底部操作栏 */}
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="上传图片"
                disabled={images.length >= 3}
                className="grid h-9 w-9 place-items-center rounded-lg bg-action-primary text-action-primary-text transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <ImagePlus className="h-5 w-5" strokeWidth={2.4} />
              </button>
              <VoiceInputBar
                compact
                size="sm"
                value={feedback}
                onChange={(v) => setFeedback((prev) => prev + v)}
                onSend={() => {}}
                canSend={false}
                mockText="这是通过语音输入的反馈内容。"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-xl bg-action-primary px-4 py-2 text-[13px] font-medium text-action-primary-text transition-opacity disabled:opacity-30"
            >
              提交
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}

/* —— 更多详情页 ——
 * "note" → RecordFlow，"review" → LookbackPage，"organize" → OrganizePage，
 * "praise" → PraisePage，"privacy" → PrivacyPage，
 * "settings" → SettingsDetail（含子页面），"help" → HelpFeedbackPage */
export function MoreDetailContent({
  itemId,
  onBack,
  homeShortcut,
  setHomeShortcut,
  appLock,
  setAppLock,
  showShortcutHint,
  onAcceptShortcut,
  onDismissShortcutHint,
  onRecordComplete,
  onSaveFirst,
  onOpenZaiyaDialog,
  recordHistory,
  organizeHistory,
  onSaveOrganizeToHistory,
  onDeleteOrganizeHistory,
}: {
  itemId: MoreItemId;
  onBack: () => void;
  homeShortcut: boolean;
  setHomeShortcut: (v: boolean) => void;
  appLock: boolean;
  setAppLock: (v: boolean) => void;
  showShortcutHint: boolean;
  onAcceptShortcut: () => void;
  onDismissShortcutHint: () => void;
  onRecordComplete?: (e: {
    typeId: "mood" | "medication" | "food" | "sleep" | "activity";
    isComplete: boolean;
  }) => void;
  onSaveFirst?: (e: {
    typeId: RecordTypeId;
    answers: Answers;
  }) => void;
  /** 安全承接页：退出记录流程并打开 ZAIYA 对话 */
  onOpenZaiyaDialog?: (starterText: string) => void;
  recordHistory?: import("@/data/record").RecordEntry[];
  organizeHistory?: OrganizeHistoryEntry[];
  onSaveOrganizeToHistory?: (entry: OrganizeHistoryEntry) => void;
  onDeleteOrganizeHistory?: (id: string) => void;
}) {
  if (itemId === "note") {
    return (
      <Suspense fallback={null}>
        <RecordFlow
          onBack={onBack}
          onRecordComplete={onRecordComplete}
          onSaveFirst={onSaveFirst}
          onOpenZaiyaDialog={onOpenZaiyaDialog}
          showShortcutHint={showShortcutHint}
          onAcceptShortcut={onAcceptShortcut}
          onDismissShortcutHint={onDismissShortcutHint}
          recordHistory={recordHistory}
        />
      </Suspense>
    );
  }

  if (itemId === "review") {
    return (
      <Suspense fallback={null}>
        <LookbackPage onBack={onBack} />
      </Suspense>
    );
  }

  if (itemId === "organize") {
    return (
      <Suspense fallback={null}>
        <OrganizePage
          onBack={onBack}
          organizeHistory={organizeHistory}
          onSaveToHistory={onSaveOrganizeToHistory}
          onDeleteHistory={onDeleteOrganizeHistory}
        />
      </Suspense>
    );
  }

  if (itemId === "praise") {
    return (
      <Suspense fallback={null}>
        <PraisePage onBack={onBack} />
      </Suspense>
    );
  }

  if (itemId === "privacy") {
    return (
      <Suspense fallback={null}>
        <PrivacyPage onBack={onBack} />
      </Suspense>
    );
  }

  if (itemId === "settings") {
    return (
      <SettingsDetail
        onBack={onBack}
        homeShortcut={homeShortcut}
        setHomeShortcut={setHomeShortcut}
        appLock={appLock}
        setAppLock={setAppLock}
      />
    );
  }

  if (itemId === "help") {
    return <HelpFeedbackPage onBack={onBack} />;
  }

  const item = moreMenuItems.find((m) => m.id === itemId);
  if (!item) return null;

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          {item.label}
        </h2>
      </div>

      <div className="flex flex-1 items-center justify-center px-8" />
    </div>
  );
}
