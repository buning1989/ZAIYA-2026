/* —— 复诊整理页面数据 ——
 * 在两周后故事结束后，新增独立展示区块。
 * 展示日常碎片如何整理成专业人士可理解的信息。
 */

export type ConsultationStep = {
  title: string;
  description: string;
};

export type InfoCard = {
  dimension: string;
  info: string;
};

export type StakeholderValue = {
  target: string;
  description: string;
};

export const consultationSteps: ConsultationStep[] = [
  {
    title: "日常自然留下",
    description:
      "对话、练习和生活记录，都在低压力互动中发生。不需要额外填写一份复杂病历。",
  },
  {
    title: "系统自动提炼",
    description:
      "识别持续变化、异常情况和需要向医生确认的问题。把几十天的信息压缩成几分钟能看懂的重点。",
  },
  {
    title: "小晨确认后导出",
    description:
      "她可以修改、补充或删除内容，确认后再发送。她始终拥有自己信息的决定权。",
  },
];

export const infoCards: InfoCard[] = [
  {
    dimension: "睡眠",
    info: "多数时间凌晨 0:30—2:00 入睡",
  },
  {
    dimension: "用药",
    info: "30 天内漏服 4 次",
  },
  {
    dimension: "身体反应",
    info: "白天困倦出现 18 天",
  },
  {
    dimension: "学校功能",
    info: "30 天内 7 天未到校",
  },
];

export const stakeholderValues: StakeholderValue[] = [
  {
    target: "对小晨",
    description:
      "不用在十几分钟里，重新回忆这一个月。说不清的状态，已经被整理成她真正想和医生讨论的问题。",
  },
  {
    target: "对家长",
    description:
      "从\u201c她最近到底怎么样\u201d，变成看得见的事实。减少只凭印象和情绪判断，也不让微小变化被忽略。",
  },
  {
    target: "对医生",
    description:
      "先看连续趋势，再把时间用在临床判断上。更快了解用药执行、身体反应、睡眠和社会功能变化。",
  },
];

export const consultationPageContent = {
  tag: "下一次复诊前",
  title: "一个月的零散日常，变成医生能快速理解的复诊材料。",
  subtitle:
    "睡眠、饮食、用药、情绪和到校情况，在日常互动中自然留下；小晨确认后，再整理成复诊重点。",
  disclaimer:
    "报告只陈述用户记录的事实与变化，不判断药物因果，不提供诊断或治疗建议。",
  closing: "在呀不替医生做判断。它把诊室之外的真实生活，带进诊室。",
};
