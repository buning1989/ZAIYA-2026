/* —— 「帮我整理」模块编排器 ——
 *
 * 核心任务：澄清沟通重点并管理信息披露（非"生成报告"）
 * 流程：首页→选择沟通对象→选择整理时间段→确认沟通重点
 *       →确认特殊情况披露→确认沟通内容→完成页
 *
 * 状态管理：统一 session state，localStorage 持久化
 * 返回上一步保留已选择内容
 * 完成后写入「以往整理」并清除进行中会话
 *
 * 通用 communicationTarget 结构，不写死医生
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
  appendHistory,
  getCoverage,
  type CommunicationSession,
  type CommunicationTopic,
  type SpecialDisclosure,
  type RangeKey,
  type CommunicationTargetType,
  type OrganizeHistoryEntry,
} from "@/data/organize";
import HomeStep from "./organize/HomeStep";
import TargetStep from "./organize/TargetStep";
import TimeRangeStep from "./organize/TimeRangeStep";
import TopicsStep from "./organize/TopicsStep";
import DisclosureStep from "./organize/DisclosureStep";
import ConfirmContentStep from "./organize/ConfirmContentStep";
import DoneStep from "./organize/DoneStep";
import MaterialDetailView from "./organize/MaterialDetailView";
import { BottomSheet } from "./organize/shared";

const ease = [0.22, 1, 0.36, 1] as const;

type Step =
  | "home"
  | "target"
  | "range"
  | "topics"
  | "disclosure"
  | "confirm"
  | "done";

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
  const [step, setStep] = useState<Step>("home");
  const [session, setSession] = useState<CommunicationSession | null>(null);
  const [history, setHistory] = useState<OrganizeHistoryEntry[]>(() => {
    const stored = loadHistory();
    return stored.length > 0 ? stored : organizeHistory;
  });
  const [viewingHistory, setViewingHistory] =
    useState<OrganizeHistoryEntry | null>(null);
  const [viewingMaterialFromDone, setViewingMaterialFromDone] =
    useState(false);
  const [restartConfirm, setRestartConfirm] = useState(false);

  /* —— 挂载时恢复未完成会话 —— */
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.status === "in_progress") {
      setSession(saved);
    }
  }, []);

  /* —— session 变化时持久化 —— */
  useEffect(() => {
    if (session && session.status === "in_progress") {
      saveSession(session);
    }
  }, [session]);

  /* —— 历史操作 —— */
  const handleSaveToHistory = (entry: OrganizeHistoryEntry) => {
    const next = appendHistory(history, entry);
    setHistory(next);
    onSaveToHistory?.(entry);
  };

  /* —— 开始 / 重新开始 —— */
  const handleStart = () => {
    if (session && session.status === "in_progress") {
      // 有进行中会话，弹出确认
      setRestartConfirm(true);
    } else {
      // 无进行中会话，直接开始
      const newSession = createInitialSession();
      setSession(newSession);
      setStep("target");
    }
  };

  const handleRestart = () => {
    clearSession();
    const newSession = createInitialSession();
    setSession(newSession);
    setRestartConfirm(false);
    setStep("target");
  };

  const handleContinue = () => {
    setRestartConfirm(false);
    setStep("target");
  };

  /* —— 完成生成 —— */
  const handleGenerate = () => {
    if (!session) return;
    const entry = completeSession(session);
    handleSaveToHistory(entry);
    setSession(entry.session);
    setStep("done");
  };

  /* —— 返回首页 —— */
  const handleBackHome = () => {
    clearSession();
    setSession(null);
    setStep("home");
  };

  /* —— 历史详情视图 —— */
  if (viewingHistory) {
    return (
      <MaterialDetailView
        session={viewingHistory.session}
        title="沟通材料详情"
        onBack={() => setViewingHistory(null)}
      />
    );
  }

  /* —— 完成页查看完整内容 —— */
  if (viewingMaterialFromDone && session) {
    return (
      <MaterialDetailView
        session={session}
        title="完整内容"
        onBack={() => setViewingMaterialFromDone(false)}
      />
    );
  }

  /* —— 步骤渲染 —— */
  const stepTransition = {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
    transition: { duration: 0.25, ease },
  };

  return (
    <div className="relative h-full bg-white">
      <AnimatePresence mode="wait">
        {step === "home" && (
          <motion.div key="home" className="h-full" {...stepTransition}>
            <HomeStep
              onBack={onBack}
              history={history}
              onStart={handleStart}
              onViewHistory={(entry) => setViewingHistory(entry)}
            />
          </motion.div>
        )}

        {step === "target" && session && (
          <motion.div key="target" className="h-full" {...stepTransition}>
            <TargetStep
              session={session}
              onBack={() => setStep("home")}
              onNext={(targetType: CommunicationTargetType, targetLabel: string) => {
                setSession({ ...session, targetType, targetLabel });
                setStep("range");
              }}
            />
          </motion.div>
        )}

        {step === "range" && session && (
          <motion.div key="range" className="h-full" {...stepTransition}>
            <TimeRangeStep
              session={session}
              onBack={() => setStep("target")}
              onNext={(rangeKey: RangeKey) => {
                const cov = getCoverage(rangeKey);
                setSession({
                  ...session,
                  rangeKey,
                  startDate: cov.startDate,
                  endDate: cov.endDate,
                  totalDays: cov.totalDays,
                  recordedDays: cov.recordedDays,
                });
                setStep("topics");
              }}
            />
          </motion.div>
        )}

        {step === "topics" && session && (
          <motion.div key="topics" className="h-full" {...stepTransition}>
            <TopicsStep
              session={session}
              onBack={() => setStep("range")}
              onNext={(topics: CommunicationTopic[]) => {
                setSession({
                  ...session,
                  communicationTopics: recomputeTopicPermissions(topics),
                });
                setStep("disclosure");
              }}
            />
          </motion.div>
        )}

        {step === "disclosure" && session && (
          <motion.div key="disclosure" className="h-full" {...stepTransition}>
            <DisclosureStep
              session={session}
              onBack={() => setStep("topics")}
              onNext={(disclosure: SpecialDisclosure) => {
                setSession({ ...session, specialDisclosure: disclosure });
                setStep("confirm");
              }}
            />
          </motion.div>
        )}

        {step === "confirm" && session && (
          <motion.div key="confirm" className="h-full" {...stepTransition}>
            <ConfirmContentStep
              session={session}
              onBack={() => setStep("disclosure")}
              onGenerate={handleGenerate}
            />
          </motion.div>
        )}

        {step === "done" && session && (
          <motion.div key="done" className="h-full" {...stepTransition}>
            <DoneStep
              session={session}
              onBack={() => setStep("confirm")}
              onViewFull={() => setViewingMaterialFromDone(true)}
              onBackHome={handleBackHome}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 重新开始确认 */}
      <AnimatePresence>
        {restartConfirm && (
          <BottomSheet onClose={() => setRestartConfirm(false)}>
            <div className="text-[16px] font-semibold text-ink">
              重新开始整理？
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              之前的进度将被清除，无法恢复。
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={handleContinue}
                className="flex-1 rounded-xl bg-action-primary py-3 text-[13px] font-medium text-action-primary-text"
              >
                继续整理
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
              >
                重新开始
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
