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
      "二十年精神心理康复亲历，熟悉 DSM-5-TR、DBT、CBT、MI 等临床框架，并有中美专业机构专家顾问支持。",
    ],
    avatar: "./bingbing.png",
  },
  {
    name: "步宁",
    role: "联合创始人 · 产品策略与 AI 落地",
    paragraphs: [
      "长期做互联网产品与运营，负责用户研究、产品设计、商业判断与 AI 落地。",
    ],
    avatar: "./buning.png",
  },
];
