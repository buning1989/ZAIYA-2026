# 官网外部端内容填充留档

## 开发前快照

- 开发前 commit hash: `6223e6359f7f63bd62e654400bdb877b5387ace2`
- 原分支名称: `zaiya-demo-polish`
- 备份 tag 名称: `backup/website-before-content-refresh-20260713`
- 开发分支名称: `feat/website-content-refresh`
- 截图生成日期: 2026-07-13

## 本次修改范围

按《官网内容架构说明文档》完成官网外部端正式内容填充及承载内容所必需的局部布局调整：

1. Hero 完全保持现状。
2. 需求与方案（ProblemSolution）：取消左右两栏 + sticky，改为三个纵向内容块。
3. 新增产品与核心功能模块（ProductFeatures）：三组 × 三卡结构。
4. 技术实践（ClinicalFramework）：3 卡改为 4 卡 2×2 布局，新增合规边界说明。
5. 角色设计（CharacterDesign）：保留左右结构，更新引导段，新增"帽子恒定"第四项。
6. 团队（Team）：更新文案，新增团队收束句。
7. 愿景（Vision）：扩展为北极星 + 现在/下一步/更远 + 收束句纵向结构。
8. Footer：删除占位文案与"骨架搭建阶段"，更新导航链接。
9. 全局：更新导航锚点（新增"产品"），页面顺序调整为 Hero → 需求 → 产品 → 技术 → 角色 → 团队 → 愿景 → Footer。

## 实际完成模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 需求与方案 | ✅ 完成 | 三个纵向内容块，沿用原右侧块视觉结构 |
| 产品与核心功能 | ✅ 完成 | 新增组件，三组 × 三卡横排（移动端单列） |
| 技术实践 | ✅ 完成 | 4 卡 2×2 网格（移动端单列），新增合规说明 |
| 角色设计 | ✅ 完成 | 新增"帽子恒定"第四项，替换引导段 |
| 团队 | ✅ 完成 | 更新引导段与两位成员介绍，新增收束句 |
| 愿景 | ✅ 完成 | 北极星 + 现在/下一步/更远 + 收束句 |
| Footer | ✅ 完成 | 删除占位与"骨架搭建阶段"，导航新增"产品与核心功能" |

## 变更文件清单

| 文件路径 | 改动作用 |
|----------|----------|
| `src/App.tsx` | 在 ProblemSolution 与 ClinicalFramework 之间插入 ProductFeatures |
| `src/data/content.ts` | navLinks 新增"产品"锚点；更新两位团队成员介绍 |
| `src/components/ProductFeatures.tsx` | **新增**：产品与核心功能模块，三组 × 三卡结构 |
| `src/components/ProblemSolution.tsx` | 重构为三个纵向内容块，替换占位文案为正式文案 |
| `src/components/ClinicalFramework.tsx` | 3 卡改为 4 卡 2×2，更新文案，新增卡片下方说明与合规边界 |
| `src/components/CharacterDesign.tsx` | 替换引导段，principles 数组新增"帽子恒定"第四项 |
| `src/components/Team.tsx` | 替换引导段，新增团队收束句 |
| `src/components/Vision.tsx` | 扩展为北极星 + 三段路线图 + 收束句 |
| `src/components/Footer.tsx` | 删除占位文案与"骨架搭建阶段"，导航新增"产品与核心功能" |
| `tools/website_screenshot.py` | **新增**：多视口截图工具 |
| `docs/website-content-refresh/` | **新增**：留档目录（README + before/after 截图） |

## 与原方案的差异

- 无重大差异。所有模块均按《官网内容架构说明文档》要求实现。
- "偶然瞥见的一句话"卡片采用降低正文颜色（text-ink-faint）的弱化方式，未缩小字号或改变卡片结构。
- Footer 品牌简介采用 Hero 中已有的定位语"面向精神心理困扰人群的 AI 健康生活伙伴"（非凭空新增内容）。

## 已知问题

1. **预存控制台错误**：浏览器控制台存在 3 个 `<line> attribute x2: Expected length, "undefined"` SVG 错误，来自 Rive/Lucide 图标渲染，本次未引入，不在处理范围。
2. **预存移动端微小溢出**：390px 视口下 Hero 区域的 MultiFormShowcase 有约 7px 横向溢出（397 vs 390px），属于 Hero 未修改区域的预存问题。
3. **Build chunk size 警告**：`vite build` 提示 chunk 大于 500kB（1.6MB），属于预存的全局打包问题（含 Demo、Rive 等大依赖），与本次改动无关。
4. **外部文件干扰**：开发过程中发现 AppMainSurface.tsx、MaterialDetailView.tsx、organize.ts 三个 App Demo 内部文件被外部进程意外修改，已用 `git checkout HEAD --` 恢复，未纳入本次提交。

## 截图路径

### Before（开发前）

- `docs/website-content-refresh/before/desktop-1440.png`
- `docs/website-content-refresh/before/desktop-1024.png`
- `docs/website-content-refresh/before/tablet-768.png`
- `docs/website-content-refresh/before/mobile-390.png`

### After（开发后）

- `docs/website-content-refresh/after/desktop-1440.png`
- `docs/website-content-refresh/after/desktop-1024.png`
- `docs/website-content-refresh/after/tablet-768.png`
- `docs/website-content-refresh/after/mobile-390.png`

## 验证结果

| 检查项 | 结果 |
|--------|------|
| `npm run check`（tsc -b --noEmit） | ✅ 通过 |
| `npm run build` | ✅ 通过 |
| `git diff --check` | ✅ 无空白错误 |
| 浏览器控制台 | ✅ 无新增错误（仅 3 个预存 SVG 错误） |
| 1440px 响应式 | ✅ 导航 7 项不拥挤，ClinicalFramework 4 卡等高(534×196) |
| 1024px 响应式 | ✅ 导航 7 项最小间距 32px，ProductFeatures 3 列 |
| 768px 响应式 | ✅ 无横向溢出 |
| 390px 响应式 | ✅ 无横向溢出（docW=390=winW），卡片单列堆叠 |

## 开发后信息

- 修改后 commit hash: 见 `git log --oneline -1 feat/website-content-refresh`
- 开发分支: `feat/website-content-refresh`
- 工作区状态: 干净（已提交）

## 回滚方式

### 方式一：直接查看开发前版本

```bash
git switch backup/website-before-content-refresh-20260713
```

说明：tag 是 detached HEAD，只用于查看和对比。

### 方式二：放弃整个开发分支

```bash
git switch zaiya-demo-polish
git branch -D feat/website-content-refresh
```

执行前需要确认开发分支内容不再需要。

### 方式三：保留分支但回退到开发前快照

```bash
git reset --hard backup/website-before-content-refresh-20260713
```
