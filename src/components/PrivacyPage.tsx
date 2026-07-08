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
  Star,
} from "lucide-react";
import {
  EMERGENCY_CONTACT_MAX,
  TEACHER_ROLE_LABEL,
  TEACHER_ROLE_OPTIONS,
  canAddEmergencyContact,
  countEmergencyContacts,
  genId,
  guardianStatusLabel,
  loadContacts,
  loadMedSchedules,
  medsStatusLabel,
  saveContacts,
  saveMedSchedules,
  teacherStatusLabel,
  type Contact,
  type ContactType,
  type MedSchedule,
  type TeacherRole,
} from "@/data/privacy";
import {
  calculateBMI,
  getBMIRemark,
  getUserProfile,
  saveBasicInfo,
  saveBodyInfo,
  type BasicInfo,
  type BodyInfo,
  type Gender,
  type UserProfile,
} from "@/data/userProfile";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 「我的隐私」本地状态机 ——
 * 一级页 home：3 分组 5 入口（基础资料 / 身体资料 / 家长 / 老师 / 服用安排）。
 * 二级页：
 *   basicProfile / bodyData：查看 + 编辑 + 保存
 *   guardian / teacher：联系人列表 + 新增 / 编辑 / 删除 + 紧急联系人标记
 *   meds：列表 + 新增 / 编辑 / 删除
 *
 * 紧急联系人不是独立分组，而是 guardian / teacher 联系人中的状态标记，
 * 全局最多 3 位（家长 + 老师合并计算）。
 *
 * 风格与 PraisePage / OrganizePage 一致：克制、白底、圆角卡片、底部确认层。
 * 不接后端 / LLM；localStorage 持久化。 */
type Layer =
  | "home"
  | "basicProfile"
  | "bodyData"
  | "guardian"
  | "guardianEdit"
  | "teacher"
  | "teacherEdit"
  | "meds"
  | "medsEdit";

type Props = {
  /** 返回 more 侧边栏 */
  onBack: () => void;
};

export default function PrivacyPage({ onBack }: Props) {
  const [layer, setLayer] = useState<Layer>("home");

  // —— 各类数据（localStorage 持久化）——
  const [profile, setProfile] = useState<UserProfile>(() => {
    const p = getUserProfile();
    // 还原为 UserProfile 结构（去掉 flat 顶层字段）
    return {
      id: p.id,
      profileCompleted: p.profileCompleted,
      basicInfo: p.basicInfo,
      bodyInfo: p.bodyInfo,
    };
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [medSchedules, setMedSchedules] = useState<MedSchedule[]>([]);

  // 初始加载
  useEffect(() => {
    setContacts(loadContacts());
    setMedSchedules(loadMedSchedules());
  }, []);

  // —— 编辑目标 id ——
  const [editingId, setEditingId] = useState<string | null>(null);

  // —— 持久化 helper ——
  const persistBasic = (next: BasicInfo) => {
    const updated = saveBasicInfo(next);
    setProfile(updated);
  };
  const persistBody = (next: BodyInfo) => {
    const updated = saveBodyInfo(next);
    setProfile(updated);
  };
  const persistContacts = (next: Contact[]) => {
    setContacts(next);
    saveContacts(next);
  };
  const persistMeds = (next: MedSchedule[]) => {
    setMedSchedules(next);
    saveMedSchedules(next);
  };

  const goHome = () => setLayer("home");
  const backToHome = () => {
    setEditingId(null);
    setLayer("home");
  };

  // —— 联系人通用操作 ——
  const upsertContact = (c: Contact) => {
    const exists = contacts.some((x) => x.id === c.id);
    const next = exists
      ? contacts.map((x) => (x.id === c.id ? c : x))
      : [...contacts, c];
    persistContacts(next);
  };

  const deleteContact = (id: string) => {
    // 删除已设为紧急联系人的联系人后，紧急联系人身份同步移除（条目整体删除）
    persistContacts(contacts.filter((c) => c.id !== id));
  };

  /** 切换某联系人的紧急联系人身份。
   *  取消：直接取消。
   *  设置：若全局已达 3 位则拒绝（返回 false 由调用方提示）。 */
  const toggleEmergency = (id: string): boolean => {
    const target = contacts.find((c) => c.id === id);
    if (!target) return false;
    if (target.isEmergencyContact) {
      persistContacts(
        contacts.map((c) =>
          c.id === id ? { ...c, isEmergencyContact: false } : c,
        ),
      );
      return true;
    }
    // 设置前检查上限
    if (!canAddEmergencyContact(contacts)) return false;
    persistContacts(
      contacts.map((c) =>
        c.id === id ? { ...c, isEmergencyContact: true } : c,
      ),
    );
    return true;
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
              profile={profile}
              contacts={contacts}
              medSchedules={medSchedules}
              onBack={onBack}
              onEnter={(l) => setLayer(l)}
            />
          )}

          {layer === "basicProfile" && (
            <BasicProfileEdit
              value={profile.basicInfo}
              onBack={backToHome}
              onSave={(next) => {
                persistBasic(next);
                goHome();
              }}
            />
          )}

          {layer === "bodyData" && (
            <BodyDataEdit
              value={profile.bodyInfo}
              onBack={backToHome}
              onSave={(next) => {
                persistBody(next);
                goHome();
              }}
            />
          )}

          {layer === "guardian" && (
            <ContactList
              type="guardian"
              list={contacts.filter((c) => c.type === "guardian")}
              allContacts={contacts}
              onBack={backToHome}
              onAdd={() => {
                setEditingId(null);
                setLayer("guardianEdit");
              }}
              onEdit={(id) => {
                setEditingId(id);
                setLayer("guardianEdit");
              }}
              onDelete={deleteContact}
              onToggleEmergency={toggleEmergency}
            />
          )}

          {layer === "guardianEdit" && (
            <ContactEdit
              type="guardian"
              contact={
                editingId
                  ? contacts.find((c) => c.id === editingId) ?? null
                  : null
              }
              onBack={() => {
                setEditingId(null);
                setLayer("guardian");
              }}
              onSave={(c) => {
                upsertContact(c);
                setEditingId(null);
                setLayer("guardian");
              }}
            />
          )}

          {layer === "teacher" && (
            <ContactList
              type="teacher"
              list={contacts.filter((c) => c.type === "teacher")}
              allContacts={contacts}
              onBack={backToHome}
              onAdd={() => {
                setEditingId(null);
                setLayer("teacherEdit");
              }}
              onEdit={(id) => {
                setEditingId(id);
                setLayer("teacherEdit");
              }}
              onDelete={deleteContact}
              onToggleEmergency={toggleEmergency}
            />
          )}

          {layer === "teacherEdit" && (
            <ContactEdit
              type="teacher"
              contact={
                editingId
                  ? contacts.find((c) => c.id === editingId) ?? null
                  : null
              }
              onBack={() => {
                setEditingId(null);
                setLayer("teacher");
              }}
              onSave={(c) => {
                upsertContact(c);
                setEditingId(null);
                setLayer("teacher");
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
  profile,
  contacts,
  medSchedules,
  onBack,
  onEnter,
}: {
  profile: UserProfile;
  contacts: Contact[];
  medSchedules: MedSchedule[];
  onBack: () => void;
  onEnter: (l: Layer) => void;
}) {
  const profileStatus = profile.profileCompleted ? "已填写" : "未填写";
  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部：返回 + 标题 + 右上角视频 */}
      <div className="relative flex items-center gap-3 px-5 pt-14 pb-2">
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
        {/* 右上角装饰视频：标题区氛围装饰，非功能入口。
            尺寸独立管理（w-12 h-12 = 48×48），与正念页主视觉在在分离。
            top 88px：标题行内，状态栏下方；right 36px：内收到内容区内侧。
            pointer-events-none + z-10：不拦截点击，不遮挡卡片（卡片 z-auto 在下层）。 */}
        <div className="pointer-events-none absolute right-9 top-[88px] z-10">
          <video
            src="/assets/zaiya/privacy-peek-transparent.webm"
            autoPlay
            loop
            muted
            playsInline
            className="h-12 w-12 object-contain"
          />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-6">
        {/* 分组 1：我的资料 */}
        <SectionLabel>我的资料</SectionLabel>
        <div className="mt-2 flex flex-col gap-2.5">
          <EntryRow
            label="基础资料"
            status={profileStatus}
            onClick={() => onEnter("basicProfile")}
          />
          <EntryRow
            label="身体资料"
            status={profileStatus}
            onClick={() => onEnter("bodyData")}
          />
        </div>

        {/* 分组 2：联系方式 */}
        <SectionLabel className="mt-7">联系方式</SectionLabel>
        <div className="mt-2 flex flex-col gap-2.5">
          <EntryRow
            label="家长"
            status={guardianStatusLabel(contacts)}
            onClick={() => onEnter("guardian")}
          />
          <EntryRow
            label="老师"
            status={teacherStatusLabel(contacts)}
            onClick={() => onEnter("teacher")}
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
        className="w-full rounded-xl bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text transition-opacity disabled:opacity-30"
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
  value: BasicInfo;
  onBack: () => void;
  onSave: (next: BasicInfo) => void;
}) {
  const [nickname, setNickname] = useState(value.nickname ?? "");
  const [birthDate, setBirthDate] = useState(value.birthDate ?? "");
  const [gender, setGender] = useState<Gender | "">(value.gender ?? "");
  const [age, setAge] = useState(value.age !== undefined ? String(value.age) : "");
  const [grade, setGrade] = useState(value.grade ?? "");
  const [city, setCity] = useState(value.city ?? "");
  const [avatar, setAvatar] = useState<string | undefined>(value.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  const ageNum = age.trim() === "" ? undefined : Number(age);
  const ageValid = age.trim() === "" || (ageNum !== undefined && ageNum > 0 && ageNum < 150);

  const canSave = ageValid && (nickname.trim() !== "" || gender !== "" || avatar !== undefined || age.trim() !== "" || birthDate.trim() !== "" || grade.trim() !== "" || city.trim() !== "");

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
    const next: BasicInfo = {
      nickname: nickname.trim() || "未填写",
      birthDate: birthDate.trim() || "",
      age: ageNum ?? 0,
      gender: gender || "other",
      grade: grade.trim() || "",
      city: city.trim() || "",
      avatar,
    };
    onSave(next);
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      <PageHeader title="基础资料" onBack={onBack} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4 pt-2">
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

        {/* 出生日期 */}
        <div className="mt-2.5">
          <FieldRow label="出生日期">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-transparent text-[15px] text-ink focus:outline-none"
            />
          </FieldRow>
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
            <p className="mt-2 px-1 text-[12px] text-risk-medium">
              请输入有效的年龄。
            </p>
          )}
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

        {/* 年级 */}
        <div className="mt-2.5">
          <FieldRow label="年级">
            <TextInput
              value={grade}
              onChange={setGrade}
              placeholder="如 初三"
              maxLength={20}
            />
          </FieldRow>
        </div>

        {/* 城市 */}
        <div className="mt-2.5">
          <FieldRow label="城市">
            <TextInput
              value={city}
              onChange={setCity}
              placeholder="如 北京"
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
 * BodyDataEdit —— 身体资料编辑（身高 / 体重 / BMI）
 * ======================================================= */
function BodyDataEdit({
  value,
  onBack,
  onSave,
}: {
  value: BodyInfo;
  onBack: () => void;
  onSave: (next: BodyInfo) => void;
}) {
  const [height, setHeight] = useState(value.heightCm !== undefined ? String(value.heightCm) : "");
  const [weight, setWeight] = useState(value.weightKg !== undefined ? String(value.weightKg) : "");

  const heightNum = height.trim() === "" ? undefined : Number(height);
  const heightValid =
    height.trim() === "" ||
    (heightNum !== undefined && heightNum > 50 && heightNum < 300);

  const weightNum = weight.trim() === "" ? undefined : Number(weight);
  const weightValid =
    weight.trim() === "" ||
    (weightNum !== undefined && weightNum > 10 && weightNum < 500);

  const canSave = heightValid && weightValid && height.trim() !== "";

  // BMI 实时预览：当前输入的身高 + 体重
  const previewBmi =
    heightNum !== undefined && weightNum !== undefined
      ? calculateBMI(weightNum, heightNum)
      : null;
  const previewRemark = previewBmi !== null ? getBMIRemark(previewBmi) : null;

  const submit = () => {
    if (!canSave) return;
    const today = new Date().toISOString().slice(0, 10);
    onSave({
      heightCm: heightNum ?? 0,
      weightKg: weightNum ?? 0,
      heightUpdatedAt: today,
      weightUpdatedAt: today,
    });
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      <PageHeader title="身体资料" onBack={onBack} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4 pt-2">
        {/* 身高 */}
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
          <p className="mt-2 px-1 text-[12px] text-risk-medium">
            请输入有效的身高。
          </p>
        )}

        {/* 体重 */}
        <div className="mt-2.5 rounded-2xl border border-line bg-white px-5 py-4">
          <div className="text-[12px] text-ink-faint">体重</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <TextInput
              value={weight}
              onChange={setWeight}
              placeholder="体重"
              type="number"
            />
            <span className="text-[13px] text-ink-faint">kg</span>
          </div>
        </div>
        {!weightValid && (
          <p className="mt-2 px-1 text-[12px] text-risk-medium">
            请输入有效的体重。
          </p>
        )}

        {/* BMI 实时预览 */}
        {previewBmi !== null && previewRemark !== null && (
          <div className="mt-2.5 rounded-2xl border border-line bg-white px-5 py-4">
            <div className="text-[12px] text-ink-faint">BMI</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-[15px] font-medium text-ink">{previewBmi}</span>
              <span className="text-[13px] text-ink-soft">（{previewRemark}）</span>
            </div>
          </div>
        )}
      </div>

      <SaveBar canSave={canSave} onSave={submit} />
    </div>
  );
}

/* =========================================================
 * ContactList —— 家长 / 老师联系人列表（统一组件，type 区分）
 *  - 紧急联系人卡片标识 + 切换按钮
 *  - 拨打 / 复制 / 删除（二次确认）
 * ======================================================= */
function ContactList({
  type,
  list,
  allContacts,
  onBack,
  onAdd,
  onEdit,
  onDelete,
  onToggleEmergency,
}: {
  type: ContactType;
  list: Contact[];
  /** 全量联系人，用于计算全局紧急联系人计数 */
  allContacts: Contact[];
  onBack: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** 切换紧急联系人身份，返回是否成功 */
  onToggleEmergency: (id: string) => boolean;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emergencyLimitHit, setEmergencyLimitHit] = useState(false);

  const title = type === "guardian" ? "家长" : "老师";
  const emptyText =
    type === "guardian" ? "还没有添加家长。" : "还没有添加老师。";
  const addLabel =
    type === "guardian" ? "新增家长" : "新增老师";

  const emergencyCount = countEmergencyContacts(allContacts);

  const handleCopy = async (c: Contact) => {
    try {
      await navigator.clipboard.writeText(c.phone);
      setCopiedId(c.id);
      window.setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // 忽略剪贴板失败
    }
  };

  const handleToggleEmergency = (c: Contact) => {
    const ok = onToggleEmergency(c.id);
    if (!ok && !c.isEmergencyContact) {
      // 设置失败且当前不是紧急联系人 → 触已达上限提示
      setEmergencyLimitHit(true);
      window.setTimeout(() => setEmergencyLimitHit(false), 1800);
    }
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      <PageHeader title={title} onBack={onBack} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-2">
        {list.length === 0 ? (
          <p className="mt-6 text-center text-[13px] text-ink-faint">
            {emptyText}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {list.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-white px-5 py-4"
              >
                {/* 顶部：信息 + 删除 */}
                <button
                  onClick={() => onEdit(c.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-ink">
                          {c.name}
                        </span>
                        {c.isEmergencyContact && (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-medium text-risk-high">
                            紧急联系人
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[12.5px] text-ink-faint">
                        {type === "guardian"
                          ? c.relationship
                            ? `${c.relationship} · ${c.phone}`
                            : c.phone
                          : c.teacherRole
                            ? `${TEACHER_ROLE_LABEL[c.teacherRole]} · ${c.phone}`
                            : c.phone}
                      </div>
                    </div>
                    <Trash2
                      className="h-4 w-4 shrink-0 text-ink-faint transition-colors hover:text-risk-medium"
                      strokeWidth={1.6}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(c.id);
                      }}
                    />
                  </div>
                </button>

                {/* 操作行：紧急联系人 + 拨打 + 复制 */}
                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  <button
                    onClick={() => handleToggleEmergency(c)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] transition-colors ${
                      c.isEmergencyContact
                        ? "bg-accent-soft text-risk-high"
                        : "bg-line-soft text-ink-soft hover:bg-line"
                    }`}
                  >
                    <Star
                      className="h-3.5 w-3.5"
                      strokeWidth={1.8}
                      fill={c.isEmergencyContact ? "currentColor" : "none"}
                    />
                    {c.isEmergencyContact ? "已设紧急" : "设为紧急"}
                  </button>
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

                {c.note && (
                  <p className="mt-3 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-faint">
                    {c.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 紧急联系人计数提示 */}
        {emergencyCount > 0 && (
          <p className="mt-4 text-center text-[12px] text-ink-faint">
            紧急联系人 {emergencyCount} / {EMERGENCY_CONTACT_MAX}
          </p>
        )}

        {/* 达上限提示 */}
        <AnimatePresence>
          {emergencyLimitHit && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2, ease }}
              className="mt-3 text-center text-[12px] text-risk-medium"
            >
              最多设置 {EMERGENCY_CONTACT_MAX} 位紧急联系人。
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 悬浮新增 */}
      <button
        onClick={onAdd}
        aria-label={addLabel}
        className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-action-primary bg-action-primary text-action-primary-text shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)] transition-opacity hover:opacity-90"
      >
        <Plus className="h-5 w-5" strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {deleteId && (
          <DeleteConfirm
            title={`要删掉这位${type === "guardian" ? "家长" : "老师"}吗？`}
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

/* —— 联系人编辑（家长 / 老师统一） —— */
function ContactEdit({
  type,
  contact,
  onBack,
  onSave,
}: {
  type: ContactType;
  contact: Contact | null;
  onBack: () => void;
  onSave: (c: Contact) => void;
}) {
  const [name, setName] = useState(contact?.name ?? "");
  const [relationship, setRelationship] = useState(contact?.relationship ?? "");
  const [teacherRole, setTeacherRole] = useState<TeacherRole | "">(
    contact?.teacherRole ?? "",
  );
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [note, setNote] = useState(contact?.note ?? "");

  const isGuardian = type === "guardian";
  const title = contact
    ? isGuardian
      ? "编辑家长"
      : "编辑老师"
    : isGuardian
      ? "新增家长"
      : "新增老师";

  const phoneValid = phone.trim().length >= 3;
  const nameValid = name.trim() !== "";
  // 家长：关系必填；老师：身份必填
  const roleValid = isGuardian
    ? relationship.trim() !== ""
    : teacherRole !== "";
  const canSave = nameValid && phoneValid && roleValid;

  const submit = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    const next: Contact = {
      id: contact?.id ?? genId(),
      type,
      name: name.trim(),
      relationship: isGuardian ? relationship.trim() : undefined,
      teacherRole: !isGuardian ? (teacherRole as TeacherRole) : undefined,
      phone: phone.trim(),
      note: note.trim() || undefined,
      // 编辑保留原紧急联系人身份；新建默认 false
      isEmergencyContact: contact?.isEmergencyContact ?? false,
      createdAt: contact?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(next);
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      <PageHeader title={title} onBack={onBack} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <div className="flex flex-col gap-2.5">
          <FieldRow label="姓名">
            <TextInput
              value={name}
              onChange={setName}
              placeholder="姓名"
              maxLength={30}
            />
          </FieldRow>

          {isGuardian ? (
            <FieldRow label="关系">
              <TextInput
                value={relationship}
                onChange={setRelationship}
                placeholder="如 妈妈 / 爸爸 / 姐姐"
                maxLength={20}
              />
            </FieldRow>
          ) : (
            <div className="rounded-2xl border border-line bg-white px-5 py-4">
              <div className="text-[12px] text-ink-faint">身份</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEACHER_ROLE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setTeacherRole(r)}
                    className={`rounded-xl border px-3 py-2 text-[13px] transition-colors ${
                      teacherRole === r
                        ? "border-ink bg-ink text-canvas"
                        : "border-line bg-white text-ink-soft hover:border-ink-faint"
                    }`}
                  >
                    {TEACHER_ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <FieldRow label="手机号">
            <TextInput
              value={phone}
              onChange={setPhone}
              placeholder="手机号"
              type="tel"
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
    <div className="relative flex h-full flex-col bg-white">
      <PageHeader title="服用安排" onBack={onBack} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-2">
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
                    className="h-4 w-4 shrink-0 text-ink-faint transition-colors hover:text-risk-medium"
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
        className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-action-primary bg-action-primary text-action-primary-text shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)] transition-opacity hover:opacity-90"
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
    <div className="relative flex h-full flex-col bg-white">
      <PageHeader
        title={schedule ? "编辑服用安排" : "新增服用安排"}
        onBack={onBack}
      />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4 pt-2">
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
            style={{ backgroundColor: "var(--z-risk-medium)" }}
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
