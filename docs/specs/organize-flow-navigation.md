# Spec: “帮我整理”首页与流程导航

## Objective

把“帮我整理”入口明确为一次沟通准备任务，并让两步流程的视觉结构与“记一下”保持一致：流程页使用细进度条区隔顶部标题和页面引导语，返回只回到上一步且不丢失用户对沟通重点和时间范围的修改；完成页保留返回上一步与返回模块首页两个清晰入口。

## Tech Stack and Commands

- React 18、TypeScript、Vite、Tailwind CSS、Framer Motion、Lucide React
- Type check: `npm run check`
- Build: `npm run build`
- Lint: `npm run lint`

## Project Structure and Style

- `src/components/OrganizePage.tsx`: 流程状态与辅助视图编排
- `src/components/organize/*Step.tsx`: 各流程页面
- `src/data/organize.ts`: 本地 mock、会话和历史持久化
- 沿用现有组件、色彩 token、圆角和字号；流程页标题和引导语使用与“记一下”一致的轻标题层级，不添加依赖或改动其他模块。

## Testing Strategy

- 用 TypeScript 和生产构建覆盖组件契约与编译错误。
- 用源码验收检查指定文案、图标、aria-label、进度条和冲突导航入口。
- 手动主路径：联系人首页 → 沟通重点 → 特殊记录 → 完成页；重点页修改后返回首页再进入时保持修改。

## Boundaries

- Always: 保留现有本地会话；历史记录入口在 demo 阶段只保留禁用 icon 占位；流程页只提供左上返回。
- Ask first: 新增依赖、改动数据模型或把本地状态迁移到后端。
- Never: 返回时清空会话、恢复取消确认弹窗、修改无关模块。

## Success Criteria

1. 首页清楚说明选择沟通对象并整理内容，王医生为主卡片，添加入口为次级入口。
2. 历史记录使用禁用 icon 占位，不进入空白历史页。
3. 沟通重点页和特殊记录页使用“记一下”同款细进度条和右侧弱化步骤数字。
4. 两个流程页返回上一步；沟通重点的选择、编辑、补充和时间范围被保留。
5. 沟通重点页和特殊记录页的页面标题与页面内引导语字号一致。
6. 完成页左上显示返回箭头，返回特殊记录页；重复完成同一 session 不重复追加历史。
7. 完成页右上使用与更多面板「帮我整理」一致的 `FolderOpen`，且 aria-label 为“返回帮我整理首页”。
8. 完成页顶部标题与正文标题字号一致，使用指定标题、中文日期摘要和三级操作。
9. 每次从模块入口进入时先显示沟通对象首页；已有会话只在用户再次选择同一对象后续接。

## Open Questions

无。本次按用户给出的文案和既有本地 mock 数据实现。
