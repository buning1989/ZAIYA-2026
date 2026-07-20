# 在呀 ZÀIYA｜Expo / React Native iOS 48 小时技术验证主方案

## 1. 唯一目标

48 小时结束时，回答：

> 团队是否能够稳定控制 React Native iOS 工程，并在真实 iPhone 上完成“真实 AI 对话—睡眠记录—SQLite 持久化—回看—强退恢复”的完整闭环。

不以页面数量、视觉还原度或动画复杂度作为通过标准。

## 2. 限制条件

- 暂不付费注册 Apple Developer Program。
- 不使用 TestFlight、App Store Connect、Beta Review。
- 使用免费 Apple Account 与 Xcode Personal Team。
- 仅验证 iOS，不做 Android。
- 使用现有 GitHub 仓库，不新建仓库。
- 从稳定 `main` 创建 `spike/ios-48h`。
- 在仓库根目录新建独立 `ios-app/`。
- 现有 Web 保持不动，不迁移、不重构、不建立 monorepo。
- Expo Go 可用于快速预览，但不能作为最终验收。

本轮能验证真机、键盘、导航、AI、SQLite 和稳定性；不能验证 TestFlight 分发和评委安装。

## 3. 固定技术栈

```text
Expo
React Native
TypeScript
Expo Router
expo-video
expo-sqlite
iOS only
```

依赖原则：Expo 官方能力优先；不引入 ORM、多套状态管理、Rive、自定义 Swift 模块、语音、图表或复杂监控。

## 4. 唯一核心闭环

```text
打开 App
→ 首页角色动画
→ 进入 AI 对话
→ 输入一句真实内容
→ 收到真实模型回复
→ 点击“记一下昨晚的睡眠”
→ 填写并保存睡眠记录
→ 进入回头看看
→ 看到刚保存的真实数据
→ 强制结束 App
→ 重新打开
→ 对话和记录仍存在
```

AI 不能停在陪聊，必须连接现实行动与可回看的生活事实。

## 5. 页面和数据范围

只做四页：

```text
首页
AI 对话
睡眠记录
回头看看
```

睡眠字段：

```text
id
记录日期
大概入睡时间
大概起床时间
整体睡眠感受
补充说明
创建时间
更新时间
```

回看只展示日期、入睡、起床、睡眠时长、感受和补充说明。不做趋势图、报告或医学解释。

## 6. 时间安排与硬门槛

### 0～2 小时：独立工程

完成分支、`ios-app/`、Expo 工程、TypeScript、iOS only、竖屏和首次提交。

硬门槛：工程成功、Web 无变化、依赖克制。

建议提交：

```text
chore: initialize ios 48h validation project
```

### 2～6 小时：模拟器与四页导航

完成 Expo Router、四页空壳、返回逻辑和本地 H.264 MP4 循环。

硬门槛：模拟器启动、无白屏、四页可访问、导航无卡死、视频可循环。

### 6～10 小时：真实 iPhone

使用 Personal Team 安装到真机，验证启动、前后台、强退重启、视频和导航。

硬门槛：真机稳定运行。

止损线：12 小时仍不能在真机启动，暂停业务开发并提交故障分析。

### 10～18 小时：原生对话壳

先用本地固定回复。完成消息列表、输入框、发送、loading、长文本、自动滚动、键盘避让和会话状态。

硬门槛：连续 10 条消息正常，键盘不遮挡，返回再进入后会话仍在。

建议提交：

```text
feat: complete native chat interaction shell
```

### 18～28 小时：真实 AI

调用服务端 `POST /api/chat`。客户端只处理：

```json
{
  "reply": "string",
  "suggestedAction": "sleep_record | none",
  "safetyLevel": "normal | boundary | high_risk",
  "requestId": "string"
}
```

必须有超时、断网、手动重试、固定安全降级。密钥只在服务端。暂不做流式、语音、长期记忆或多 Agent。

硬门槛：10 条固定测试至少 9 条成功；普通、边界、高风险有不同处理；不诊断、不提供停药或调药建议。

止损线：28 小时仍不能稳定完成真实 AI，停止新增功能并评估黄色或红色。

### 28～36 小时：SQLite 与记录闭环

最小表：

```text
chat_sessions
chat_messages
sleep_records
```

完成保存会话、消息和睡眠记录；跨午夜时长；回看读取；强退恢复。

硬门槛：

```text
写入 → 回看 → 强退 → 重启 → 仍可读取
```

建议提交：

```text
feat: complete chat to sleep record persistence loop
```

止损线：36 小时仍不能强退恢复，停止新增功能。

### 36～42 小时：闭环与基础质感

串起首页、AI、睡眠记录和回看。只修安全区、间距、字号、按钮、loading、错误、视频比例、输入框和返回路径。

设计原则：黑白为主，绿色只用于行动；无大面积浅绿色；低刺激；不逐像素还原 Web。

### 42～46 小时：稳定性

- 首页与对话往返 20 次；
- 连续发送 10 条；
- 创建 5 条睡眠记录；
- 强退重开 3 次；
- 网络开关；
- 视频循环 10 次；
- 前后台切换 5 次；
- 连续使用 20 分钟；
- 至少一次无调试器运行。

硬门槛：无闪退、卡死、持续按钮失效或数据丢失。

### 46～48 小时：录屏与判定

一镜到底录制：

```text
启动 → 动画 → AI → 真实回复 → 睡眠记录 → 回看 → 强退 → 重启 → 数据仍在
```

完成已知问题、测试结果、最终报告、Git 记录和 `GREEN / YELLOW / RED` 判定。不得合并 `main`。

## 7. 明确禁止

- Android、SwiftUI、Capacitor、TestFlight、App Store Connect；
- 登录、注册、云同步、语音、图片、推送、Widget、Watch；
- Rive、WebM、透明视频、HEVC Alpha、多动画状态；
- 流式 AI、长期记忆、多 Agent；
- 六类记录、趋势图、轻社交、能量、夸夸自己、完整整理材料；
- Guided Demo、官网、家长端、医生端、支付；
- 现有 Web 页面迁移、公共组件重构、monorepo。

## 8. 允许降级

- 透明失败：普通烘焙背景 H.264 MP4。
- 流式失败：完整回复一次展示。
- 语音失败：删除。
- 登录未做：游客模式。
- 云同步未做：本机 SQLite。
- 多种记录来不及：只保留睡眠。
- 分享、触觉、趋势图来不及：删除。

真正影响路线判断的是构建、真机、键盘、导航、AI、持久化、强退恢复和稳定性。

## 9. 红黄绿

### GREEN

真机、键盘、AI、SQLite、回看、强退恢复、20 分钟稳定性和完整录屏全部通过。可继续 React Native 决赛 P0，Web 仍为兜底。

### YELLOW

真机和 AI 可用，但键盘、持久化、导航、稳定性或质感仍有明显问题。原生只作展示，不作为唯一比赛入口，不迁移更多模块。

### RED

12 小时不能真机运行；28 小时不能稳定 AI；36 小时不能持久化；核心路径持续闪退；20 分钟两次以上崩溃；48 小时不能完成完整录屏。停止 React Native，不转 SwiftUI，比赛回到 Web。

## 10. 汇报节点

2、6、10、18、28、36、42、46、48 小时必须停止并汇报：

```text
当前完成内容
真机状态
测试结果
新增依赖
已知问题
是否达到硬门槛
下一阶段计划
Git commit
需要用户人工验收的事项
```
