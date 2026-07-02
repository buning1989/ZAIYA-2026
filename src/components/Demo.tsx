import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ArrowRight, Send, X } from "lucide-react";
import ZaizaiRive from "./ZaizaiRive";
import AppMainSurface from "./AppMainSurface";

type Props = { onClose: () => void };

const ease = [0.22, 1, 0.36, 1] as const;

export default function Demo({ onClose }: Props) {
  const [screen, setScreen] = useState(0);

  // 锁定背景滚动 + Esc 退出
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [handleEsc]);

  const goNext = () => setScreen((s) => Math.min(5, s + 1));
  const goPrev = () => setScreen((s) => Math.max(0, s - 1));
  const restart = () => setScreen(0);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-canvas p-4">
      {/* 手机边框（固定，不响应式） */}
      <div className="w-full max-w-[340px]">
        <div className="rounded-[44px] border-[10px] border-ink bg-ink p-1 shadow-2xl">
          <div className="relative aspect-[9/18] overflow-hidden rounded-[36px] bg-canvas">
            {/* 顶部状态栏：毛玻璃质感 */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-3 text-[11px] font-medium text-ink-soft">
              <span>在呀</span>
              <span>9:41</span>
              {/* 关闭入口：手机内部右上角 */}
              <button
                onClick={onClose}
                aria-label="关闭 Demo"
                className="grid h-6 w-6 place-items-center rounded-full bg-white/50 backdrop-blur-xl border border-white/30 shadow-sm text-ink-faint transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 上一步（HomeScreen 为主界面入口态，不显示返回，与首页 Hero 一致） */}
            {screen > 1 && screen < 5 && (
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
        <ZaizaiRive className="h-40 w-40" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-[13px] text-ink-faint"
      >
        跟着小晨的一段日常
      </motion.p>
    </div>
  );
}

/* —— 屏 1：主页呈现（复用 AppMainSurface，与首页 Hero 完全一致） —— */
function HomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <AppMainSurface
      interactive
      onPrimaryAction={onNext}
      onButtonClick={() => onNext()}
    />
  );
}

/* —— 屏 2：故事推进（生活节点，不做治疗承诺） —— */
const storyLines = [
  { who: "you", text: "今天 7:40，小晨醒了，但还是不想动。" },
  { who: "zaizai", text: "我在。先不用决定上不上学，先把窗帘拉开一点。" },
  { who: "you", text: "窗帘拉开了，但还是没力气。" },
  { who: "zaizai", text: "那今天只做一个更小的动作：洗脸、喝水，把药放到桌上。" },
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
        场景 · 早晨启动
      </div>

      {/* 在在在场 */}
      <div className="flex flex-1 items-center justify-center">
        <ZaizaiRive
          className={`h-44 w-44 transition-opacity ${
            current.who === "zaizai" ? "opacity-100" : "opacity-70"
          }`}
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
  { when: "第一个早晨", text: "记录了起床困难，完成了洗脸和喝水。" },
  { when: "几天后的午饭前", text: "主动记录“没胃口”，晚饭由家长陪着吃了一半。" },
  { when: "复诊前一晚", text: "回看了两周的睡眠、饮食和情绪波动。" },
];
const timelineBrief = [
  { when: "作息", text: "早晨启动困难集中在上学日前，周末波动较小。" },
  { when: "饮食", text: "午餐缺失较多，晚餐相对稳定，可继续观察食欲变化。" },
  { when: "复诊参考", text: "未生成诊断结论，只整理可带给医生和咨询师的生活状态线索。" },
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
              { key: "user", label: "小晨视角" },
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
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas"
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
    const text = value.trim();
    if (!text || loading) return;

    setLoading(true);
    setTimeout(() => {
      const riskPattern = /自杀|自残|割腕|跳楼|不想活|想死|死掉|结束生命|活不下去/;
      if (riskPattern.test(text)) {
        setReply(
          "这已经超过在呀能单独陪伴的范围。请立刻联系身边可信赖的大人、医生，或拨打当地急救电话 / 心理援助热线。现在先不要独处。"
        );
      } else {
        setReply(
          `我先记下：“${text}”。今天不急着解决全部问题，只先做一个最小动作：喝一口水、坐起来 2 分钟，或告诉家长“我现在需要慢一点”。这条会进入今晚的生活记录。`
        );
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex h-full flex-col bg-canvas px-6 pt-14">
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        验证点
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">
        输入一句今天最真实的状态，在呀会把它整理成一个很小的下一步。
      </p>

      {/* 在在动画 */}
      <div className="flex flex-1 items-center justify-center">
        <ZaizaiRive className="h-40 w-40" />
      </div>

      {/* 回复（浮在场景里） */}
      {reply && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-center text-[14px] leading-relaxed text-ink"
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
            placeholder="比如：我今天还是不想出门…"
            disabled={loading || !!reply}
            className="flex-1 bg-transparent px-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={loading || !!reply || !value.trim()}
            aria-label="发送"
            className="grid h-9 w-9 place-items-center rounded-lg bg-[#FC591B] text-canvas transition-opacity disabled:opacity-30"
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
      <ZaizaiRive className="h-40 w-40" />
      <p className="text-center text-[16px] leading-relaxed text-ink">
        在呀不替代医生或咨询师。它把起床、吃饭、睡眠、情绪波动这些生活节点留下来，让下一次复诊或沟通前，状态更容易被看见。
      </p>
      <div className="flex w-full flex-col gap-2">
        <button
          onClick={onRestart}
          className="w-full rounded-lg bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas"
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
