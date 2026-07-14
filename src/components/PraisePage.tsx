import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import {
  PRAISE_MAX_LENGTH,
  buildTimeLabel,
  createCard,
  getGradient,
  loadCards,
  randomGradientId,
  randomGuideText,
  resolveGradientId,
  saveCards,
  type PraiseCard,
} from "@/data/praise";
import { grantEnergy } from "@/data/userProfile";
import { getStorageMode } from "@/shared/storage/namespacedStorage";
import { getXiaochenPraiseCards } from "@/apps/experience/selectors/selectPraiseCards";
import ZaizaiVideo from "./ZaizaiVideo";
import VoiceInputBar from "./VoiceInputBar";
import EnergyBadge from "./EnergyBadge";
import EnergyRewardFeedback, {
  type EnergyRewardEvent,
} from "./EnergyRewardFeedback";

/* —— 体验模式数据源切换（仅切换数据注入，不改变 UI/布局/交互）——
 * 体验模式首次进入「夸夸自己」时预填小晨统一夸夸卡（6 张，可追溯时间线事件）；
 * 演示模式保持原有空态加载行为。 */
const IS_EXPERIENCE_MODE = getStorageMode() === "experience";

/* —— 体验模式预填：首次加载（无 xc-praise- 种子卡）时种子化 6 张夸夸卡 ——
 * 幂等保证：若存储中已存在 xc-praise- 前缀 id 则不再写入，避免重复种子化。
 * 不覆盖用户后续新增 / 编辑 / 删除的卡片。
 * 顺序：PraisePage 不变量为「按 createdAt 倒序」——最新在最上方。
 *   种子卡原始数组为升序，需先反转再合并；用户已有自定义卡片保留在更上方。 */
function seedExperiencePraiseCardsIfEmpty(): PraiseCard[] {
  const stored = loadCards();
  if (!IS_EXPERIENCE_MODE) return stored;
  const hasSeed = stored.some((c) => c.id.startsWith("xc-praise-"));
  if (hasSeed) return stored;
  const seeded = getXiaochenPraiseCards().reverse();
  // 用户已有自定义卡片放前面（保持其在最上方），种子卡按倒序追加
  const merged = [...stored, ...seeded];
  saveCards(merged);
  return merged;
}

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 「夸夸自己」本地状态机 ——
 * 三层：home → edit → detail
 *
 * 定位：把今天一点点好的东西留下来，像一个安静的私人卡片库。
 *   - 不做分类、不做筛选、不做连续打卡、不做积分 / 徽章
 *   - 不生成 AI 抽象夸奖；用户写什么，卡片就保存什么
 *   - 所有卡片默认私密
 *
 * 全程本地 mock + localStorage 持久化，不接后端 / LLM。 */
type Layer = "home" | "edit" | "detail";

type Props = {
  /** 返回 more 侧边栏 */
  onBack: () => void;
};

/* —— 首页在在气泡轮播示例句 ——
 * 在在通过对话框说出，自动 3.5s 切换，循环。 */
const ZAIZAI_BUBBLES = [
  "可以留下一句很小的夸夸。",
  "比如：今天看到一朵很好看的云。",
  "比如：今天吃了一口饭。",
  "比如：邻居对我笑了一下。",
  "比如：今天撑到了现在。",
  "也可以写别人给你的一点善意。",
];

export default function PraisePage({ onBack }: Props) {
  const [layer, setLayer] = useState<Layer>("home");
  // 按 createdAt 倒序：最新在最上方
  const [cards, setCards] = useState<PraiseCard[]>([]);
  // 详情页查看的卡片
  const [detailId, setDetailId] = useState<string | null>(null);

  // —— 光反馈：底层仍沿用能量奖励数据 ——
  const [praiseEnergyReward, setPraiseEnergyReward] =
    useState<EnergyRewardEvent | null>(null);
  const [praiseEnergyPulse, setPraiseEnergyPulse] = useState(false);
  const praiseBadgeRef = useRef<HTMLButtonElement | null>(null);
  const praisePulseTimer = useRef<number | null>(null);
  const praiseRewardIdRef = useRef(0);

  // 初始加载 localStorage（体验模式：首次加载时种子化小晨统一夸夸卡）
  useEffect(() => {
    setCards(seedExperiencePraiseCardsIfEmpty());
  }, []);

  // 写入 localStorage
  const persist = (next: PraiseCard[]) => {
    setCards(next);
    saveCards(next);
  };

  const goHome = () => setLayer("home");

  // 保存新卡片：插入最上方 + 返回主页 + 触发能量奖励
  // 仅在创建成功后发放；同一张卡片只奖励一次（grantEnergy 幂等校验）
  const handleSave = (
    text: string,
    gradientId: string,
    guideText: string,
  ) => {
    const card = createCard(text, gradientId, guideText);
    persist([card, ...cards]);
    setLayer("home");

    // 触发光反馈：以卡片唯一 ID 做幂等校验
    const result = grantEnergy({
      source: "praise_card_created",
      sourceId: card.id,
    });
    if (result.granted) {
      praiseRewardIdRef.current += 1;
      setPraiseEnergyReward({
        id: praiseRewardIdRef.current,
        occurredAt: Date.now(),
      });
    }
  };

  const handlePraiseEnergyArrive = useCallback(() => {
    setPraiseEnergyPulse(true);
    if (praisePulseTimer.current)
      window.clearTimeout(praisePulseTimer.current);
    praisePulseTimer.current = window.setTimeout(() => {
      setPraiseEnergyPulse(false);
      praisePulseTimer.current = null;
    }, 420);
  }, []);

  // toast 整段动画结束：清空 event
  const handlePraiseEnergyDone = useCallback(() => {
    setPraiseEnergyReward(null);
  }, []);

  useEffect(() => {
    return () => {
      if (praisePulseTimer.current)
        window.clearTimeout(praisePulseTimer.current);
    };
  }, []);

  // 进入详情页
  const openDetail = (id: string) => {
    setDetailId(id);
    setLayer("detail");
  };

  // 删除卡片（详情页触发）
  const handleDelete = (id: string) => {
    persist(cards.filter((c) => c.id !== id));
    setDetailId(null);
    setLayer("home");
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={layer}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.28, ease }}
          className="absolute inset-0"
        >
          {layer === "home" && (
            <HomeView
              cards={cards}
              onBack={onBack}
              onOpenDetail={openDetail}
              onCreate={() => setLayer("edit")}
            />
          )}
          {layer === "edit" && (
            <EditView onBack={goHome} onSave={handleSave} />
          )}
          {layer === "detail" && detailId && (
            <DetailView
              card={cards.find((c) => c.id === detailId) ?? null}
              onBack={goHome}
              onDelete={handleDelete}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 右上角我的光入口：仅模块主页展示；写入 / 详情态保持专注，不常驻入口。 */}
      {layer === "home" && (
        <EnergyBadge
          pulse={praiseEnergyPulse}
          buttonRef={praiseBadgeRef}
          position="floating"
        />
      )}
      {/* 光反馈：保存有效卡片后飞向右上角入口 */}
      <EnergyRewardFeedback
        event={praiseEnergyReward}
        targetRef={praiseBadgeRef}
        onArrive={handlePraiseEnergyArrive}
        onDone={handlePraiseEnergyDone}
      />
    </div>
  );
}

/* =========================================================
 * HomeView —— 主页：在在引导区 + 双列瀑布流 + 悬浮「+」
 * 首页先是一个有在在陪着的小卡片库，而不是单纯的卡片列表。
 * ======================================================= */
function HomeView({
  cards,
  onBack,
  onOpenDetail,
  onCreate,
}: {
  cards: PraiseCard[];
  onBack: () => void;
  onOpenDetail: (id: string) => void;
  onCreate: () => void;
}) {
  const isEmpty = cards.length === 0;

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部：返回 + 标题（右上角我的光入口由 PraisePage 根级 floating EnergyBadge 承载） */}
      <header className="flex items-center gap-3 px-5 pt-14 pb-1">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          夸夸自己
        </h2>
      </header>

      {/* 在在引导区：固定高度，避免气泡轮播时带动动画和 feed 漂移。 */}
      <section className="relative z-20 h-[96px] shrink-0 overflow-visible px-5">
        <div className="absolute left-1/2 top-4 flex h-[88px] w-[188px] -translate-x-1/2 items-start justify-between overflow-visible">
          <div className="relative h-[88px] w-[72px] shrink-0 overflow-visible">
            <div className="absolute left-[46%] top-1 h-[88px] w-[88px] -translate-x-1/2 scale-[1.08] overflow-visible">
              <ZaizaiVideo className="h-full w-full" />
            </div>
          </div>
          <ZaizaiBubble items={ZAIZAI_BUBBLES} />
        </div>
      </section>

      {/* Feed 顶部渐隐：参考对话页消息区，让卡片上滑时自然隐入引导区。 */}
      <div className="pointer-events-none absolute inset-x-0 top-[170px] z-[15] h-24 bg-gradient-to-b from-white via-white/95 to-white/0" />

      {/* 卡片 Feed：双列瀑布流，与引导区保持 24px 间距 */}
      <section className="no-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-6">
        {isEmpty ? (
          <p className="mt-8 text-center text-[12.5px] leading-relaxed text-ink-faint/70">
            还没有留下夸夸。
          </p>
        ) : (
          <div className="columns-2 gap-3">
            {cards.map((c, i) => (
              <CardItem
                key={c.id}
                card={c}
                index={i}
                onClick={() => onOpenDetail(c.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 悬浮「+」按钮：右下角，轻量 */}
      <button
        onClick={onCreate}
        aria-label="新建夸夸"
        className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-action-primary bg-action-primary text-action-primary-text shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)] transition-opacity hover:opacity-90"
      >
        <Plus className="h-5 w-5" strokeWidth={2.4} />
      </button>
    </div>
  );
}

/* —— 在在说话气泡：复用「记一下」气泡样式，自动 3.5s 轮播 ——
 * 左右结构下，气泡小尾巴指向左侧的在在。
 * 进入新建页（组件卸载）时自动清理 interval。 */
function ZaizaiBubble({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="relative h-[52px] w-[120px] shrink-0 pt-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease }}
          className="absolute inset-x-0 top-2"
        >
          {/* 气泡主体：偏方正、轻圆角 */}
          <div className="relative min-h-[42px] rounded-lg bg-surface-soft px-3 py-2">
            <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
              {items[index]}
            </p>
            {/* 小尾巴：指向左侧的在在 */}
            <div className="absolute -left-1.5 top-3">
              <svg
                width="8"
                height="12"
                viewBox="0 0 8 12"
                fill="none"
                className="text-surface-soft"
              >
                <path d="M0 6L8 0v12L0 6z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* —— 单张卡片：Tolan Library 风格竖卡 ——
 * 矩形竖卡、大圆角、柔和渐变背景、文字居中、日期弱化到底部。
 * 双列下约占内容区 48%，min-h-[150px] 保证竖向卡片感。 */
function CardItem({
  card,
  index,
  onClick,
}: {
  card: PraiseCard;
  index: number;
  onClick: () => void;
}) {
  const gradient = getGradient(resolveGradientId(card));
  const timeLabel = buildTimeLabel(new Date(card.createdAt));

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease, delay: Math.min(index * 0.04, 0.3) }}
      onClick={onClick}
      className="mb-3 flex min-h-[150px] w-full flex-col justify-between break-inside-avoid rounded-3xl p-5 text-left transition-transform hover:scale-[1.02]"
      style={{
        background: `linear-gradient(140deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* 主体文字：垂直居中 */}
      <div className="flex flex-1 items-center justify-center py-3">
        <p className="text-center text-[14.5px] leading-relaxed text-ink">
          {card.text}
        </p>
      </div>
      {/* 日期弱化到底部 */}
      <p className="text-center text-[11px] text-ink/40">{timeLabel}</p>
    </motion.button>
  );
}

/* =========================================================
 * EditView —— 全屏沉浸式卡片编辑
 * 整个内容区即一张渐变卡片；不滚动、无标题/说明/示例列表/底部大按钮。
 * 结构：左上返回 / 右上保存 / 中央 textarea / 右下 mic
 * 注：在在引导主体在首页，新建页不再放小在在，避免视觉竞争与小橙点问题。
 *
 * 随机色与引导词：进入新建页时各随机一次（useState 初始化器仅执行一次），
 * 输入、重渲染、保存过程中保持不变，保存时写入卡片数据结构。
 * ======================================================= */
function EditView({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (text: string, gradientId: string, guideText: string) => void;
}) {
  // 进入新建页时随机一次，后续 re-render 不再变化
  const [gradientId] = useState(() => randomGradientId());
  const [guideText] = useState(() => randomGuideText());
  const gradient = getGradient(gradientId);

  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const hasContent = trimmed.length > 0;
  const canSave = hasContent && value.length <= PRAISE_MAX_LENGTH;

  const submit = () => {
    if (!canSave) return;
    onSave(trimmed, gradientId, guideText);
  };

  return (
    <div
      className="relative flex h-full flex-col"
      style={{
        background: `linear-gradient(140deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* 顶部：左返回 / 右保存 */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回主页"
          className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-ink-soft backdrop-blur-sm transition-colors hover:bg-white/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={submit}
          disabled={!canSave}
          className="rounded-full bg-action-primary px-4 py-1.5 text-[13px] font-medium text-action-primary-text backdrop-blur-sm transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          保存
        </button>
      </div>

      {/* 中央可编辑文字区域：引导词与输入框共用同一布局容器，定位与排版参数完全一致，
          保证引导词位置与输入文字起始位置对齐；输入后引导词立即隐藏，不产生位置跳动 */}
      <div className="praise-card-editor relative flex-1">
        {!hasContent && (
          <div className="guide-text pointer-events-none absolute left-1/2 top-1/2 min-h-[120px] w-[72%] -translate-x-1/2 -translate-y-1/2 text-center text-[18px] leading-[1.6] tracking-normal text-ink/[0.18]">
            {guideText}
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSave) submit();
          }}
          autoFocus
          rows={4}
          maxLength={PRAISE_MAX_LENGTH + 20}
          className="praise-input absolute left-1/2 top-1/2 min-h-[120px] w-[72%] -translate-x-1/2 -translate-y-1/2 resize-none border-0 bg-transparent p-0 text-center text-[18px] leading-[1.6] tracking-normal text-ink focus:outline-none"
        />
      </div>

      {/* 底部中间：轻量语音入口（compact 模式，不显示输入框） */}
      <div className="flex justify-center pb-10">
        <VoiceInputBar
          compact
          value={value}
          onChange={setValue}
          onSend={() => {}}
          canSend={false}
        />
      </div>
    </div>
  );
}

/* =========================================================
 * DetailView —— 卡片详情页：整屏渐变沉浸 + 轻呼吸动效
 * ======================================================= */
function DetailView({
  card,
  onBack,
  onDelete,
}: {
  card: PraiseCard | null;
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!card) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-[13px] text-ink-faint">这张已经不在了。</p>
      </div>
    );
  }

  const gradient = getGradient(resolveGradientId(card));
  const timeLabel = buildTimeLabel(new Date(card.createdAt));

  return (
    <div
      className="relative flex h-full flex-col"
      style={{
        background: `linear-gradient(140deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* 顶部：左返回 / 右删除 */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回主页"
          className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-ink-soft backdrop-blur-sm transition-colors hover:bg-white/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setConfirming(true)}
          aria-label="删除"
          className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-ink-faint backdrop-blur-sm transition-colors hover:bg-white/70 hover:text-ink"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* 主体：大号文字居中 */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <motion.p
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="text-center text-[20px] leading-relaxed text-ink"
        >
          {card.text}
        </motion.p>
        <p className="mt-4 text-[12px] text-ink/50">{timeLabel}</p>

        {/* 轻呼吸动效：缓慢放大缩小的圆圈 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease }}
          className="mt-14"
        >
          <motion.div
            animate={{ scale: [0.85, 1.1, 0.85] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-20 w-20 rounded-full border border-ink/20 bg-white/40 backdrop-blur-sm"
          />
        </motion.div>

        {/* 提示文案 */}
        <p className="mt-8 text-[13px] leading-relaxed text-ink/60">
          停一下，吸一口气。
        </p>
      </div>

      {/* 删除二次确认 */}
      <AnimatePresence>
        {confirming && (
          <DeleteConfirm
            onCancel={() => setConfirming(false)}
            onConfirm={() => onDelete(card.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 删除二次确认：底部确认层 —— */
function DeleteConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-[60] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}
        onClick={onCancel}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 z-[61] rounded-t-[20px] bg-white px-6 pb-8 pt-5"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="mb-5">
          <div className="text-[16px] font-semibold text-ink">
            要删掉这条夸夸吗？
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full rounded-xl py-3 text-[15px] font-medium text-white transition-transform active:scale-[0.98]"
            style={{ backgroundColor: "var(--z-risk-medium)" }}
          >
            删除
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl bg-surface-soft py-3 text-[15px] text-ink-soft transition-colors hover:bg-line"
          >
            取消
          </button>
        </div>
      </motion.div>
    </>
  );
}
