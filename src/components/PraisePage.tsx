import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import {
  PRAISE_EXAMPLES,
  PRAISE_MAX_LENGTH,
  buildTimeLabel,
  createCard,
  loadCards,
  saveCards,
  type PraiseCard,
} from "@/data/praise";

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

export default function PraisePage({ onBack }: Props) {
  const [layer, setLayer] = useState<Layer>("home");
  // 按 createdAt 倒序：最新在最上方
  const [cards, setCards] = useState<PraiseCard[]>([]);
  // 详情页查看的卡片
  const [detailId, setDetailId] = useState<string | null>(null);

  // 初始加载 localStorage
  useEffect(() => {
    setCards(loadCards());
  }, []);

  // 写入 localStorage
  const persist = (next: PraiseCard[]) => {
    setCards(next);
    saveCards(next);
  };

  const goHome = () => setLayer("home");

  // 保存新卡片：插入最上方 + 返回主页
  const handleSave = (text: string) => {
    const card = createCard(text);
    persist([card, ...cards]);
    setLayer("home");
  };

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
    <div className="relative h-full w-full overflow-hidden bg-canvas">
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
    </div>
  );
}

/* =========================================================
 * HomeView —— 主页：卡片流 + 悬浮「+」
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
    <div className="relative flex h-full flex-col bg-canvas">
      {/* 顶部：返回 + 标题 + 副标题 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-1">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          夸夸自己
        </h2>
      </div>
      <p className="px-5 pb-3 text-[13px] leading-relaxed text-ink-faint">
        把今天一点点好的东西留下来。
      </p>

      {/* 卡片流 */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-1">
        {isEmpty ? (
          <EmptyState onCreate={onCreate} />
        ) : (
          <div className="flex flex-col gap-3">
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
      </div>

      {/* 悬浮「+」按钮：右下角，轻量 */}
      <button
        onClick={onCreate}
        aria-label="新建夸夸"
        className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)] transition-colors hover:border-ink-faint hover:text-ink"
      >
        <Plus className="h-5 w-5" strokeWidth={1.8} />
      </button>
    </div>
  );
}

/* —— 空状态卡片：可点击进入新建页 —— */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <button
      onClick={onCreate}
      className="mt-6 w-full rounded-2xl border border-dashed border-line bg-white/50 px-6 py-10 text-center transition-colors hover:border-ink-faint"
    >
      <p className="text-[14px] font-medium text-ink-soft">还没有留下夸夸。</p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">
        可以很小，比如：今天看到一朵很好看的云。
      </p>
    </button>
  );
}

/* —— 单张卡片：居中一句话 + 时间 —— */
function CardItem({
  card,
  index,
  onClick,
}: {
  card: PraiseCard;
  index: number;
  onClick: () => void;
}) {
  const timeLabel = buildTimeLabel(new Date(card.createdAt));
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease, delay: Math.min(index * 0.04, 0.3) }}
      onClick={onClick}
      className="w-full rounded-2xl border border-line bg-white px-6 py-7 text-left shadow-[0_2px_14px_-8px_rgba(0,0,0,0.08)] transition-colors hover:border-ink-faint"
    >
      <p className="text-[15.5px] leading-relaxed text-ink">{card.text}</p>
      <p className="mt-4 text-[11.5px] text-ink-faint">{timeLabel}</p>
    </motion.button>
  );
}

/* =========================================================
 * EditView —— 新建卡片页：可编辑卡片 + 示例句
 * ======================================================= */
function EditView({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = value.trim();
  const isEmpty = trimmed.length === 0;
  const tooLong = value.length > PRAISE_MAX_LENGTH;
  const canSave = !isEmpty && !tooLong;

  const submit = () => {
    setTouched(true);
    if (!canSave) return;
    onSave(trimmed);
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      {/* 顶部：返回 + 标题 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回主页"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          新建夸夸
        </h2>
      </div>

      {/* 可滚动主体 */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <p className="text-[14px] leading-relaxed text-ink">
          写一句今天可以留下的话。
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">
          不一定要夸自己，也可以是你看到的好东西、别人给你的一点善意。
        </p>

        {/* 可编辑卡片：用户直接在卡片里编辑 */}
        <div className="mt-6 rounded-2xl border border-line bg-white px-6 py-7 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.08)]">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="比如：今天看到一朵很好看的云。"
            autoFocus
            rows={3}
            className="w-full resize-none bg-transparent text-[15.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
          />
          {/* 字数计数：接近上限时显示 */}
          {value.length > PRAISE_MAX_LENGTH - 10 && (
            <p
              className={`mt-3 text-right text-[11px] ${
                tooLong ? "text-[#B7583F]" : "text-ink-faint"
              }`}
            >
              {value.length} / {PRAISE_MAX_LENGTH}
            </p>
          )}
        </div>

        {/* 轻提示：空 / 过长 */}
        <div className="mt-3 min-h-[18px]">
          {touched && isEmpty && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] leading-relaxed text-ink-faint"
            >
              先写几个字就可以。
            </motion.p>
          )}
          {tooLong && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] leading-relaxed text-[#B7583F]"
            >
              这一张卡片短一点就好。
            </motion.p>
          )}
        </div>

        {/* 轻量示例句：纵向展示，点击填入 */}
        <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          可以照着写
        </p>
        <div className="mt-2.5 flex flex-col gap-2">
          {PRAISE_EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setValue(ex);
                setTouched(true);
              }}
              className="rounded-xl border border-line bg-white px-4 py-3 text-left text-[13.5px] leading-relaxed text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* 底部保存按钮 */}
      <div className="px-5 pb-8">
        <button
          onClick={submit}
          disabled={!canSave}
          className="w-full rounded-xl bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas transition-opacity disabled:opacity-30"
        >
          保存
        </button>
      </div>
    </div>
  );
}

/* =========================================================
 * DetailView —— 卡片详情页：全屏沉浸 + 轻呼吸动效
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
      <div className="flex h-full items-center justify-center bg-canvas">
        <p className="text-[13px] text-ink-faint">这张已经不在了。</p>
      </div>
    );
  }

  const timeLabel = buildTimeLabel(new Date(card.createdAt));

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      {/* 顶部：返回 + 删除 */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回主页"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setConfirming(true)}
          aria-label="删除"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>

      {/* 主体：大卡片 + 呼吸圆圈 */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {/* 大卡片展示用户原文 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="w-full rounded-2xl border border-line bg-white px-7 py-8 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)]"
        >
          <p className="text-[18px] leading-relaxed text-ink">{card.text}</p>
          <p className="mt-5 text-[12px] text-ink-faint">{timeLabel}</p>
        </motion.div>

        {/* 轻呼吸动效：缓慢放大缩小的圆圈 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease }}
          className="mt-12"
        >
          <motion.div
            animate={{ scale: [0.85, 1.1, 0.85] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-20 w-20 rounded-full border border-line bg-white/60"
          />
        </motion.div>

        {/* 提示文案 */}
        <p className="mt-8 text-[13px] leading-relaxed text-ink-faint">
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
          <div className="mt-2 text-[13px] leading-relaxed text-ink-faint">
            删除后就不能再看见了。
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full rounded-xl py-3 text-[15px] font-medium text-white transition-transform active:scale-[0.98]"
            style={{ backgroundColor: "#C9A0A0" }}
          >
            删除
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl bg-line-soft py-3 text-[15px] text-ink-soft transition-colors hover:bg-line"
          >
            取消
          </button>
        </div>
      </motion.div>
    </>
  );
}
