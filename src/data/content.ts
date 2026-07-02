export type Member = {
  name: string;
  role: string;
  bio: string;
  initials: string;
};

export const navLinks = [
  { label: "需求", href: "#problem" },
  { label: "技术", href: "#clinical" },
  { label: "角色", href: "#character" },
  { label: "团队", href: "#team" },
  { label: "愿景", href: "#vision" },
];

// 占位：真实信息待 Phase 3 回填
export const team: Member[] = [
  {
    name: "饼饼",
    role: "联合创始人 · 临床方向",
    bio: "占位文案：临床心理学背景，DBT 实践经验，基于亲历经验驱动产品方向。具体履历待回填。",
    initials: "饼",
  },
  {
    name: "步宁",
    role: "联合创始人 · 工程方向",
    bio: "占位文案：技术工程背景，负责产品工程与系统实现。具体履历待回填。",
    initials: "步",
  },
];
