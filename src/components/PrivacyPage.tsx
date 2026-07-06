import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Phone,
  Copy,
  Camera,
  Check,
} from "lucide-react";
import {
  EMERGENCY_CONTACT_MAX,
  basicProfileStatus,
  bodyDataStatus,
  emergencyStatusLabel,
  familyStatusLabel,
  fillStatusLabel,
  genId,
  medsStatusLabel,
  loadBasicProfile,
  loadBodyData,
  loadEmergencyContacts,
  loadFamilyMembers,
  loadMedSchedules,
  saveBasicProfile,
  saveBodyData,
  saveEmergencyContacts,
  saveFamilyMembers,
  saveMedSchedules,
  type BasicProfile,
  type BodyData,
  type EmergencyContact,
  type FamilyMember,
  type Gender,
  type MedSchedule,
} from "@/data/privacy";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 「我的隐私」本地状态机 ——
 * 一级页 home：3 分组 5 入口，仅展示名称与状态，不暴露具体内容。
 * 二级页：
 *   basicProfile / bodyData：查看 + 编辑 + 保存
 *   family / emergency / meds：列表 + 新增 / 编辑 / 删除
 *
 * 风格与 PraisePage / OrganizePage 一致：克制、白底、圆角卡片、底部确认层。
 * 不接后端 / LLM；localStorage 持久化。 */
type Layer =
  | "home"
  | "basicProfile"
  | "bodyData"
  | "family"
  | "familyEdit"
  | "emergency"
  | "emergencyEdit"
  | "meds"
  | "medsEdit";

type Props = {
  /** 返回 more 侧边栏 */
  onBack: () => void;
};

export default function PrivacyPage({ onBack }: Props) {
  const [layer, setLayer] = useState<Layer>("home");

  // —— 各类数据（localStorage 持久化）——
  const [basicProfile, setBasicProfile] = useState<BasicProfile>({});
  const [bodyData, setBodyData] = useState<BodyData>({});
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    [],
  );
  const [medSchedules, setMedSchedules] = useState<MedSchedule[]>([]);

  // 初始加载
  useEffect(() => {
    setBasicProfile(loadBasicProfile());
    setBodyData(loadBodyData());
    setFamilyMembers(loadFamilyMembers());
    setEmergencyContacts(loadEmergencyContacts());
    setMedSchedules(loadMedSchedules());
  }, []);

  // —— 编辑目标 id（用于 familyEdit / emergencyEdit / medsEdit）——
  const [editingId, setEditingId] = useState<string | null>(null);

  // —— 持久化 helper ——
  const persistBasic = (next: BasicProfile) => {
    setBasicProfile(next);
    saveBasicProfile(next);
  };
  const persistBody = (next: BodyData) => {
    setBodyData(next);
    saveBodyData(next);
  };
  const persistFamily = (next: FamilyMember[]) => {
    setFamilyMembers(next);
    saveFamilyMembers(next);
  };
  const persistEmergency = (next: EmergencyContact[]) => {
    setEmergencyContacts(next);
    saveEmergencyContacts(next);
  };
  const persistMeds = (next: MedSchedule[]) => {
    setMedSchedules(next);
    saveMedSchedules(next);
  };

  const goHome = () => setLayer("home");

  // —— 二级页返回：先回一级页 home ——
  const backToHome = () => {
    setEditingId(null);
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
              basicProfile={basicProfile}
              bodyData={bodyData}
              familyMembers={familyMembers}
              emergencyContacts={emergencyContacts}
              medSchedules={medSchedules}
              onBack={onBack}
              onEnter={(l) => setLayer(l)}
            />
          )}

          {layer === "basicProfile" && (
            <BasicProfileEdit
              value={basicProfile}
              onBack={backToHome}
              onSave={(next) => {
                persistBasic(next);
                goHome();
              }}
            />
          )}

          {layer === "bodyData" && (
            <BodyDataEdit
              value={bodyData}
              onBack={backToHome}
              onSave={(next) => {
                persistBody(next);
                goHome();
              }}
            />
          )}

          {layer === "family" && (
            <FamilyList
              list={familyMembers}
              onBack={backToHome}
              onAdd={() => {
                setEditingId(null);
                setLayer("familyEdit");
              }}
              onEdit={(id) => {
                setEditingId(id);
                setLayer("familyEdit");
              }}
              onDelete={(id) => persistFamily(familyMembers.filter((m) => m.id !== id))}
            />
          )}

          {layer === "familyEdit" && (
            <FamilyEdit
              member={
                editingId
                  ? familyMembers.find((m) => m.id === editingId) ?? null
                  : null
              }
              onBack={() => {
                setEditingId(null);
                setLayer("family");
              }}
              onSave={(m) => {
                if (editingId) {
                  persistFamily(
                    familyMembers.map((x) => (x.id === editingId ? m : x)),
                  );
                } else {
                  persistFamily([...familyMembers, m]);
                }
                setEditingId(null);
                setLayer("family");
              }}
            />
          )}

          {layer === "emergency" && (
            <EmergencyList
              list={emergencyContacts}
              onBack={backToHome}
              onAdd={() => {
                setEditingId(null);
                setLayer("emergencyEdit");
              }}
              onEdit={(id) => {
                setEditingId(id);
                setLayer("emergencyEdit");
              }}
              onDelete={(id) =>
                persistEmergency(emergencyContacts.filter((c) => c.id !== id))
              }
            />
          )}

          {layer === "emergencyEdit" && (
            <EmergencyEdit
              contact={
                editingId
                  ? emergencyContacts.find((c) => c.id === editingId) ?? null
                  : null
              }
              canAddMore={emergencyContacts.length < EMERGENCY_CONTACT_MAX}
              onBack={() => {
                setEditingId(null);
                setLayer("emergency");
              }}
              onSave={(c) => {
                if (editingId) {
                  persistEmergency(
                    emergencyContacts.map((x) => (x.id === editingId ? c : x)),
                  );
                } else {
                  persistEmergency([...emergencyContacts, c]);
                }
                setEditingId(null);
                setLayer("emergency");
              }}
            />
          )}

          {layer === "meds" && (
            <MedsList
              list={medSchedules}
              onBack={backToHome}
              onAdd={() => {
                setEditingId(null);
                setLayer("medsEdit");
              }}
              onEdit={(id) => {
                setEditingId(id);
                setLayer("medsEdit");
              }}
              onDelete={(id) =>
                persistMeds(medSchedules.filter((m) => m.id !== id))
              }
            />
          )}

          {layer === "medsEdit" && (
            <MedsEdit
              schedule={
                editingId
                  ? medSchedules.find((m) => m.id === editingId) ?? null
                  : null
              }
              onBack={() => {
                setEditingId(null);
                setLayer("meds");
              }}
              onSave={(m) => {
                if (editingId) {
                  persistMeds(
                    medSchedules.map((x) => (x.id === editingId ? m : x)),
                  );
                } else {
                  persistMeds([...medSchedules, m]);
                }
                setEditingId(null);
                setLayer("meds");
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * HomeView —— 一级页：3 分组 5 入口 + 状态
 * ======================================================= */
function HomeView({
  basicProfile,
  bodyData,
  familyMembers,
  emergencyContacts,
  medSchedules,
  onBack,
  onEnter,
}: {
  basicProfile: BasicProfile;
  bodyData: BodyData;
  familyMembers: FamilyMember[];
  emergencyContacts: EmergencyContact[];
  medSchedules: MedSchedule[];
  onBack: () => void;
  onEnter: (l: Layer) => void;
}) {
  return (
    <div className="relative flex h-full flex-col bg-canvas">
      {/* 顶部：返回 + 标题 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          我的隐私
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
        {/* 分组 1：我的资料 */}
        <SectionLabel>我的资料</SectionLabel>
        <div className="mt-2 flex flex-col gap-2.5">
          <EntryRow
            label="基础资料"
            status={fillStatusLabel(basicProfileStatus(basicProfile))}
            onClick={() => onEnter("basicProfile")}
          />
          <EntryRow
            label="身体资料"
            status={fillStatusLabel(bodyDataStatus(bodyData))}
            onClick={() => onEnter("bodyData")}
          />
        </div>

        {/* 分组 2：家人和联系人 */}
        <SectionLabel className="mt-7">家人和联系人</SectionLabel>
        <div className="mt-2 flex flex-col gap-2.5">
          <EntryRow
            label="家人信息"
            status={familyStatusLabel(familyMembers)}
            onClick={() => onEnter("family")}
          />
          <EntryRow
            label="紧急联系人"
            status={emergencyStatusLabel(emergencyContacts)}
            onClick={() => onEnter("emergency")}
          />
        </div>

        {/* 分组 3：服用信息 */}
        <SectionLabel className="mt-7">服用信息</SectionLabel>
        <div className="mt-2 flex flex-col gap-2.5">
          <EntryRow
            label="服用安排"
            status={medsStatusLabel(medSchedules)}
            onClick={() => onEnter("meds")}
          />
        </div>
      </div>
    </div>
  );
}

/* —— 分组标签 —— */
function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint ${className}`}
    >
      {children}
    </div>
  );
}

/* —— 一级页入口行：左侧名称 + 右侧状态 + 箭头 —— */
function EntryRow({
  label,
  status,
  onClick,
}: {
  label: string;
  status: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 text-left transition-colors hover:border-ink-faint"
    >
      <span className="text-[15px] font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-ink-faint">{status}</span>
        <ChevronRight className="h-4 w-4 text-ink-faint" strokeWidth={1.8} />
      </div>
    </button>
  );
}

/* —— 通用页头 —— */
function PageHeader({
  title,
  onBack,
  rightSlot,
}: {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-14 pb-2">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
      </div>
      {rightSlot}
    </div>
  );
}

/* —— 通用字段行（label + 控件） —— */
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white px-5 py-4">
      <div className="text-[12px] text-ink-faint">{label}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* —— 通用文本输入 —— */
function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "tel" | "number";
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
    />
  );
}

/* —— 保存按钮：点击后短暂"已保存"反馈再返回 —— */
function SaveBar({
  canSave,
  onSave,
  label = "保存",
}: {
  canSave: boolean;
  onSave: () => void;
  label?: string;
}) {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handle = () => {
    if (!canSave || saved) return;
    onSave();
    setSaved(true);
    timerRef.current = window.setTimeout(() => setSaved(false), 900);
  };

  return (
    <div className="px-5 pb-8">
      <button
        onClick={handle}
        disabled={!canSave}
        className="w-full rounded-xl bg-[#FC591B] px-4 py-3 text-[13px] font-medium text-canvas transition-opacity disabled:opacity-30"
      >
        {saved ? "已保存" : label}
      </button>
    </div>
  );
}

/* =========================================================
 * BasicProfileEdit —— 基础资料编辑
 * ======================================================= */
function BasicProfileEdit({
  value,
  onBack,
  onSave,
}: {
  value: BasicProfile;
  onBack: () => void;
  onSave: (next: BasicProfile) => void;
}) {
  const [nickname, setNickname] = useState(value.nickname ?? "");
  const [gender, setGender] = useState<Gender | "">(value.gender ?? "");
  const [age, setAge] = useState(value.age !== undefined ? String(value.age) : "");
  const [avatar, setAvatar] = useState<string | undefined>(value.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  const ageNum = age.trim() === "" ? undefined : Number(age);
  const ageValid = age.trim() === "" || (ageNum !== undefined && ageNum > 0 && ageNum < 150);

  const canSave = ageValid && (nickname.trim() !== "" || gender !== "" || avatar !== undefined || age.trim() !== "");

  const handleAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!canSave) return;
    const next: BasicProfile = {
      avatar,
      nickname: nickname.trim() || undefined,
      gender: gender || undefined,
      age: ageNum,
    };
    onSave(next);
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader title="基础资料" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        {/* 头像 */}
        <div className="rounded-2xl border border-line bg-white px-5 py-4">
          <div className="text-[12px] text-ink-faint">头像</div>
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-line bg-line-soft text-ink-faint transition-colors hover:border-ink-faint"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="头像"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-5 w-5" strokeWidth={1.6} />
              )}
            </button>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-[13px] text-ink-soft transition-colors hover:text-ink"
              >
                选择图片
              </button>
              {avatar && (
                <button
                  onClick={() => setAvatar(undefined)}
                  className="text-left text-[12px] text-ink-faint transition-colors hover:text-ink-soft"
                >
                  移除
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatar(e.target.files?.[0])}
            />
          </div>
        </div>

        {/* 昵称 */}
        <div className="mt-2.5">
          <FieldRow label="昵称">
            <TextInput
              value={nickname}
              onChange={setNickname}
              placeholder="怎么称呼你"
              maxLength={20}
            />
          </FieldRow>
        </div>

        {/* 性别 */}
        <div className="mt-2.5 rounded-2xl border border-line bg-white px-5 py-4">
          <div className="text-[12px] text-ink-faint">性别</div>
          <div className="mt-2 flex gap-2">
            {(
              [
                { v: "male", l: "男" },
                { v: "female", l: "女" },
                { v: "other", l: "其他" },
              ] as { v: Gender; l: string }[]
            ).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setGender(opt.v)}
                className={`flex-1 rounded-xl border py-2.5 text-[14px] transition-colors ${
                  gender === opt.v
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-white text-ink-soft hover:border-ink-faint"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* 年龄 */}
        <div className="mt-2.5">
          <FieldRow label="年龄">
            <TextInput
              value={age}
              onChange={setAge}
              placeholder="年龄"
              type="number"
            />
          </FieldRow>
          {!ageValid && (
            <p className="mt-2 px-1 text-[12px] text-[#B7583F]">
              请输入有效的年龄。
            </p>
          )}
        </div>
      </div>

      <SaveBar canSave={canSave} onSave={submit} />
    </div>
  );
}

/* =========================================================
 * BodyDataEdit —— 身体资料编辑（身高）
 * ======================================================= */
function BodyDataEdit({
  value,
  onBack,
  onSave,
}: {
  value: BodyData;
  onBack: () => void;
  onSave: (next: BodyData) => void;
}) {
  const [height, setHeight] = useState(
    value.height !== undefined ? String(value.height) : "",
  );

  const heightNum =
    height.trim() === "" ? undefined : Number(height);
  const heightValid =
    height.trim() === "" ||
    (heightNum !== undefined && heightNum > 50 && heightNum < 300);
  const canSave = heightValid && height.trim() !== "";

  const submit = () => {
    if (!canSave) return;
    onSave({ height: heightNum });
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader title="身体资料" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <div className="rounded-2xl border border-line bg-white px-5 py-4">
          <div className="text-[12px] text-ink-faint">身高</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <TextInput
              value={height}
              onChange={setHeight}
              placeholder="身高"
              type="number"
            />
            <span className="text-[13px] text-ink-faint">cm</span>
          </div>
        </div>
        {!heightValid && (
          <p className="mt-2 px-1 text-[12px] text-[#B7583F]">
            请输入有效的身高。
          </p>
        )}
      </div>

      <SaveBar canSave={canSave} onSave={submit} />
    </div>
  );
}

/* =========================================================
 * FamilyList —— 家人信息列表
 * ======================================================= */
function FamilyList({
  list,
  onBack,
  onAdd,
  onEdit,
  onDelete,
}: {
  list: FamilyMember[];
  onBack: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader title="家人信息" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-2">
        {list.length === 0 ? (
          <p className="mt-6 text-center text-[13px] text-ink-faint">
            还没有添加家人。
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {list.map((m) => (
              <button
                key={m.id}
                onClick={() => onEdit(m.id)}
                className="w-full rounded-2xl border border-line bg-white px-5 py-4 text-left transition-colors hover:border-ink-faint"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <div className="text-[15px] font-medium text-ink">
                      {m.name}
                    </div>
                    <div className="mt-1 text-[12.5px] text-ink-faint">
                      {m.relation}
                      {m.contact ? ` · ${m.contact}` : ""}
                    </div>
                  </div>
                  <Trash2
                    className="h-4 w-4 shrink-0 text-ink-faint transition-colors hover:text-[#B7583F]"
                    strokeWidth={1.6}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(m.id);
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 悬浮新增 */}
      <button
        onClick={onAdd}
        aria-label="新增家人"
        className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)] transition-colors hover:border-ink-faint hover:text-ink"
      >
        <Plus className="h-5 w-5" strokeWidth={1.8} />
      </button>

      {/* 删除二次确认 */}
      <AnimatePresence>
        {deleteId && (
          <DeleteConfirm
            title="要删掉这位家人吗？"
            description="删除后无法恢复。"
            onCancel={() => setDeleteId(null)}
            onConfirm={() => {
              onDelete(deleteId);
              setDeleteId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 家人信息编辑 —— */
function FamilyEdit({
  member,
  onBack,
  onSave,
}: {
  member: FamilyMember | null;
  onBack: () => void;
  onSave: (m: FamilyMember) => void;
}) {
  const [name, setName] = useState(member?.name ?? "");
  const [relation, setRelation] = useState(member?.relation ?? "");
  const [contact, setContact] = useState(member?.contact ?? "");

  const canSave = name.trim() !== "" && relation.trim() !== "";

  const submit = () => {
    if (!canSave) return;
    onSave({
      id: member?.id ?? genId(),
      name: name.trim(),
      relation: relation.trim(),
      contact: contact.trim() || undefined,
    });
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader title={member ? "编辑家人" : "新增家人"} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <div className="flex flex-col gap-2.5">
          <FieldRow label="姓名">
            <TextInput
              value={name}
              onChange={setName}
              placeholder="姓名"
              maxLength={30}
            />
          </FieldRow>
          <FieldRow label="关系">
            <TextInput
              value={relation}
              onChange={setRelation}
              placeholder="如 妈妈 / 爸爸 / 姐姐"
              maxLength={20}
            />
          </FieldRow>
          <FieldRow label="联系方式">
            <TextInput
              value={contact}
              onChange={setContact}
              placeholder="手机号或其他联系方式"
              type="tel"
              maxLength={30}
            />
          </FieldRow>
        </div>
      </div>

      <SaveBar canSave={canSave} onSave={submit} />
    </div>
  );
}

/* =========================================================
 * EmergencyList —— 紧急联系人列表（拨打 / 复制 / 删除）
 * ======================================================= */
function EmergencyList({
  list,
  onBack,
  onAdd,
  onEdit,
  onDelete,
}: {
  list: EmergencyContact[];
  onBack: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (c: EmergencyContact) => {
    try {
      await navigator.clipboard.writeText(c.phone);
      setCopiedId(c.id);
      window.setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // 忽略剪贴板失败
    }
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader title="紧急联系人" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-2">
        {list.length === 0 ? (
          <p className="mt-6 text-center text-[13px] text-ink-faint">
            还没有添加紧急联系人。
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {list.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-white px-5 py-4"
              >
                <button
                  onClick={() => onEdit(c.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-3">
                      <div className="text-[15px] font-medium text-ink">
                        {c.name}
                      </div>
                      <div className="mt-1 text-[12.5px] text-ink-faint">
                        {c.relation} · {c.phone}
                      </div>
                    </div>
                    <Trash2
                      className="h-4 w-4 shrink-0 text-ink-faint transition-colors hover:text-[#B7583F]"
                      strokeWidth={1.6}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(c.id);
                      }}
                    />
                  </div>
                </button>

                {/* 操作行：拨打 / 复制 */}
                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  <a
                    href={`tel:${c.phone}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-line-soft py-2 text-[13px] text-ink-soft transition-colors hover:bg-line"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.8} />
                    拨打
                  </a>
                  <button
                    onClick={() => handleCopy(c)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-line-soft py-2 text-[13px] text-ink-soft transition-colors hover:bg-line"
                  >
                    {copiedId === c.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" strokeWidth={1.8} />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 上限提示 */}
        {list.length >= EMERGENCY_CONTACT_MAX && (
          <p className="mt-4 text-center text-[12px] text-ink-faint">
            最多 {EMERGENCY_CONTACT_MAX} 位联系人。
          </p>
        )}
      </div>

      {/* 悬浮新增：达到上限时隐藏 */}
      {list.length < EMERGENCY_CONTACT_MAX && (
        <button
          onClick={onAdd}
          aria-label="新增紧急联系人"
          className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)] transition-colors hover:border-ink-faint hover:text-ink"
        >
          <Plus className="h-5 w-5" strokeWidth={1.8} />
        </button>
      )}

      <AnimatePresence>
        {deleteId && (
          <DeleteConfirm
            title="要删掉这位紧急联系人吗？"
            description="删除后无法恢复。"
            onCancel={() => setDeleteId(null)}
            onConfirm={() => {
              onDelete(deleteId);
              setDeleteId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 紧急联系人编辑 —— */
function EmergencyEdit({
  contact,
  canAddMore,
  onBack,
  onSave,
}: {
  contact: EmergencyContact | null;
  canAddMore: boolean;
  onBack: () => void;
  onSave: (c: EmergencyContact) => void;
}) {
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [relation, setRelation] = useState(contact?.relation ?? "");

  const phoneValid = phone.trim().length >= 3;
  const canSave = name.trim() !== "" && phoneValid && relation.trim() !== "";

  // 新建时已达上限：不允许进入。保守起见在此也阻断保存。
  if (!contact && !canAddMore) {
    return (
      <div className="relative flex h-full flex-col bg-canvas">
        <PageHeader title="新增紧急联系人" onBack={onBack} />
        <div className="flex flex-1 items-center justify-center px-8">
          <p className="text-center text-[13px] text-ink-faint">
            最多 {EMERGENCY_CONTACT_MAX} 位联系人。
          </p>
        </div>
      </div>
    );
  }

  const submit = () => {
    if (!canSave) return;
    onSave({
      id: contact?.id ?? genId(),
      name: name.trim(),
      phone: phone.trim(),
      relation: relation.trim(),
    });
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader
        title={contact ? "编辑紧急联系人" : "新增紧急联系人"}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <div className="flex flex-col gap-2.5">
          <FieldRow label="姓名">
            <TextInput
              value={name}
              onChange={setName}
              placeholder="姓名"
              maxLength={30}
            />
          </FieldRow>
          <FieldRow label="电话">
            <TextInput
              value={phone}
              onChange={setPhone}
              placeholder="电话号码"
              type="tel"
              maxLength={30}
            />
          </FieldRow>
          <FieldRow label="关系">
            <TextInput
              value={relation}
              onChange={setRelation}
              placeholder="如 妈妈 / 朋友 / 医生"
              maxLength={20}
            />
          </FieldRow>
        </div>
      </div>

      <SaveBar canSave={canSave} onSave={submit} />
    </div>
  );
}

/* =========================================================
 * MedsList —— 服用安排列表
 * ======================================================= */
function MedsList({
  list,
  onBack,
  onAdd,
  onEdit,
  onDelete,
}: {
  list: MedSchedule[];
  onBack: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader title="服用安排" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-2">
        {list.length === 0 ? (
          <p className="mt-6 text-center text-[13px] text-ink-faint">
            还没有添加服用安排。
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {list.map((m) => (
              <button
                key={m.id}
                onClick={() => onEdit(m.id)}
                className="w-full rounded-2xl border border-line bg-white px-5 py-4 text-left transition-colors hover:border-ink-faint"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <div className="text-[15px] font-medium text-ink">
                      {m.name}
                    </div>
                    <div className="mt-1 text-[12.5px] text-ink-faint">
                      {[m.dose, m.frequency, m.time].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <Trash2
                    className="h-4 w-4 shrink-0 text-ink-faint transition-colors hover:text-[#B7583F]"
                    strokeWidth={1.6}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(m.id);
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onAdd}
        aria-label="新增服用安排"
        className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)] transition-colors hover:border-ink-faint hover:text-ink"
      >
        <Plus className="h-5 w-5" strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {deleteId && (
          <DeleteConfirm
            title="要删掉这项服用安排吗？"
            description="删除后无法恢复。"
            onCancel={() => setDeleteId(null)}
            onConfirm={() => {
              onDelete(deleteId);
              setDeleteId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 服用安排编辑 —— */
function MedsEdit({
  schedule,
  onBack,
  onSave,
}: {
  schedule: MedSchedule | null;
  onBack: () => void;
  onSave: (m: MedSchedule) => void;
}) {
  const [name, setName] = useState(schedule?.name ?? "");
  const [dose, setDose] = useState(schedule?.dose ?? "");
  const [frequency, setFrequency] = useState(schedule?.frequency ?? "");
  const [time, setTime] = useState(schedule?.time ?? "");
  const [note, setNote] = useState(schedule?.note ?? "");

  const canSave = name.trim() !== "";

  const submit = () => {
    if (!canSave) return;
    onSave({
      id: schedule?.id ?? genId(),
      name: name.trim(),
      dose: dose.trim() || undefined,
      frequency: frequency.trim() || undefined,
      time: time.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PageHeader
        title={schedule ? "编辑服用安排" : "新增服用安排"}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <div className="flex flex-col gap-2.5">
          <FieldRow label="名称">
            <TextInput
              value={name}
              onChange={setName}
              placeholder="药品或保健品名称"
              maxLength={40}
            />
          </FieldRow>
          <FieldRow label="剂量">
            <TextInput
              value={dose}
              onChange={setDose}
              placeholder="如 1 片 / 5ml"
              maxLength={30}
            />
          </FieldRow>
          <FieldRow label="频次">
            <TextInput
              value={frequency}
              onChange={setFrequency}
              placeholder="如 每日一次 / 每日两次"
              maxLength={30}
            />
          </FieldRow>
          <FieldRow label="服用时间">
            <TextInput
              value={time}
              onChange={setTime}
              placeholder="如 早 8:00"
              maxLength={30}
            />
          </FieldRow>
          <div className="rounded-2xl border border-line bg-white px-5 py-4">
            <div className="text-[12px] text-ink-faint">备注</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选"
              rows={3}
              maxLength={100}
              className="mt-1.5 w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        </div>
      </div>

      <SaveBar canSave={canSave} onSave={submit} />
    </div>
  );
}

/* =========================================================
 * DeleteConfirm —— 删除二次确认（底部 sheet，沿用 PraisePage 风格）
 * ======================================================= */
function DeleteConfirm({
  title,
  description,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
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
          <div className="text-[16px] font-semibold text-ink">{title}</div>
          <div className="mt-2 text-[13px] leading-relaxed text-ink-faint">
            {description}
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
