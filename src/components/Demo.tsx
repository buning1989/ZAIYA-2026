import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ArrowRight, Send } from "lucide-react";

type Props = { onClose: () => void };

const ease = [0.22, 1, 0.36, 1] as const;

export default function Demo({ onClose }: Props) {
  const [screen, setScreen] = useState(0);

  // 锁定背景滚动
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const goNext = () => setScreen((s) => Math.min(5, s + 1));
  const goPrev = () => setScreen((s) => Math.max(0, s - 1));
  const restart = () => setScreen(0);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/30 p-4">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        aria-label="关闭 Demo"
        className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-canvas text-ink shadow-sm transition-colors hover:bg-line-soft"
      >
        <X className="h-5 w-5" />
      </button>

      {/* 手机边框（固定，不响应式） */}
      <div className="w-full max-w-[340px]">
        <div className="rounded-[44px] border-[10px] border-ink bg-ink p-1 shadow-2xl">
          <div className="relative aspect-[9/18] overflow-hidden rounded-[36px] bg-canvas">
            {/* 顶部状态栏占位 */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-3 text-[11px] font-medium text-ink-soft">
              <span>在呀</span>
              <span>9:41</span>
            </div>

            {/* 上一步（非首屏可用） */}
            {screen > 0 && screen < 5 && (
              <button
                onClick={goPrev}
                aria-label="上一步"
                className="absolute left-4 top-12 z-10 grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className="absolute inset-0"
              >
                {screen === 0 && <IntroScreen onNext={goNext} />}
                {screen === 1 && <HomeScreen onNext={goNext} />}
                {screen === 2 && <StoryScreen onNext={goNext} />}
                {screen === 3 && <TimelineScreen onNext={goNext} />}
                {screen === 4 && <ValidationScreen onNext={goNext} />}
                {screen === 5 && (
                  <ClosingScreen onRestart={restart} onClose={onClose} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* —— 在在占位图形 —— */
function ZaizaiGlyph({ className = "" }: { className?: string }) {
  return <div className={`rounded-full bg-ink/15 ${className}`} />;
}

/* —— 屏 0：冷启动·在在出现 —— */
function IntroScreen({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNext, 2000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-line-soft px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease }}
      >
        <ZaizaiGlyph className="h-24 w-24" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-[13px] text-ink-faint"
      >
        在在正在出现…
      </motion.p>
    </div>
  );
}

/* —— 屏 1：主页呈现 —— */
function HomeScreen({ onNext }: { onNext: () => void }) {
  const [tapped, setTapped] = useState<number | null>(null);
  const buttons = ["说点什么", "陪我会儿", "记录一下"];

  const handleTap = (i: number) => {
    setTapped(i);
    setTimeout(onNext, 300);
  };

  return (
    <div className="flex h-full flex-col bg-line-soft">
      {/* 顶部两个图标 */}
      <div className="flex items-center justify-between px-6 pt-14">
        {[0, 1].map((i) => (
          <button
            key={i}
            onPointerDown={() => setTapped(i + 10)}
            onPointerUp={() => setTapped(null)}
            onPointerLeave={() => setTapped(null)}
            className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
              tapped === i + 10
                ? "border-ink bg-ink text-canvas"
                : "border-line bg-canvas text-ink-soft"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-current opacity-60" />
          </button>
        ))}
      </div>

      {/* 在在占位 */}
      <div className="flex flex-1 items-center justify-center">
        <ZaizaiGlyph className="h-28 w-28" />
      </div>

      {/* 底部三按钮 */}
      <div className="flex flex-col gap-2 p-6">
        {buttons.map((label, i) => (
          <button
            key={label}
            onClick={() => handleTap(i)}
            className={`w-full rounded-xl border px-4 py-3.5 text-[14px] font-medium transition-colors ${
              tapped === i
                ? "border-ink bg-ink text-canvas"
                : "border-line bg-canvas text-ink-soft hover:border-ink/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* —— 屏 2：故事推进（对话浮在场景里，非气泡） —— */
const storyLines = [
  { who: "you", text: "占位：今天有点说不上来的闷。" },
  { who: "zaizai", text: "占位：嗯，我在。" },
  { who: "you", text: "占位：也不知道从哪说起。" },
  { who: "zaizai", text: "占位：那就先不用急着说。" },
];

function StoryScreen({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState(0);
  const current = storyLines[step];
  const isLast = step === storyLines.length - 1;

  return (
    <div
      className="flex h-full cursor-pointer flex-col bg-line-soft"
      onClick={() => (isLast ? onNext() : setStep((s) => s + 1))}
    >
      {/* 顶部场景标签 */}
      <div className="px-6 pt-14 text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        场景 · 占位
      </div>

      {/* 在在占位（角色在场） */}
      <div className="flex flex-1 items-center justify-center">
        <ZaizaiGlyph
          className={
            current.who === "zaizai" ? "h-28 w-28 bg-ink/25" : "h-28 w-28"
          }
        />
      </div>

      {/* 对话文字浮在场景里（非气泡） */}
      <div className="min-h-[120px] px-8 pb-10">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className={`text-[15px] leading-relaxed ${
            current.who === "zaizai" ? "text-ink" : "text-ink-soft"
          }`}
        >
          {current.text}
        </motion.p>
        <p className="mt-6 text-[11px] text-ink-faint">
          {isLast ? "轻触继续" : "轻触推进"}
        </p>
      </div>
    </div>
  );
}

/* —— 屏 3：数据时间线（双 tab，不用天数计数器） —— */
const timelineUser = [
  { when: "某个安静的晚上", text: "占位：你和在在待了一会儿。" },
  { when: "稍晚一些", text: "占位：你说了一句平时没说出口的话。" },
  { when: "另一个下午", text: "占位：你回头看了这次记录。" },
];
const timelineBrief = [
  { when: "本次对话", text: "占位：情绪基调偏低，未触及风险信号。" },
  { when: "整体观察", text: "占位：表达意愿在缓慢打开。" },
  { when: "建议方向", text: "占位：继续保持不推进的节奏。" },
];

function TimelineScreen({ onNext }: { onNext: () => void }) {
  const [tab, setTab] = useState<"user" | "brief">("user");
  const items = tab === "user" ? timelineUser : timelineBrief;

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="px-6 pt-14">
        <div className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          时间线
        </div>

        {/* 双 tab */}
        <div className="mt-4 flex gap-1 rounded-lg bg-line-soft p-1">
          {(
            [
              { key: "user", label: "你的视角" },
              { key: "brief", label: "简报视角" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md px-3 py-2 text-[12px] font-medium transition-colors ${
                tab === t.key
                  ? "bg-canvas text-ink shadow-sm"
                  : "text-ink-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 时间线条目 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col">
          {items.map((item, i) => (
            <motion.div
              key={tab + i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease }}
              className="border-l-2 border-line pl-4 pb-6 last:pb-0"
            >
              <div className="text-[12px] text-ink-faint">{item.when}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 继续 */}
      <div className="p-6">
        <button
          onClick={onNext}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink px-4 py-3 text-[13px] font-medium text-canvas"
        >
          继续
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* —— 屏 4：真实验证点（唯一带输入框） —— */
function ValidationScreen({ onNext }: { onNext: () => void }) {
  const [value, setValue] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    // 占位回复：延迟 0.5s 显示固定回复
    setTimeout(() => {
      setReply("占位回复：我听到了。");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex h-full flex-col bg-canvas px-6 pt-14">
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        验证点
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">
        占位：试着对在在说一句话。
      </p>

      {/* 在在占位 */}
      <div className="flex flex-1 items-center justify-center">
        <ZaizaiGlyph className="h-24 w-24" />
      </div>

      {/* 占位回复（浮在场景里） */}
      {reply && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-center text-[14px] text-ink"
        >
          {reply}
        </motion.p>
      )}

      {/* 输入区 */}
      <div className="pb-8">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas p-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="占位：想说点什么…"
            disabled={loading || !!reply}
            className="flex-1 bg-transparent px-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={loading || !!reply || !value.trim()}
            aria-label="发送"
            className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-canvas transition-opacity disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {reply && (
          <button
            onClick={onNext}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line px-4 py-3 text-[13px] font-medium text-ink"
          >
            继续
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* —— 屏 5：收束 —— */
function ClosingScreen({
  onRestart,
  onClose,
}: {
  onRestart: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 bg-line-soft px-10">
      <ZaizaiGlyph className="h-24 w-24" />
      <p className="text-center text-[16px] leading-relaxed text-ink">
        占位收尾文字：这一段先到这里。下次见。
      </p>
      <div className="flex w-full flex-col gap-2">
        <button
          onClick={onRestart}
          className="w-full rounded-lg bg-ink px-4 py-3 text-[13px] font-medium text-canvas"
        >
          重新开始
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-lg border border-line bg-canvas px-4 py-3 text-[13px] font-medium text-ink"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
