## 1. 产品概述

本项目是对 Tolan 官网（https://www.tolans.com/）的视觉与内容复刻。Tolan 是一款「AI 外星伙伴」陪伴类 App，官网以温暖、角色驱动的编辑式单页落地页，呈现产品价值、用户数据、媒体背书、研发理念与团队介绍。

- 核心目的：忠实复刻原站的内容结构、叙事节奏与温暖角色感，呈现一款 AI 陪伴产品的官网气质
- 目标用户：对 AI 陪伴产品感兴趣的潜在用户、媒体研究者、潜在求职者
- 价值定位：通过角色形象 + 真实数据 + 媒体背书 + 团队介绍，建立「值得信赖的 AI 伙伴」认知

## 2. 核心功能

### 2.1 用户角色
本站为单页静态落地页，无角色区分与登录体系。

### 2.2 功能模块
1. **落地页（单页）**：顶部导航、Hero、数据统计、情感价值、角色与工艺、研究与开发、近期报道、团队、招聘 CTA、页脚

### 2.3 页面详情

| 页面名称 | 模块名称 | 功能描述 |
|-----------|-------------|---------------------|
| 落地页 | 顶部导航 | Tolan logo + 锚点导航（About / Research / Press / Careers）+ App Store 下载按钮 |
| 落地页 | Hero | 主标题「A friend who gets you」+ 外星角色形象 + 「Watch the Trailer」「Download on the App Store」双按钮 |
| 落地页 | 数据统计 | 四项关键数据：100,000+ Subscribers / 2M+ hours / 4.8-Star Rating / 130,000+ reviews |
| 落地页 | Reducing Overwhelm | 调研数据 85.6% / 72.5% + Wired、New Yorker 媒体引用卡片 |
| 落地页 | Character & Craft | 角色与工艺叙事文案 + Fast Company、Designing Tolan 链接 |
| 落地页 | Research & Development | 研发理念文案 + Raindrop、Claudified、OpenAI GPT-5.1、Braintrust 链接 |
| 落地页 | Recent Press | 媒体报道卡片列表（GeekWire、Forbes、Fast Company、New Yorker、Every 播客） |
| 落地页 | The Team | 6 位团队成员卡片（头像、姓名、职位、简介） |
| 落地页 | We're Hiring | 招聘 CTA 文案 + 跳转链接 |
| 落地页 | 页脚 | 版权信息、社交链接、法律声明 |

## 3. 核心流程

用户进入页面 → 浏览 Hero 主视觉与角色 → 向下滚动依次阅读数据统计、情感价值、媒体背书 → 了解角色工艺与研发理念 → 浏览近期报道 → 认识团队 → 点击「Download on the App Store」下载或「We're Hiring」查看招聘。

```mermaid
flowchart LR
    "进入落地页" --> "Hero 主视觉"
    "Hero 主视觉" --> "数据统计"
    "数据统计" --> "情感价值 Reducing Overwhelm"
    "情感价值 Reducing Overwhelm" --> "Character & Craft"
    "Character & Craft" --> "Research & Development"
    "Research & Development" --> "Recent Press"
    "Recent Press" --> "The Team"
    "The Team" --> "We're Hiring CTA"
    "We're Hiring CTA" --> "点击下载 App"
    "We're Hiring CTA" --> "查看招聘"
```

## 4. 用户界面设计

### 4.1 设计风格
- **整体调性**：极简工具风（Linear / Notion / Raycast 感）。原站全部内容保留，但视觉以克制、留白、纯色执行，去除大插画与强装饰
- **主色**：近白底（#FAFAF9 系）+ 近黑文字（#18181B 系）+ 单一克制强调色（#E07A5F 系用于极少量点睛）+ 中性灰阶分层
- **按钮**：小圆角（6–8px），近黑填充主按钮 + 描边/幽灵次按钮
- **字体**：几何无衬线展示字（标题，紧凑字距）+ 中性无衬线正文，避免衬线与装饰字
- **布局**：桌面优先，纵向叙事，窄内容栏居中、大量留白，网格克制对齐
- **图标**：简洁线性 1.5px，无 emoji，无大插画
- **角色形象**：不使用大插画；外星伙伴以小型几何字符标记（logo/glyph）形式克制出现，保持工具感

### 4.2 页面设计概览

| 页面名称 | 模块名称 | UI 元素 |
|-----------|-------------|-------------|
| 落地页 | Hero | 居中大标题「A friend who gets you」+ 副文案 + 双按钮，顶部小型几何角色 glyph 标记，进入时标题/按钮依次淡入上浮 |
| 落地页 | 数据统计 | 四列网格，大数字 + 小说明，滚动进入时数字区块依次上浮 |
| 落地页 | Reducing Overwhelm | 左文右引用卡，引文使用衬线大字 |
| 落地页 | Character & Craft | 上下叙事 + 横向链接列表，hover 下划线滑动 |
| 落地页 | Research & Development | 同上结构，配色/排版略作区分 |
| 落地页 | Recent Press | 卡片网格，含出处标识，hover 轻微上浮 |
| 落地页 | The Team | 三列两行成员卡片，圆角头像，hover 显示更多 |
| 落地页 | We're Hiring | 整宽 CTA 区，深色背景反差 |
| 落地页 | 页脚 | 极简多列链接 |

### 4.3 响应式
- 桌面优先（≥1024px）：多列网格、双栏叙事
- 平板（768–1024px）：网格降为两列
- 移动端（<768px）：单栏纵向，导航折叠为汉堡菜单，Hero 角色置于标题下方

### 4.4 3D 场景指引
本项目不使用 3D 场景，角色形象以 2D 插画/生成图呈现。

## 5. 复刻范围与约束
- 内容来源：原站文案、数据、团队成员、媒体链接均来自 tolans.com 公开页面
- 不复刻：实际 App 下载能力、视频播放（仅做按钮/占位）、后端逻辑
- 角色图片：使用文生图接口生成一张温暖风格的外星伙伴形象作为 Hero 视觉
