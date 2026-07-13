/* —— 确认沟通重点 ——
 * 时间范围并入本页顶部，通过底部面板修改
 * 5 条 Mock 沟通重点默认全部选中
 * 支持：选择/取消、修改、查看依据（不支持删除）
 * 底部动态显示「确认这 N 条」 */
import { forwardRef, useState } from "react";
import { ChevronLeft, Pencil, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  recomputeTopicPermissions,
  getCoverage,
  RANGE_OPTIONS,
  type CommunicationSession,
  type CommunicationTopic,
  type RangeKey,
} from "@/data/organize";
import {
  PrimaryButton,
  BottomSheet,
  SourceTag,
  StepProgress,
} from "./shared";

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  session: CommunicationSession;
  onBack: (topics: CommunicationTopic[], rangeData: { rangeKey: RangeKey; startDate: string; endDate: string; totalDays: number; recordedDays: number }) => void;
  onNext: (topics: CommunicationTopic[], rangeData: { rangeKey: RangeKey; startDate: string; endDate: string; totalDays: number; recordedDays: number }) => void;
}

export default function TopicsStep({ session, onBack, onNext }: Props) {
  const [topics, setTopics] = useState<CommunicationTopic[]>(
    session.communicationTopics,
  );
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(
    new Set(),
  );
  const [editingTopic, setEditingTopic] = useState<CommunicationTopic | null>(
    null,
  );
  const [addingTopic, setAddingTopic] = useState(false);
  const [showRangeSheet, setShowRangeSheet] = useState(false);
  const [rangeKey, setRangeKey] = useState<RangeKey>(session.rangeKey);
  const [rangeData, setRangeData] = useState({
    rangeKey: session.rangeKey,
    startDate: session.startDate,
    endDate: session.endDate,
    totalDays: session.totalDays,
    recordedDays: session.recordedDays,
  });

  const name = session.contactSnapshot.displayName;
  const visibleTopics = topics;
  const selectedCount = visibleTopics.filter((t) => t.selected).length;
  const canProceed = selectedCount >= 1;

  const toggleSelect = (id: string) => {
    setTopics((prev) =>
      recomputeTopicPermissions(
        prev.map((t) =>
          t.id === id ? { ...t, selected: !t.selected } : t,
        ),
      ),
    );
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveEdit = (id: string, title: string, content: string) => {
    setTopics((prev) =>
      recomputeTopicPermissions(
        prev.map((t) =>
          t.id === id
            ? { ...t, title, content, edited: true }
            : t,
        ),
      ),
    );
    setEditingTopic(null);
  };

  const handleAddTopic = (title: string, content: string) => {
    const newTopic: CommunicationTopic = {
      id: `user-${Date.now()}`,
      title,
      content,
      sourceType: "user_added",
      evidenceSummary: ["用户主动表达的问题"],
      selected: true,
      edited: false,
      allowedInMaterial: true,
    };
    setTopics((prev) => [...prev, newTopic]);
    setAddingTopic(false);
  };

  const handleRangeSelect = (key: RangeKey) => {
    const cov = getCoverage(key);
    setRangeKey(key);
    setRangeData({
      rangeKey: key,
      startDate: cov.startDate,
      endDate: cov.endDate,
      totalDays: cov.totalDays,
      recordedDays: cov.recordedDays,
    });
    setShowRangeSheet(false);
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={() => onBack(topics, rangeData)}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[18px] font-medium leading-relaxed tracking-tight text-ink">
          和{name}的沟通
        </h1>
      </div>

      <StepProgress current={1} total={2} />

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 任务标题 */}
        <h2 className="mt-4 text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
          这次想和{name}聊什么？
        </h2>

        {/* 时间范围信息 */}
        <div className="mt-3 rounded-xl bg-surface-soft/40 px-4 py-3">
          <div className="text-[13px] font-medium text-ink">
            {formatRangeChinese(rangeData.startDate)}—{formatRangeChinese(rangeData.endDate)}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[12px] text-ink-faint">
              {rangeData.totalDays} 天中有 {rangeData.recordedDays} 天留下记录
            </span>
            <button
              onClick={() => setShowRangeSheet(true)}
              className="text-[12px] text-accent transition-opacity active:opacity-70"
            >
              修改范围
            </button>
          </div>
        </div>

        {/* 沟通重点卡片 */}
        <div className="relative mt-3 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {visibleTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                expanded={expandedEvidence.has(topic.id)}
                onToggleSelect={() => toggleSelect(topic.id)}
                onToggleEvidence={() => toggleEvidence(topic.id)}
                onEdit={() => setEditingTopic(topic)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 补充一条 */}
        <button
          onClick={() => setAddingTopic(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-soft/20 px-4 py-3.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-soft/40"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          补充一条
        </button>
      </div>

      {/* 底部按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <PrimaryButton
          onClick={() => onNext(topics, rangeData)}
          disabled={!canProceed}
        >
          确认这 {selectedCount} 条
        </PrimaryButton>
      </div>

      {/* 时间范围面板 */}
      <AnimatePresence>
        {showRangeSheet && (
          <BottomSheet onClose={() => setShowRangeSheet(false)}>
            <div className="text-[16px] font-semibold text-ink">修改时间范围</div>
            <div className="mt-4 flex flex-col gap-2.5">
              {RANGE_OPTIONS.map((opt) => {
                const cov = getCoverage(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleRangeSelect(opt.value)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ${
                      rangeKey === opt.value
                        ? "border-action-primary bg-action-soft"
                        : "border-line bg-white hover:bg-surface-soft/30"
                    }`}
                  >
                    <div>
                      <div className="text-[14px] font-medium text-ink">
                        {opt.label}
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-faint">
                        {cov.startDate} — {cov.endDate}
                      </div>
                    </div>
                    {rangeKey === opt.value && (
                      <Check className="h-4 w-4 text-action-primary" strokeWidth={2.4} />
                    )}
                  </button>
                );
              })}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* 编辑面板 */}
      <AnimatePresence>
        {editingTopic && (
          <EditSheet
            topic={editingTopic}
            onSave={(title, content) =>
              handleSaveEdit(editingTopic.id, title, content)
            }
            onClose={() => setEditingTopic(null)}
          />
        )}
      </AnimatePresence>

      {/* 补充面板 */}
      <AnimatePresence>
        {addingTopic && (
          <AddSheet
            onSave={handleAddTopic}
            onClose={() => setAddingTopic(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 日期中文格式 —— */
function formatRangeChinese(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${Number(parts[1])} 月 ${Number(parts[2])} 日`;
}

/* =========================================================
 * 沟通重点卡片
 * ======================================================= */
interface TopicCardProps {
  topic: CommunicationTopic;
  expanded: boolean;
  onToggleSelect: () => void;
  onToggleEvidence: () => void;
  onEdit: () => void;
}

const TopicCard = forwardRef<HTMLDivElement, TopicCardProps>(function TopicCard({
  topic,
  expanded,
  onToggleSelect,
  onToggleEvidence,
  onEdit,
}, ref) {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease }}
      className={`relative overflow-hidden rounded-2xl border bg-white transition-colors ${
        topic.selected
          ? "border-action-primary"
          : "border-line"
      }`}
    >
      {/* 卡片主体（点击切换选择） */}
      <button
        onClick={onToggleSelect}
        className="flex w-full items-start gap-3 px-4 pt-4 text-left"
      >
        <span
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition-colors ${
            topic.selected
              ? "border-action-primary bg-action-primary"
              : "border-line bg-white"
          }`}
        >
          {topic.selected && (
            <Check className="h-3 w-3 text-action-primary-text" strokeWidth={2.4} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-ink">
              {topic.title}
            </span>
            <SourceTag sourceType={topic.sourceType} />
            {topic.edited && (
              <span className="text-[10px] text-ink-faint">已编辑</span>
            )}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            {topic.content}
          </p>
        </div>
      </button>

      {/* 操作栏 */}
      <div className="mt-3 flex items-center justify-end gap-1 px-4 pb-1">
        <button
          onClick={onToggleEvidence}
          className="rounded-lg px-2.5 py-1.5 text-[12px] text-ink-faint transition-colors hover:bg-surface-soft"
        >
          {expanded ? "收起依据" : "查看依据"}
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-ink-faint transition-colors hover:bg-surface-soft"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.8} />
          修改
        </button>
      </div>

      {/* 依据展开区 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-4 rounded-xl bg-surface-soft/50 px-3.5 py-3">
              <div className="text-[11px] font-medium text-ink-faint">
                依据摘要
              </div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {topic.evidenceSummary.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[12px] leading-relaxed text-ink-soft"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

/* =========================================================
 * 编辑 / 补充面板
 * ======================================================= */
function EditSheet({
  topic,
  onSave,
  onClose,
}: {
  topic: CommunicationTopic;
  onSave: (title: string, content: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(topic.title);
  const [content, setContent] = useState(topic.content);

  return (
    <BottomSheet onClose={onClose}>
      <div className="text-[16px] font-semibold text-ink">修改沟通重点</div>
      <div className="mt-4">
        <label className="text-[12px] text-ink-faint">想说的事</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-action-primary"
          placeholder="简要标题"
        />
      </div>
      <div className="mt-3">
        <label className="text-[12px] text-ink-faint">具体想说</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-action-primary"
          placeholder="具体说明"
        />
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
        >
          取消
        </button>
        <button
          onClick={() => onSave(title.trim() || topic.title, content.trim())}
          className="flex-1 rounded-xl bg-action-primary py-3 text-[13px] font-medium text-action-primary-text"
        >
          保存
        </button>
      </div>
    </BottomSheet>
  );
}

function AddSheet({
  onSave,
  onClose,
}: {
  onSave: (title: string, content: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const canSave = title.trim().length > 0 && content.trim().length > 0;

  return (
    <BottomSheet onClose={onClose}>
      <div className="text-[16px] font-semibold text-ink">补充一条</div>
      <p className="mt-1 text-[12px] text-ink-faint">
        填写系统未整理出的内容，将标记为「本人补充」。
      </p>
      <div className="mt-4">
        <label className="text-[12px] text-ink-faint">想说的事</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-action-primary"
          placeholder="简要标题"
          autoFocus
        />
      </div>
      <div className="mt-3">
        <label className="text-[12px] text-ink-faint">具体想说</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-action-primary"
          placeholder="具体说明"
        />
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
        >
          取消
        </button>
        <button
          onClick={() => canSave && onSave(title.trim(), content.trim())}
          disabled={!canSave}
          className="flex-1 rounded-xl bg-action-primary py-3 text-[13px] font-medium text-action-primary-text disabled:opacity-30"
        >
          添加
        </button>
      </div>
    </BottomSheet>
  );
}
