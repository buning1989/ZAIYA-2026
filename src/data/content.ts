export type Member = {
  name: string;
  role: string;
  /** 精简成员分工说明 */
  paragraphs: string[];
  avatar: string;
};

export const navLinks = [
  { label: "现实缺口", href: "#needs" },
  { label: "用户困境", href: "#pain" },
  { label: "在呀 ZÀIYA", href: "#solution" },
  { label: "关于团队", href: "#team" },
  { label: "未来愿景", href: "#vision" },
];

export const team: Member[] = [
  {
    name: "琪茗",
    role: "项目发起 · 康复亲历与专业框架",
    paragraphs: [
      "二十年精神心理康复亲历，熟悉 DSM-5-TR、DBT、CBT、MI 等临床框架，并有中美专业机构专家顾问支持。",
    ],
    avatar: "./bingbing.png",
  },
  {
    name: "步宁",
    role: "产品共创 · 产品策略与 AI 落地",
    paragraphs: [
      "长期做互联网产品与运营，负责用户研究、产品设计、商业判断与 AI 落地。",
    ],
    avatar: "./buning.png",
  },
];
