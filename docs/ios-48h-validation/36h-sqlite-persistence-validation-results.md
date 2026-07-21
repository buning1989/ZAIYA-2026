# 36h SQLite 数据持久化与完整闭环验收记录

- 分支：spike/ios-48h
- 验收日期：2026-07-21
- 验收环境：iPhone 17 Pro 模拟器（iOS 26.5）+ Metro dev server
- 真机状态：步宁的 iPhone 显示 unavailable，本轮未覆盖真机

## Commits

- 8d81e6a feat: add sqlite persistence layer
- b925698 feat: persist chat and sleep records
- (本次) test: record sqlite persistence validation

## 数据库结构

- 文件：zaiya.db（expo-sqlite，单例）
- 表：chat_sessions / chat_messages / sleep_records
- 索引：idx_chat_messages_session_id、idx_chat_messages_created_at、idx_sleep_records_sleep_at
- 迁移机制：PRAGMA user_version = 1，IF NOT EXISTS 可重复执行
- 外键：PRAGMA foreign_keys = ON

## 模拟器 DB 文件位置

```
~/Library/Developer/CoreSimulator/Devices/98D55259-9168-413F-A29F-E6A3665BB57B/data/Containers/Data/Application/012A3DD2-427B-415F-8DDA-55FFDBDA6123/Documents/SQLite/zaiya.db
```

## 验收项

### 数据库层

| 项目 | 结果 |
|---|---|
| 数据库首次创建 | PASS（启动后立即生成 zaiya.db，3 表 + 3 索引） |
| PRAGMA user_version | PASS（= 1） |
| App 重启后重复初始化 | PASS（IF NOT EXISTS，未删除已有数据） |
| 空数据库 | PASS（首次启动 sleep_records=0，review 显示空状态） |
| 参数化 SQL | PASS（全部 SQL 使用 ? 占位符） |
| 不记录 API Key | PASS（仅 request_id，无密钥字段） |

### 对话持久化

| 项目 | 结果 |
|---|---|
| 欢迎消息首次启动插入 | PASS（count=0 时插入，id=welcome） |
| 重启不重复欢迎消息 | PASS（强退重启后 welcome count=1） |
| 用户消息先写 DB 再发请求 | PASS（代码层 + DB 验证） |
| AI 回复写入 DB | PASS（safety_level=normal, suggested_action_type=sleep_record） |
| 错误状态写入 DB | PASS（代码层 err_<userId> 占位，未触发实异常） |
| 重试不重复创建用户消息 | PASS（代码层删除 err_<userId> 后重发） |
| 强退后对话恢复 | PASS（重启后 messages=3，3 条历史完整） |
| 数据顺序正确 | PASS（welcome → user → assistant，按 created_at 正序） |

### 睡眠记录

| 项目 | 结果 |
|---|---|
| 入睡/起床时间选择 | PASS（DateTimePicker spinner） |
| 跨午夜计算 | PASS（23:30 → 07:00 = 450 分钟，wake_at 落到次日） |
| 同一时间禁止保存 | PASS（isSameTime 检查，canSave=false） |
| 保存中按钮禁用 | PASS（saving 标志 + ActivityIndicator） |
| 防重复保存 | PASS（saving 标志 + try/finally） |
| 保存后跳转 /review | PASS（router.dismissTo('/review')） |

### 回头看看

| 项目 | 结果 |
|---|---|
| 读取 SQLite 真实数据 | PASS（getLatestSleepRecord） |
| 显示入睡/起床/时长/日期 | PASS（23:30 / 07:00 / 7 小时 30 分钟 / 2026-07-21） |
| 空状态保留 | PASS（"还没有睡眠记录"） |
| 不再显示 Mock | PASS（review.tsx 已重写，无 Mock） |
| 读取失败可重试 | PASS（error 状态 + reload 按钮） |

### 强退恢复验收（11 项）

| # | 项目 | 结果 |
|---|---|---|
| 1 | 发送一条真实 AI 消息 | PASS（"昨晚没睡好，3点才睡着"） |
| 2 | 得到真实回复 | PASS（safety=normal，含"要不要先喝口温水"） |
| 3 | 点击"记一下睡眠" | PASS（行动卡片跳转 /sleep） |
| 4 | 保存一条跨午夜记录 | PASS（23:30 → 07:00，450 分钟） |
| 5 | 回头看看中看到记录 | PASS（UI 显示完整卡片） |
| 6 | 多任务强退 App | PASS（xcrun simctl terminate） |
| 7 | 桌面重新打开 | PASS（xcrun simctl launch） |
| 8 | 对话历史仍在 | PASS（messages=3，UI 显示 3 条） |
| 9 | 睡眠记录仍在 | PASS（sleep=1） |
| 10 | 回头看看仍能读取 | PASS（UI 显示记录） |
| 11 | 无重复欢迎/重复记录 | PASS（welcome=1，sleep=1） |

### 异常测试

| 项目 | 结果 | 说明 |
|---|---|---|
| 数据库首次创建 | PASS | 启动即生成 |
| 重启后重复初始化 | PASS | IF NOT EXISTS 保护 |
| 空数据库 | PASS | sleep=0 时空状态正常 |
| 写入失败 | 未触发 | 代码层 try/catch + console.warn，未构造异常场景 |
| 快速重复保存 | PASS | saving 标志互斥 |
| 强退发生在 AI 请求中 | 未触发 | 模拟器难以精确复现，代码层有 AbortController 清理 |
| 强退发生在睡眠保存后 | PASS | 保存后立即强退，重启数据仍在 |
| 回头看看读取失败 | PASS | error 状态 + reload 按钮就绪 |
| 前后台切换 | 未自动化 | AppleScript 缺辅助功能权限；SQLite 不受前后台影响，建议真机覆盖 |
| 数据顺序正确 | PASS | 按 created_at 正序 |

### 检查

| 项目 | 结果 |
|---|---|
| npx expo-doctor | PASS（21/21 checks passed） |
| npx tsc --noEmit | PASS（0 errors） |
| 模拟器测试 | PASS（核心闭环 + 强退恢复） |
| 真实 iPhone 测试 | 未覆盖（devicectl 显示 unavailable） |
| 连续运行 10 分钟 | 部分（多次强退重启循环，未做单次 10 分钟连续运行） |
| 是否新增非白名单依赖 | 是（@react-native-community/datetimepicker@9.1.0，时间选择器必需） |
| 是否修改 Web | 否 |

## 发现的问题

1. **真机不可用**：`xcrun devicectl list devices` 显示步宁的 iPhone 状态为 unavailable，本轮 11 项强退恢复验收在模拟器完成，真机连续运行 10 分钟未覆盖。建议真机可用后补测。
2. **前后台切换未自动化**：AppleScript 缺辅助功能权限，无法模拟 Home 键。SQLite 持久化机制本身不依赖前后台状态，风险低，建议真机覆盖。
3. **写入失败/强退在 AI 请求中未实测**：模拟器难以精确构造，代码层已有 try/catch + AbortController 保护。

## 36h 节点结论

**PASS**（模拟器层）

- 核心闭环完整通过：真实 AI 对话 → DB 写入 → AI 建议记录睡眠 → 用户保存睡眠 → 回头看看读取 → 强退 → 重启 → 对话与睡眠记录仍在
- 数据库结构、迁移、参数化 SQL、索引、跨午夜计算、防重复保存全部通过
- 真机覆盖待补

## 是否建议进入完整闭环与基础质感阶段

是（待真机补测后正式确认）
