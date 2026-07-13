export type Member = {
  name: string;
  role: string;
  bio: string;
  initials: string;
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
    name: "饼饼",
    role: "联合创始人 · 临床认知与康复亲历方向",
    bio: "有近二十年的病程与临床康复经历，正系统学习 DSM-5-TR 规范化训练体系，掌握 DBT、CBT、MI 等临床框架，背后有中美顶尖医疗机构专家顾问团支持。她负责的，是把真实的个体处境和家庭困境，转译成产品的判断、边界与支持路径。",
    initials: "饼",
    avatar: "./bingbing.png",
  },
  {
    name: "步宁",
    role: "联合创始人 · 产品策略与 AI 落地方向",
    bio: "长期在头部互联网公司负责产品与运营，擅长从真实用户行为里，找到被忽略的需求。他负责的，是把这些理解变成能被做出来的产品——定位、路径、Demo 形态，以及和 AI 工具的落地协同。",
    initials: "步",
    avatar: "./buning.png",
  },
];
