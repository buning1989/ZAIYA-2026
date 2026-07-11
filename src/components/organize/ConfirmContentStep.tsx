/* —— 步骤 5/5：确认沟通内容 ——
 * 概要展示：沟通对象、时间段、沟通重点、特殊情况、记录范围
 * 底部主按钮「确认生成材料」+ 次级「返回修改」 */
import { ChevronLeft } from "lucide-react";
import {
  getMaterialTopics,
  formatDateRange,
  RECORD_SCOPE_LABELS,
  type CommunicationSession,
} from "@/data/organize";
import {
  StepProgress,
  PrimaryButton,
  SecondaryButton,
  SourceTag,
} from "./shared";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onGenerate: () => void;
}

export default function ConfirmContentStep({
  session,
  onBack,
  onGenerate,
}: Props) {
  const materialTopics = getMaterialTopics(session);
  const disclosure = session.specialDisclosure;

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
          确认沟通内容
        </h1>
      </div>
      <StepProgress current={5} total={5} />

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 沟通对象 */}
        <Section title="沟通对象">
          <div className="text-[14px] text-ink">{session.targetLabel}</div>
        </Section>

        {/* 整理时间段 */}
        <Section title="整理时间段">
          <div className="text-[14px] text-ink">
            {formatDateRange(session.startDate, session.endDate)}
          </div>
          <div className="mt-1 text-[12px] text-ink-faint">
            共 {session.totalDays} 天，{session.recordedDays} 天有记录
          </div>
        </Section>

        {/* 本次希望讨论的问题 */}
        <Section title="本次希望讨论的问题">
          <div className="flex flex-col gap-2.5">
            {materialTopics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-xl border border-line bg-white px-3.5 py-3"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-ink">
                        {topic.title}
                      </span>
                      <SourceTag sourceType={topic.sourceType} />
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                      {topic.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {materialTopics.length === 0 && (
              <div className="rounded-xl border border-dashed border-line bg-card-soft/20 px-3.5 py-4 text-center text-[12px] text-ink-faint">
                未选择沟通重点
              </div>
            )}
          </div>
        </Section>

        {/* 单独确认的内容 */}
        <Section title="单独确认的内容">
          {disclosure.decision === "include" && disclosure.confirmed ? (
            <div className="text-[13px] text-ink">
              已确认纳入特殊情况
              <div className="mt-1 text-[12px] text-ink-faint">
                包含 {disclosure.count} 条经本人确认的深夜记录
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-ink-soft">
              本次不纳入特殊情况
            </div>
          )}
        </Section>

        {/* 相关记录范围 */}
        <Section title="相关记录范围">
          <div className="flex flex-wrap gap-1.5">
            {RECORD_SCOPE_LABELS.map((label) => (
              <span
                key={label}
                className="rounded-full bg-card-soft/50 px-3 py-1 text-[12px] text-ink-soft"
              >
                {label}
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* 底部按钮：左右排列 */}
      <div className="shrink-0 flex gap-2.5 px-5 pb-8 pt-3">
        <SecondaryButton onClick={onBack}>返回修改</SecondaryButton>
        <PrimaryButton onClick={onGenerate}>确认生成材料</PrimaryButton>
      </div>
    </div>
  );
}

/* —— 小节容器 —— */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
