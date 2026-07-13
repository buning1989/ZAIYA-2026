# 媒体资源加载性能审计

生成时间：2026-07-13
基线 tag：`pre-media-performance-optimization-20260713`

## 1. Top 20 最大媒体资源（按文件大小降序）

| # | 文件路径 | 格式 | 大小 | 分辨率 | 帧率 | 时长 | 音轨 | 透明通道 | 引用位置 | 首屏加载 | 同时自动播放 |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| 1 | `public/assets/social/daze/scene-together-1.gif` | GIF | 66.19 MB | 640×1144 | 10 fps | 147 帧 (~14.7s) | 否 | 否 | **未引用（孤立资源）** | 否 | — |
| 2 | `public/assets/zaiya/zaizai-sleeping-breathing.gif` | GIF | 7.14 MB | 640×640 | 10 fps | 51 帧 | 否 | 否 | **未引用（孤立资源）** | 否 | — |
| 3 | `public/assets/zaiya/zaizai-open-curtains.gif` | GIF | 6.45 MB | 640×640 | 10 fps | 51 帧 | 否 | 否 | **未引用（孤立资源）** | 否 | — |
| 4 | `public/assets/zaiya/zaizai-reading-night.gif` | GIF | 5.98 MB | 640×640 | 10 fps | 51 帧 | 否 | 否 | **未引用（孤立资源）** | 否 | — |
| 5 | `public/assets/zaiya/wake-up.gif` | GIF | 5.89 MB | 640×1138 | 10 fps | 51 帧 | 否 | 否 | `ZaiyaWakeAnimation`（phone-app / dialog 变体）+ `DemoWidgetScreen` | **是**（Hero MultiFormShowcase app 表面 + Demo Widget 首节点） | 是 |
| 6 | `public/assets/zaiya/zaizai-idle-lean-back-slow.gif` | GIF | 3.93 MB | 640×640 | 10 fps | 71 帧 | 否 | 否 | `ZaiyaWakeAnimation`（desktop-widget / watch 变体） | **是**（Hero MultiFormShowcase widget / watch 表面） | 是 |
| 7 | `public/assets/social/daze/action-lean-back.gif` | GIF | 3.93 MB | 640×640 | 10 fps | 71 帧 | 否 | 否 | `PresenceRoom.DazeFlow` 准备态 carousel | 否 | 是（多 GIF 同屏 carousel） |
| 8 | `public/assets/social/daze/action-quick-idle.gif` | GIF | 2.98 MB | 640×640 | 10 fps | 51 帧 | 否 | 否 | `PresenceRoom.DazeFlow` 准备态 carousel | 否 | 是 |
| 9 | `public/assets/social/daze/action-shake-head.gif` | GIF | 2.98 MB | 640×640 | 10 fps | 51 帧 | 否 | 否 | `PresenceRoom.DazeFlow` 准备态 carousel | 否 | 是 |
| 10 | `public/assets/social/daze/together-bgm.mp3` | MP3 | 2.25 MB | — | — | — | 是 | — | `PresenceRoom.DazeFlow` BGM | 否 | 是 |
| 11 | `public/assets/zaiya/zaiya-transparent.webm` | WebM VP9 | 1.77 MB | 720×1280 | 24 fps | 5.04s | 否 | **声明透明但实际 yuv420p（无 alpha）** | `ZaizaiVideo`（默认 src） | **是**（Hero MultiFormShowcase app 表面 + Demo） | 是 |
| 12 | `public/assets/zaiya/kling-4403-transparent.webm` | WebM VP9 | 1.74 MB | 720×1280 | 24 fps | 5.04s | 否 | 同上无 alpha | **未引用（孤立资源）** | 否 | — |
| 13 | `public/assets/zaiya/privacy-peek-transparent.webm` | WebM VP9 | 1.71 MB | 720×1280 | 24 fps | 5.04s | 否 | 同上无 alpha | `PrivacyPage` 右上角装饰视频 | 否 | 是 |
| 14 | `public/presence-characters/assistant_character.riv` | Rive | 1.65 MB | — | — | — | — | — | **未引用（孤立资源）** | 否 | — |
| 15 | `public/zaizai.riv` | Rive | 1.65 MB | — | — | — | — | — | **未引用（孤立资源，`ZaizaiRive` 组件已不再被使用）** | 否 | — |
| 16 | `public/assets/zaiya/zaiya-vertical-white.mp4` | MP4 H264 | 1.60 MB | 720×1280 | 24 fps | 5.04s | 否 | 否 | **未引用（孤立资源）** | 否 | — |
| 17 | `public/assets/zaiya/breathing-bgm.mp3` | MP3 | 1.44 MB | — | — | — | 是 | — | `BreathingFlow` BGM | 否 | 是 |
| 18 | `public/buning.png` | PNG | 1.18 MB | — | — | — | — | — | `Team` 团队头像 | 否 | — |
| 19 | `public/bingbing.png` | PNG | 1.03 MB | — | — | — | — | — | `Team` 团队头像 | 否 | — |
| 20 | `public/assets/zaiya/zaiya-wave.mp4` | MP4 H264 | 1.01 MB | 1280×720 | 24 fps | 5.04s | 否 | 否 | **未引用（孤立资源）** | 否 | — |
| 21 | `public/assets/social/daze/scene-together-15s.webm` | WebM VP9 | 0.92 MB | 640×1144 | 10 fps | 14.7s | 否 | 否 | `PresenceRoom.DazeFlow` 全屏背景 | 否 | 是 |
| 22 | `public/assets/zaiya/zaiya-wave-poster.png` | PNG | 0.85 MB | — | — | — | — | — | `ZaizaiVideo` poster 首帧 | 是（作为 video poster） | — |
| 23 | `public/lil_guy.riv` | Rive | 0.81 MB | — | — | — | — | — | `ZaizaiRive.ZAIZAI_RIVE_SRC`（组件未实际渲染，仅导出常量） | 否（潜在） | — |
| 24 | `public/assets/homepage-animations/根往下扎…webm` | WebM VP9 | 0.62 MB | 720×720* | 24 fps | ~5s | 否 | 否 | `homeTimePhase.HOME_PHASE_SCENE.forenoon` | 否（按时间相位懒触发） | 是 |
| 25 | `public/presence-characters/orbix.riv` | Rive | 0.57 MB | — | — | — | — | — | **未引用（孤立资源）** | 否 | — |
| 26 | `public/assets/social/eat/scene-eating-plaza.webm` | WebM VP9 | 0.36 MB | 640×1144 | 10 fps | 13s | 否 | 否 | `PresenceRoom.EatFlow` 全屏背景 | 否 | 是 |
| 27–33 | `public/assets/homepage-animations/*.webm`（其余 6 个时段） | WebM VP9 | 0.16–0.39 MB | 720×720* | 24 fps | ~5s | 否 | 否 | `homeTimePhase.HOME_PHASE_SCENE` 按时段 | 否 | 是（仅当前相位） |
| 34–39 | `public/assets/social/eat/food-*.webm`（6 个食物） | WebM VP9 | 15–23 KB | 640×640 | 10 fps | ~3s | 否 | 否 | `PresenceRoom.EatFlow` 食物 carousel | 否 | 是（carousel 多视频） |
| 40–43 | `public/assets/zaiya/dialogue/zaiya-dialogue-*.webm` | WebM VP9 | 64–140 KB | 640×788 | 10 fps | 3.1–4.6s | 否 | 否 | `DialogueZaiyaAnimation`（**4 个视频常驻叠层，全部 preload="auto"**） | 否（仅 dialog 模式） | 是（4 视频常驻） |

\* homepage-animations 实际分辨率未单独探测，按命名规格推断为正方形。

## 2. 关键发现

### 2.1 P0 严重问题
1. **`scene-together-1.gif` 66 MB 孤立资源**：未在代码中引用，但仍位于 `public/`，会被构建原样拷贝到 dist（虽不发起请求，但占仓库体积）。需删除或归档。
2. **首屏同时自动播放多个 GIF**：Hero 的 `MultiFormShowcase` 在 app / widget / watch 三个 surface 切换时，每个 surface 内的 `ZaiyaWakeAnimation` 都直接 `<img src=*.gif>` 全量加载。首屏至少加载 `wake-up.gif` (5.89 MB) + `zaizai-idle-lean-back-slow.gif` (3.93 MB) = **9.82 MB GIF**。
3. **`ZaizaiVideo` 使用 `preload="auto"` + 无条件 `autoPlay`**：在 Hero 的 app surface、Demo 各处、CharacterDesign、PraisePage、RecordFlow、BreathingFlow 等 7+ 处使用，每处都全量预加载 1.77 MB webm。
4. **`DialogueZaiyaAnimation` 4 个视频常驻 + `preload="auto"`**：进入 dialog 模式时一次性加载 4 个 webm（idle/listening/thinking/responding 共 ~353 KB），即使只显示一个。
5. **`PresenceRoom` 两个沉浸场景（Daze / Eat）**：场景视频 + carousel 多 GIF/视频 + BGM 全部 `preload="auto"` + `autoPlay`，未做可视区懒加载。
6. **孤立资源占用约 90 MB+**：`scene-together-1.gif`、`zaizai-sleeping-breathing.gif`、`zaizai-open-curtains.gif`、`zaizai-reading-night.gif`、`kling-4403-transparent.webm`、`zaiya-vertical-white.mp4`、`zaiya-wave.mp4`、`zaizai.riv`、`assistant_character.riv`、`orbix.riv` 等均未被代码引用，但会被 Vite 原样拷贝到 dist。

### 2.2 P1 性能问题
1. **GIF 格式**：项目内 9 个 GIF 共 ~107 MB（含 66 MB 孤立），全部应替换为 WebM/MP4 + 静态 WebP 首帧。
2. **"transparent" webm 实际无 alpha 通道**：所有标称 transparent 的 webm 实际 `pix_fmt=yuv420p`，无透明通道。可作为普通视频处理，无需 GIF 透明 fallback。
3. **Rive 库 `@rive-app/react-canvas` 全量打包进主 chunk**：被 `Logo.tsx`（首屏）和 `ZaizaiRive.tsx`（未使用）引用。首屏 Logo 用 Rive 渲染 23 KB 的 `color_eyes_interaction.riv`，却把整个 Rive runtime 拉进主包。
4. **`ZaizaiRive`、`RivePlayer` 未做 `React.lazy`**：Rive runtime 进入主 bundle。
5. **`UnifiedDemoStage` 及其全部子组件（10+ 个 Demo 流程）静态 import**：落地页打开就加载完整 Demo 代码，主 JS ~1.46 MB。

### 2.3 资源体积统计

- **GIF 总量**：~107.19 MB（含 1 个 66 MB 孤立）
- **WebM 总量**：~9.06 MB
- **MP4 总量**：~2.61 MB（含 2 个孤立共 2.61 MB）
- **MP3 总量**：~3.70 MB
- **Rive 总量**：~4.99 MB（含 4 个孤立共 ~3.07 MB）
- **PNG/JPG 总量**：~3.07 MB

**首屏媒体请求总量（当前）**：
- `wake-up.gif` 5.89 MB
- `zaizai-idle-lean-back-slow.gif` 3.93 MB
- `zaiya-transparent.webm` 1.77 MB（app surface 切到时加载）
- `zaiya-wave-poster.png` 0.85 MB
- `color_eyes_interaction.riv` 23 KB
- **≈ 12.45 MB**（远超 5 MB 预算）

## 3. 优化目标对齐

| 维度 | 当前 | 目标 |
|---|---|---|
| 首屏媒体总量 | ~12.45 MB | ≤ 5 MB |
| GIF 请求数 | 2（首屏）+ 5（沉浸场景） | 0 |
| 主 JS | ~1.46 MB | 拆分 Demo / Rive / 沉浸场景 / 记录等 |
| 沉浸场景同时加载 | Daze + Eat 可能同时挂载 | 任意时刻仅 1 个 |
| DialogueZaiyaAnimation | 4 视频 preload=auto 常驻 | 仅 active 状态加载 + 懒挂载 |
