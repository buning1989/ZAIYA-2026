/* —— 沟通材料详情 / 完整内容视图 ——
 * 用 buildFullMaterial() 渲染统一结构
 * 从历史进入时标题「沟通材料详情」
 * 从完成页「查看完整内容」进入时标题「完整内容」 */
import { ChevronLeft } from "lucide-react";
import {
  buildFullMaterial,
  formatDateRange,
  formatCreatedAt,
  getMaterialTopics,
  type CommunicationSession,
  type MaterialSection,
} from "@/data/organize";
import { SourceTag } from "./shared";

interface Props {
  session: CommunicationSession;
  title?: string;
  onBack: () => void;
}

export default function MaterialDetailView({
  session,
  title = "沟通材料详情",
  onBack,
}: Props) {
  const sections = buildFullMaterial(session);
  const materialTopics = getMaterialTopics(session);

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
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
      </div>

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8">
        {/* 顶部信息 */}
        <div className="mt-2 rounded-2xl border border-line bg-card-soft/20 px-4 py-3.5">
          <div className="text-[14px] font-medium text-ink">
            给{session.targetLabel}的沟通材料
          </div>
          <div className="mt-1.5 flex flex-col gap-0.5 text-[12px] text-ink-faint">
            <div>
              {formatDateRange(session.startDate, session.endDate)}（共{" "}
              {session.totalDays} 天，{session.recordedDays} 天有记录）
            </div>
            <div>创建于 {formatCreatedAt(session.createdAt)}</div>
            <div>
              已确认 {materialTopics.length} 项沟通重点
            </div>
          </div>
        </div>

        {/* 材料各段 */}
        <div className="mt-4 flex flex-col gap-4">
          {sections.map((section) => (
            <MaterialSectionBlock key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* —— 材料段渲染 —— */
function MaterialSectionBlock({ section }: { section: MaterialSection }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
        {section.title}
      </div>

      {/* 段落文本 */}
      {section.paragraph && (
        <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">
          {section.paragraph}
        </p>
      )}

      {/* 沟通重点列表 */}
      {section.topics && section.topics.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {section.topics.map((topic, i) => (
            <div key={i} className="rounded-xl bg-card-soft/30 px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-ink">
                  {i + 1}. {topic.title}
                </span>
                <SourceTag sourceType={topic.sourceType} />
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                {topic.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 相关记录事实 */}
      {section.facts && section.facts.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {section.facts.map((fact, i) => (
            <div key={i}>
              <div className="text-[12.5px] font-medium text-ink">
                {fact.topicTitle}
              </div>
              <ul className="mt-1.5 flex flex-col gap-1">
                {fact.evidence.map((e, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[12px] leading-relaxed text-ink-soft"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* 特殊情况 */}
      {section.disclosure && (
        <div className="mt-2.5">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {section.disclosure.summary}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {section.disclosure.detailRecords.map((r, i) => (
              <li
                key={i}
                className="flex gap-2 text-[12px] leading-relaxed text-ink-soft"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 其他记录概览 */}
      {section.otherRecords && section.otherRecords.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {section.otherRecords.map((rec, i) => (
            <div key={i}>
              <div className="text-[12.5px] font-medium text-ink">
                {rec.title}
              </div>
              <ul className="mt-1.5 flex flex-col gap-1">
                {rec.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[12px] leading-relaxed text-ink-soft"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
