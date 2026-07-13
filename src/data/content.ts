export type Member = {
  name: string;
  role: string;
  bio: string;
  initials: string;
  avatar: string;
};

export const navLinks = [
  { label: "需求", href: "#problem" },
  { label: "技术", href: "#clinical" },
  { label: "角色", href: "#character" },
  { label: "团队", href: "#team" },
  { label: "愿景", href: "#vision" },
];

export const team: Member[] = [
  {
    name: "饼饼",
    role: "联合创始人 · 临床认知与康复亲历方向",
    bio: "具备长期康复亲历经验与系统化临床心理训练背景，负责将真实个体和家庭处境转译为产品判断、风险边界和支持路径。",
    initials: "饼",
    avatar: "./bingbing.png",
  },
  {
    name: "步宁",
    role: "联合创始人 · 产品策略与 AI 落地方向",
    bio: "产品经理与策略运营背景，负责产品定位、用户路径、参赛叙事、Demo 形态和 AI 工具落地协同。",
    initials: "步",
    avatar: "./buning.png",
  },
];
