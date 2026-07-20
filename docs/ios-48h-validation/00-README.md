# 在呀 ZÀIYA｜iOS 48 小时技术验证文档包

本目录是 Expo / React Native iOS 48 小时技术验证的唯一执行基准。

## 放置位置

```text
ZAIYA-2026/
└─ docs/
   └─ ios-48h-validation/
```

## 使用顺序

1. 完成 `03-environment-preflight.md`。
2. 让 TRAE 阅读 `01-48h-master-plan.md`、`02-stage-task-breakdown.md`、`04-acceptance-checklist.md`、`05-test-cases.md`。
3. 执行 `08-TRAE-read-confirmation-prompt.md`，只确认理解，不开始开发。
4. 用户确认后，从稳定 `main` 创建 `spike/ios-48h`，正式计时。
5. 每到硬门槛停止并汇报，不得自行进入下一阶段。

## 文档清单

- `01-48h-master-plan.md`：全局方案与边界。
- `02-stage-task-breakdown.md`：开发顺序、优先级、用户关注重点。
- `03-environment-preflight.md`：开工前环境检查。
- `04-acceptance-checklist.md`：阶段验收与最终判定。
- `05-test-cases.md`：AI、导航、键盘、数据、视频和稳定性测试。
- `06-known-issues.md`：问题记录模板。
- `07-final-report.md`：最终报告模板。
- `08-TRAE-read-confirmation-prompt.md`：开工前通读确认指令。

## 核心纪律

> 本次验证不是完成正式 iOS App，而是判断团队能否稳定控制 React Native iOS 工程，并完成“真实 AI 对话—睡眠记录—本地持久化—回看”的核心闭环。
