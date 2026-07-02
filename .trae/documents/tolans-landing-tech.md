## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层 Frontend"
        "React 18 单页应用"
        "组件化落地页区块"
        "Tailwind 样式系统"
        "Motion 动效"
    end
    subgraph "构建与资源层"
        "Vite 构建"
        "静态资源 / 生成图"
    end
    subgraph "外部链接"
    end
    "前端层 Frontend" --> "构建与资源层"
    "构建与资源层" --> "静态产物 dist"
```

纯前端单页项目，无后端、无数据库。所有内容由组件静态渲染，媒体链接为外链跳转。

## 2. 技术说明
- **前端**：React 18 + Tailwind CSS 3 + Vite
- **初始化工具**：Vite (vite-init, react-ts 模板)
- **动效**：framer-motion（滚动进入淡入上浮、hover 微交互）
- **字体**：Google Fonts 引入特色衬线展示字体 + 人文无衬线正文字体
- **后端**：无
- **数据库**：无
- **图片**：Hero 角色形象使用文生图接口生成，团队头像使用生成图占位

## 3. 路由定义

| 路由 | 用途 |
|-------|---------|
| / | 单页落地页，包含全部区块（导航 / Hero / 数据 / 情感价值 / 角色工艺 / 研发 / 近期报道 / 团队 / 招聘 CTA / 页脚） |

## 4. API 定义
无后端 API。页面内媒体链接均为外链（Wired、New Yorker、Fast Company、OpenAI、Forbes、GeekWire 等原站引用链接）。

## 5. 服务端架构
无后端服务。

## 6. 数据模型
无数据库。页面内容（数据统计、团队信息、报道列表）以静态数据结构内联于组件 / 数据文件中。

### 6.1 静态数据结构

```ts
// 团队成员
type Member = {
  name: string;
  role: string;
  bio: string;
  avatar: string; // 生成图 URL
};

// 媒体报道
type Press = {
  outlet: string;
  title: string;
  url: string;
};

// 数据统计
type Stat = {
  value: string;
  label: string;
};
```

## 7. 目录结构

```
tolans-clone/
  src/
    components/
      Nav.tsx
      Hero.tsx
      Stats.tsx
      ReducingOverwhelm.tsx
      CharacterCraft.tsx
      Research.tsx
      RecentPress.tsx
      Team.tsx
      Hiring.tsx
      Footer.tsx
    data/
      content.ts        // 统计、团队、报道等静态数据
    App.tsx
    main.tsx
    index.css
  index.html
  package.json
  tailwind.config.js
  vite.config.ts
```

## 8. 设计令牌（Tailwind 扩展）

| 令牌 | 值 | 用途 |
|------|------|------|
| color.canvas | #FAFAF9 | 主背景 |
| color.ink | #18181B | 主文字 |
| color.ink-soft | #71717A | 次文字 |
| color.line | #E4E4E7 | 分隔线/描边 |
| color.accent | #E07A5F | 极少量点睛强调 |
| fontFamily.display | 几何无衬线展示字 | 大标题（紧凑字距） |
| fontFamily.body | 中性无衬线 | 正文 |
