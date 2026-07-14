export type Member = {
  name: string;
  role: string;
  /** 精简成员分工说明 */
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
    role: "联合创始人 · 康复亲历与精神健康认知",
    paragraphs: [
      "二十年精神心理康复经历，负责用户处境理解、专业框架研究与康复策略设计。",
    ],
    avatar: "./bingbing.png",
  },
  {
    name: "步宁",
    role: "联合创始人 · 产品策略与 AI 落地",
    paragraphs: [
      "长期从事互联网产品与运营，负责用户研究、产品设计、商业判断与 AI 产品开发。",
    ],
    avatar: "./buning.png",
  },
];
