/* —— 步骤 3/5：确认沟通重点 ——
 * 5 条系统整理结果卡片：选择/编辑/查看依据/删除
 * 「补充一条」：用户新增沟通重点，标记「本人补充」
 * 至少选择 1 条才能继续 */
import { useState } from "react";
import { ChevronLeft, Pencil, Trash2, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  recomputeTopicPermissions,
  type CommunicationSession,
  type CommunicationTopic,
} from "@/data/organize";
import {
  StepProgress,
  PrimaryButton,
  BottomSheet,
  SourceTag,
} from "./shared";

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onNext: (topics: CommunicationTopic[]) => void;
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
  const [deleteConfirm, setDeleteConfirm] = useState<CommunicationTopic | null>(
    null,
  );

  const visibleTopics = topics.filter((t) => !t.deleted);
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

  const handleDelete = (topic: CommunicationTopic) => {
    setTopics((prev) =>
      recomputeTopicPermissions(
        prev.map((t) =>
          t.id === topic.id ? { ...t, deleted: true, selected: false } : t,
        ),
      ),
    );
    setDeleteConfirm(null);
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
      deleted: false,
      allowedInMaterial: true,
    };
    setTopics((prev) => [...prev, newTopic]);
    setAddingTopic(false);
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">
          本次希望和{session.targetLabel}讨论什么？
        </h1>
      </div>
      <StepProgress current={3} total={5} />

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          选择需要放入本次沟通材料的内容，也可以修改或补充。
        </p>

        {/* 沟通重点卡片 */}
        <div className="mt-5 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {visibleTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                expanded={expandedEvidence.has(topic.id)}
                onToggleSelect={() => toggleSelect(topic.id)}
                onToggleEvidence={() => toggleEvidence(topic.id)}
                onEdit={() => setEditingTopic(topic)}
                onDelete={() => setDeleteConfirm(topic)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 补充一条 */}
        <button
          onClick={() => setAddingTopic(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-card-soft/20 px-4 py-3.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-card-soft/40"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          补充一条
        </button>

        {selectedCount > 0 && (
          <div className="mt-4 text-center text-[12px] text-ink-faint">
            已选择 {selectedCount} 项
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <PrimaryButton
          onClick={() => onNext(topics)}
          disabled={!canProceed}
        >
          下一步
        </PrimaryButton>
      </div>

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

      {/* 删除确认 */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteConfirmSheet
            topicTitle={deleteConfirm.title}
            onConfirm={() => handleDelete(deleteConfirm)}
            onClose={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * 沟通重点卡片
 * ======================================================= */
function TopicCard({
  topic,
  expanded,
  onToggleSelect,
  onToggleEvidence,
  onEdit,
  onDelete,
}: {
  topic: CommunicationTopic;
  expanded: boolean;
  onToggleSelect: () => void;
  onToggleEvidence: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease }}
      className={`rounded-2xl border transition-colors ${
        topic.selected
          ? "border-accent bg-accent-soft/40"
          : "border-line bg-white"
      }`}
    >
      {/* 卡片主体（点击切换选择） */}
      <button
        onClick={onToggleSelect}
        className="flex w-full items-start gap-3 px-4 pt-4 text-left"
      >
        {/* 选中标记 */}
        <span
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition-colors ${
            topic.selected
              ? "border-accent bg-accent"
              : "border-line bg-white"
          }`}
        >
          {topic.selected && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </span>

        {/* 标题 + 来源 */}
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
          className="rounded-lg px-2.5 py-1.5 text-[12px] text-ink-faint transition-colors hover:bg-line-soft"
        >
          {expanded ? "收起依据" : "查看依据"}
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-ink-faint transition-colors hover:bg-line-soft"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.8} />
          编辑
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-ink-faint transition-colors hover:bg-line-soft"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.8} />
          删除
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
            <div className="mx-4 mb-4 rounded-xl bg-card-soft/50 px-3.5 py-3">
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
}

/* =========================================================
 * 编辑 / 补充 / 删除确认面板
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
      <div className="text-[16px] font-semibold text-ink">编辑沟通重点</div>
      <div className="mt-4">
        <label className="text-[12px] text-ink-faint">标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          placeholder="简要标题"
        />
      </div>
      <div className="mt-3">
        <label className="text-[12px] text-ink-faint">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-accent"
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
        <label className="text-[12px] text-ink-faint">标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          placeholder="简要标题"
          autoFocus
        />
      </div>
      <div className="mt-3">
        <label className="text-[12px] text-ink-faint">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-accent"
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
          onClick={() =>
            canSave && onSave(title.trim(), content.trim())
          }
          disabled={!canSave}
          className="flex-1 rounded-xl bg-action-primary py-3 text-[13px] font-medium text-action-primary-text disabled:opacity-30"
        >
          添加
        </button>
      </div>
    </BottomSheet>
  );
}

function DeleteConfirmSheet({
  topicTitle,
  onConfirm,
  onClose,
}: {
  topicTitle: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet onClose={onClose}>
      <div className="text-[16px] font-semibold text-ink">删除这条沟通重点？</div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        删除后不会出现在本次沟通材料中。此操作不可撤销。
      </p>
      <div className="mt-2 rounded-lg bg-card-soft/40 px-3 py-2 text-[12px] text-ink-faint">
        {topicTitle}
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-ink py-3 text-[13px] font-medium text-action-deep-text"
        >
          确认删除
        </button>
      </div>
    </BottomSheet>
  );
}
