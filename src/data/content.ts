export type Member = {
  name: string;
  role: string;
  /** 段落文案，支持 **加粗** 标记 */
  paragraphs: string[];
  avatar: string;
};

export const navLinks = [
  { label: "需求", href: "#problem" },
  { label: "产品", href: "#product" },
  { label: "技术", href: "#clinical" },
  { label: "角色", href: "#character" },
  { label: "团队", href: "#team" },
  { label: "愿景", href: "#vision" },
];

export const team: Member[] = [
  {
    name: "琪茗",
    role: "联合创始人 · 精神健康认知与康复策略",
    paragraphs: [
      "**二十年双相Ⅱ型障碍亲历**，现已临床康复。接受基于 DSM-5-TR 的 GPM 系统治疗规范化培训，以及特殊教育、家庭教育、社会工作、职业生涯与心理咨询相关训练。",
      "擅长从个体、家庭、学校与社会功能的**整体视角**理解问题，并将专业框架与亲历经验转化为产品判断。团队有中美顶尖医疗机构专家顾问团支持。",
    ],
    avatar: "./bingbing.png",
  },
  {
    name: "步宁",
    role: "联合创始人 · 产品策略与 AI 落地",
    paragraphs: [
      "长期从事头部互联网产品与运营，具备用户研究、产品设计、商业策略与项目落地经验。",
      "擅长识别未被表达的**真实需求**，把复杂问题转化为**低门槛、可执行、可验证**的产品，并借助 AI 完成开发与持续迭代。",
    ],
    avatar: "./buning.png",
  },
];
