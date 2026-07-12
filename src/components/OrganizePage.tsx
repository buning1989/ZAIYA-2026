/* —— 「帮我整理」模块编排器 ——
 *
 * 流程：选择沟通对象 → 确认沟通重点 → 是否告诉对方特殊记录 → 完成
 *
 * 状态管理：统一 session state，localStorage 持久化
 * 返回上一步保留已选择内容
 * 完成后写入历史记录并清除进行中会话
 *
 * 沟通对象为具体人物（王医生），不写死"医生"
 * 不做诊断、治疗建议、用药建议、因果解释或风险等级判断 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createInitialSession,
  completeSession,
  recomputeTopicPermissions,
  loadSession,
  saveSession,
  clearSession,
  loadHistory,
  saveHistory,
  type CommunicationSession,
  type CommunicationTopic,
  type CommunicationContact,
  type DisclosureDecision,
  type RangeKey,
  type OrganizeHistoryEntry,
} from "@/data/organize";
import ContactStep from "./organize/ContactStep";
import TopicsStep from "./organize/TopicsStep";
import DisclosureStep from "./organize/DisclosureStep";
import DoneStep from "./organize/DoneStep";
import MaterialDetailView from "./organize/MaterialDetailView";
import CommunicationHistoryPage from "./organize/CommunicationHistoryPage";

const ease = [0.22, 1, 0.36, 1] as const;

type Step = "contact" | "topics" | "disclosure" | "done";

type AuxiliaryView = "history" | "historyDetail" | "materialDetail" | null;

function canReuseSessionForContact(
  session: CommunicationSession | null,
  contact: CommunicationContact,
): session is CommunicationSession {
  return (
    !!session &&
    session.status === "in_progress" &&
    session.contactId === contact.id &&
    Array.isArray(session.communicationTopics) &&
    session.communicationTopics.length > 0 &&
    !!session.contactSnapshot
  );
}

interface Props {
  onBack: () => void;
  organizeHistory?: OrganizeHistoryEntry[];
  onSaveToHistory?: (entry: OrganizeHistoryEntry) => void;
  onDeleteHistory?: (id: string) => void;
}

export default function OrganizePage({
  onBack,
  organizeHistory = [],
  onSaveToHistory,
}: Props) {
  const [step, setStep] = useState<Step>("contact");
  const [auxView, setAuxView] = useState<AuxiliaryView>(null);
  const [session, setSession] = useState<CommunicationSession | null>(null);
  const [history, setHistory] = useState<OrganizeHistoryEntry[]>(() => {
    const stored = loadHistory();
    return stored.length > 0 ? stored : organizeHistory;
  });
  const [viewingHistory, setViewingHistory] =
    useState<OrganizeHistoryEntry | null>(null);

  /* —— 挂载时恢复未完成会话 —— */
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setSession(saved);
    }
  }, []);

  /* —— session 变化时持久化 —— */
  useEffect(() => {
    if (session && session.status === "in_progress") {
      saveSession(session);
    }
  }, [session]);

  /* —— 选择沟通对象，创建会话 —— */
  const handleSelectContact = (contact: CommunicationContact) => {
    if (canReuseSessionForContact(session, contact)) {
      setStep("topics");
      return;
    }
    const newSession = createInitialSession(contact);
    setSession(newSession);
    setStep("topics");
  };

  const handleTopicsBack = (
    topics: CommunicationTopic[],
    rangeData: { rangeKey: RangeKey; startDate: string; endDate: string; totalDays: number; recordedDays: number },
  ) => {
    if (!session) return;
    setSession({
      ...session,
      communicationTopics: recomputeTopicPermissions(topics),
      ...rangeData,
    });
    setStep("contact");
  };

  /* —— 确认沟通重点，进入特殊记录披露页 —— */
  const handleTopicsNext = (
    topics: CommunicationTopic[],
    rangeData: { rangeKey: RangeKey; startDate: string; endDate: string; totalDays: number; recordedDays: number },
  ) => {
    if (!session) return;
    setSession({
      ...session,
      communicationTopics: recomputeTopicPermissions(topics),
      rangeKey: rangeData.rangeKey,
      startDate: rangeData.startDate,
      endDate: rangeData.endDate,
      totalDays: rangeData.totalDays,
      recordedDays: rangeData.recordedDays,
    });
    setStep("disclosure");
  };

  /* —— 完成特殊记录披露决策，进入完成页 —— */
  const handleDisclosureComplete = (decision: DisclosureDecision) => {
    if (!session) return;
    const updatedSession: CommunicationSession = {
      ...session,
      specialDisclosure: {
        ...session.specialDisclosure,
        decision,
        confirmed: true,
        allowedInMaterial: decision === "include",
      },
    };
    const entry = completeSession(updatedSession);
    const existingIndex = history.findIndex((item) => item.id === entry.id);
    const nextHistory =
      existingIndex >= 0
        ? history.map((item) => (item.id === entry.id ? entry : item))
        : [entry, ...history];
    saveHistory(nextHistory);
    setHistory(nextHistory);
    if (existingIndex < 0) {
      onSaveToHistory?.(entry);
    }
    setSession(entry.session);
    clearSession();
    setStep("done");
  };

  /* —— 从完成页返回整理主页（contact）—— */
  const handleDoneHome = () => {
    setSession(null);
    setStep("contact");
  };

  /* —— 查看历史详情 —— */
  const handleViewHistoryDetail = (entry: OrganizeHistoryEntry) => {
    setViewingHistory(entry);
    setAuxView("historyDetail");
  };

  /* —— 历史变更回调 —— */
  const handleHistoryChange = (next: OrganizeHistoryEntry[]) => {
    setHistory(next);
  };

  /* —— 渲染辅助视图 —— */
  if (auxView === "history") {
    return (
      <CommunicationHistoryPage
        history={history}
        onBack={() => setAuxView(null)}
        onViewDetail={handleViewHistoryDetail}
        onHistoryChange={handleHistoryChange}
      />
    );
  }

  if (auxView === "historyDetail" && viewingHistory) {
    return (
      <MaterialDetailView
        session={viewingHistory.session}
        title="沟通材料详情"
        onBack={() => {
          setAuxView("history");
          setViewingHistory(null);
        }}
      />
    );
  }

  if (auxView === "materialDetail" && session) {
    return (
      <MaterialDetailView
        session={session}
        title="完整内容"
        onBack={() => setAuxView(null)}
      />
    );
  }

  /* —— 渲染主流程 —— */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.25, ease }}
        className="h-full"
      >
        {step === "contact" && (
          <ContactStep
            onBack={onBack}
            onSelectContact={handleSelectContact}
          />
        )}

        {step === "topics" && session && (
          <TopicsStep
            session={session}
            onBack={handleTopicsBack}
            onNext={handleTopicsNext}
          />
        )}

        {step === "disclosure" && session && (
          <DisclosureStep
            session={session}
            onBack={() => setStep("topics")}
            onComplete={handleDisclosureComplete}
          />
        )}

        {step === "done" && session && (
          <DoneStep
            session={session}
            onBack={() => setStep("disclosure")}
            onHome={handleDoneHome}
            onViewMaterial={() => setAuxView("materialDetail")}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
