/* —— 步骤 1：选择沟通对象（模块首页）——
 * 任务感首页：主卡片（王医生）+ 弱化添加入口 + 历史记录 icon 占位
 * 点击主卡片直接进入沟通重点页 */
import { useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  loadContacts,
  addContact,
  saveContacts,
  getCoverage,
  formatDateRangeChinese,
  MOCK_TRUSTED_CONTACT_CANDIDATES,
  ROLE_OPTIONS,
  type CommunicationContact,
  type CommunicationRoleType,
} from "@/data/organize";
import { BottomSheet, Toast } from "./shared";

interface Props {
  onBack: () => void;
  onSelectContact: (contact: CommunicationContact) => void;
}

export default function ContactStep({ onBack, onSelectContact }: Props) {
  const [contacts, setContacts] = useState<CommunicationContact[]>(loadContacts());
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const handleAddFromTrusted = (candidate: (typeof MOCK_TRUSTED_CONTACT_CANDIDATES)[number]) => {
    const newContact: CommunicationContact = {
      id: `contact-${Date.now()}`,
      displayName: candidate.displayName,
      roleType: candidate.roleType,
      roleLabel: candidate.roleLabel,
      source: "trusted_contact",
      trustedContactId: candidate.id,
      createdAt: Date.now(),
    };
    setContacts(addContact(newContact));
    setShowAddSheet(false);
    showToast("已添加沟通对象");
  };

  const handleAddNew = (displayName: string, roleType: CommunicationRoleType) => {
    const roleOption = ROLE_OPTIONS.find((r) => r.value === roleType);
    const newContact: CommunicationContact = {
      id: `contact-${Date.now()}`,
      displayName,
      roleType,
      roleLabel: roleOption?.label ?? "其他",
      source: "organize_added",
      createdAt: Date.now(),
    };
    setContacts(addContact(newContact));
    setShowAddSheet(false);

    if (!roleOption?.available) {
      showToast("该沟通场景暂未开放");
    } else {
      showToast("已添加沟通对象");
    }
  };

  const handleDeleteContact = (id: string) => {
    const next = contacts.filter((c) => c.id !== id);
    saveContacts(next);
    setContacts(next);
    showToast("已删除沟通对象");
  };

  // 默认时间范围信息（主卡片展示）
  const defaultRange = getCoverage("custom");

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="返回"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight text-ink">
            准备和谁沟通？
          </h1>
        </div>
        <button
          type="button"
          disabled
          aria-label="历史记录暂未开放"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-faint"
        >
          <Clock className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 主沟通对象卡片 */}
        <div className="mt-6 flex flex-col gap-3">
          {contacts.map((contact) => (
            <SwipeableContactCard
              key={contact.id}
              contact={contact}
              rangeLabel={`${formatDateRangeChinese(defaultRange.startDate, defaultRange.endDate)} · ${defaultRange.recordedDays} 天记录可整理`}
              onSelect={() => onSelectContact(contact)}
              onDelete={() => handleDeleteContact(contact.id)}
            />
          ))}
        </div>

        {/* 添加沟通对象（弱化次级入口） */}
        <button
          onClick={() => setShowAddSheet(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint transition-colors hover:text-ink-soft"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          添加沟通对象
        </button>
      </div>

      {/* 添加沟通对象面板 */}
      <AnimatePresence>
        {showAddSheet && (
          <AddContactSheet
            onClose={() => setShowAddSheet(false)}
            onAddFromTrusted={handleAddFromTrusted}
            onAddNew={handleAddNew}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * 添加沟通对象面板
 * ======================================================= */
function AddContactSheet({
  onClose,
  onAddFromTrusted,
  onAddNew,
}: {
  onClose: () => void;
  onAddFromTrusted: (candidate: (typeof MOCK_TRUSTED_CONTACT_CANDIDATES)[number]) => void;
  onAddNew: (displayName: string, roleType: CommunicationRoleType) => void;
}) {
  const [mode, setMode] = useState<"select" | "trusted" | "new">("select");
  const [selectedTrustedId, setSelectedTrustedId] = useState<string | null>(null);

  if (mode === "select") {
    return (
      <BottomSheet onClose={onClose}>
        <div className="text-[16px] font-semibold text-ink">添加沟通对象</div>
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            onClick={() => setMode("trusted")}
            className="rounded-xl border border-line bg-white px-4 py-3.5 text-left text-[14px] font-medium text-ink transition-colors hover:bg-surface-soft/30"
          >
            从已有联系人添加
          </button>
          <button
            onClick={() => setMode("new")}
            className="rounded-xl border border-line bg-white px-4 py-3.5 text-left text-[14px] font-medium text-ink transition-colors hover:bg-surface-soft/30"
          >
            新增沟通对象
          </button>
        </div>
      </BottomSheet>
    );
  }

  if (mode === "trusted") {
    const selectedCandidate = MOCK_TRUSTED_CONTACT_CANDIDATES.find(
      (candidate) => candidate.id === selectedTrustedId,
    );

    return (
      <BottomSheet onClose={onClose}>
        <div className="text-[16px] font-semibold text-ink">已有联系人</div>
        <p className="mt-1 text-[12px] text-ink-faint">
          仅创建沟通对象记录，不复制联系方式。
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          {MOCK_TRUSTED_CONTACT_CANDIDATES.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => setSelectedTrustedId(candidate.id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ${
                selectedTrustedId === candidate.id
                  ? "border-transparent bg-accent-soft"
                  : "border-line bg-white hover:bg-surface-soft/30"
              }`}
            >
              <div>
                <div className="text-[14px] font-medium text-ink">
                  {candidate.displayName}
                </div>
                <div className="mt-0.5 text-[12px] text-ink-faint">
                  {candidate.roleLabel}
                </div>
              </div>
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                  selectedTrustedId === candidate.id
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white"
                }`}
              >
                {selectedTrustedId === candidate.id && (
                  <Check className="h-3 w-3" strokeWidth={2.4} />
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2.5">
          <button
            onClick={() => setMode("select")}
            className="flex-1 rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
          >
            返回
          </button>
          <button
            onClick={() => selectedCandidate && onAddFromTrusted(selectedCandidate)}
            disabled={!selectedCandidate}
            className="flex-1 rounded-xl bg-action-primary py-3 text-[13px] font-medium text-action-primary-text disabled:opacity-30"
          >
            添加
          </button>
        </div>
      </BottomSheet>
    );
  }

  return <NewContactForm onClose={onClose} onBack={() => setMode("select")} onAdd={onAddNew} />;
}

/* —— 新增沟通对象表单 —— */
function NewContactForm({
  onClose,
  onBack,
  onAdd,
}: {
  onClose: () => void;
  onBack: () => void;
  onAdd: (displayName: string, roleType: CommunicationRoleType) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [roleType, setRoleType] = useState<CommunicationRoleType>("doctor");
  const canSave = displayName.trim().length > 0;

  return (
    <BottomSheet onClose={onClose}>
      <div className="text-[16px] font-semibold text-ink">新增沟通对象</div>
      <div className="mt-4">
        <label className="text-[12px] text-ink-faint">怎么称呼 TA？</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          placeholder="如：王医生、李老师"
          autoFocus
        />
      </div>
      <div className="mt-3">
        <label className="text-[12px] text-ink-faint">TA 和你的关系是？</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleType(opt.value)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                roleType === opt.value
                  ? "border-transparent bg-accent-soft text-ink"
                  : "border-line bg-white text-ink-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
        >
          返回
        </button>
        <button
          onClick={() => canSave && onAdd(displayName.trim(), roleType)}
          disabled={!canSave}
          className="flex-1 rounded-xl bg-action-primary py-3 text-[13px] font-medium text-action-primary-text disabled:opacity-30"
        >
          添加
        </button>
      </div>
    </BottomSheet>
  );
}

/* =========================================================
 * 可滑动删除的联系人卡片
 * 右滑露出删除按钮；默认联系人（王医生）不可删除
 * ======================================================= */
const DELETE_WIDTH = 92;

function SwipeableContactCard({
  contact,
  rangeLabel,
  onSelect,
  onDelete,
}: {
  contact: CommunicationContact;
  rangeLabel: string;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const didDrag = useRef(false);
  const isDefault = contact.id === "contact-wang-doctor";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${isDefault ? "" : "bg-[#E85C4A]"}`}>
      {/* 背后删除按钮（左侧）：卡片右滑后露出 */}
      {!isDefault && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label="删除"
          className="absolute inset-y-0 left-0 z-0 flex w-[92px] flex-col items-center justify-center gap-1 rounded-2xl bg-[#E85C4A] text-white"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
          <span className="text-[12px] font-medium">删除</span>
        </button>
      )}

      {/* 可滑动卡片主体 */}
      <motion.div
        drag={isDefault ? false : "x"}
        dragConstraints={{ left: 0, right: DELETE_WIDTH }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => {
          didDrag.current = true;
        }}
        onDragEnd={(_, info) => {
          const shouldOpen = info.offset.x > DELETE_WIDTH / 2 || info.velocity.x > 500;
          setOpen(shouldOpen);

          // Framer Motion 拖拽结束后仍会派发 click，延后重置以防止误进入联系人。
          window.setTimeout(() => {
            didDrag.current = false;
          }, 0);
        }}
        animate={{ x: open ? DELETE_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative z-10 flex touch-pan-y items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 text-left"
        onClick={() => {
          if (didDrag.current) return;
          if (open) {
            setOpen(false);
            return;
          }
          onSelect();
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold text-ink">
            {contact.displayName}
          </div>
          <div className="mt-0.5 text-[12.5px] text-ink-faint">
            {contact.roleLabel}
          </div>
          <div className="mt-2 text-[12px] text-ink-soft">{rangeLabel}</div>
        </div>
        <div className="flex items-center gap-1 text-[13px] font-medium text-accent">
          <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        </div>
      </motion.div>
    </div>
  );
}
