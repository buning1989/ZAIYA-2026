# 在呀 ZÀIYA iOS 原生 POC 技术状态

## 1. 当前定位

该工程为在呀 ZÀIYA 的 React Native iOS 原生技术验证版本（POC）。

当前目标是验证：

- iOS 原生工程可控；
- 真实 AI 可接入；
- 对话与生活记录可本地持久化；
- 强退重启后数据可恢复。

当前不是正式发布版本，不代表最终 UI 和完整产品范围。

## 2. 工程结构

- Web 主工程：`/Users/ning/Documents/在呀 ZÀIYA/webdemo开发`（main 分支，中文路径）
- iOS Worktree：`/Users/ning/zaiya-ios48h`（spike/ios-48h 分支，纯英文路径）
- 当前分支：`spike/ios-48h`
- Expo SDK：~56.0.16
- React Native：0.85.3
- React：19.2.3
- TypeScript：~6.0.3
- 路由：expo-router ~56.2.15
- 视频：expo-video ~56.1.4
- 数据库：expo-sqlite ~56.0.5
- 时间选择器：@react-native-community/datetimepicker 9.1.0
- 服务端：Vercel Serverless Function（`api/chat.js`，主仓库 main 分支）
- Node 推荐版本：v24（Vercel CLI 在 Node 26 下曾 fetch failed；当前开发机为 v26.3.0，构建/运行正常但 Vercel 部署需切到 v24）
- Xcode：26.5 (Build 17F42)

## 3. 已完成

按实际代码与测试记录：

- iOS 原生构建（prebuild + CocoaPods + xcodebuild）
- Personal Team 真机安装（开发证书，bundleIdentifier: com.buning1989.zaiya.validation）
- 首页与基础路由（expo-router Stack：index / chat / sleep / review）
- 视频播放（expo-video，loop + muted + auto play，AppState 前台恢复）
- 原生对话交互（FlatList + 键盘适配 + 行动卡片）
- 真实 AI 接入（chatApi.ts → Vercel Preview `api/chat.js`）
- normal / boundary / high 三级安全分级
- AI 建议进入睡眠记录（suggestedAction.type=sleep_record 行动卡片）
- 请求重试机制（network/timeout 类型自动重试一次，MAX_ATTEMPTS=2）
- SQLite 数据层（src/db/：database / migrations / chatRepository / sleepRepository / types）
- 数据库版本化迁移（PRAGMA user_version=1，IF NOT EXISTS 可重复执行）
- 对话消息持久化（用户消息、AI 回复、错误占位、重试删除）
- 睡眠记录持久化（跨午夜计算、防重复保存、同一时间禁止保存）
- 回头看看读取真实记录（getLatestSleepRecord，空状态保留）
- 模拟器强退恢复（11 项验收通过）

## 4. 已验证环境

- 模拟器：iPhone 17 Pro（iOS 26.5），完整闭环 + 强退恢复 11 项 PASS
- 真实 iPhone：步宁的 iPhone（iPhone 16，iOS 26.5.2），28h 阶段 AI 真机验收 PASS；36h 阶段 devicectl 显示 unavailable，SQLite 闭环未在真机覆盖
- 服务端 Preview：Vercel Preview URL，normal/boundary/high 三级响应 PASS，密钥泄露检查 PASS
- expo-doctor：21/21 checks passed
- TypeScript：0 errors（`npx tsc --noEmit`）

## 5. 尚未完成或尚未确认

- SQLite 完整闭环尚未完成真实 iPhone 最终验证（模拟器已 PASS，真机待补）
- 真机前后台切换测试
- 真机连续运行 10 分钟稳定性测试
- 正式 UI 设计（当前为最小可验证 UI，非最终产品形态）
- 登录系统
- 云同步
- TestFlight 配置
- 正式发布配置（签名、证书、App Store Connect）
- 线上接口鉴权与限流
- 正式隐私、安全与合规方案
- 多会话管理（当前仅 default 会话）
- 睡眠记录备注 UI（数据层已支持 note 字段，UI 未实现输入）
- 回头看看列表/统计/趋势（当前仅展示最近一条）

## 6. 已知工程限制

- 中文路径不适合当前 React Native / CocoaPods 构建，iOS 工程必须在纯英文路径运行（已通过 git worktree 隔离到 `/Users/ning/zaiya-ios48h`）
- Vercel CLI 在 Node 26 下曾出现 fetch failed，部署服务端时需切换到 Node 24
- 当前模型接口为验证环境（Preview URL + 环境变量），非生产级
- 当前 SQLite 数据仅保存在本机 App 沙盒，卸载 App 后本地数据会丢失
- Apple Personal Team 证书 7 天过期，真机安装需定期续签
- `xcrun devicectl` 在某些系统状态下显示真机 unavailable，需重新连接数据线或重启 daemon
- 模拟器 UI 自动化受限（AppleScript 缺辅助功能权限），强退恢复等场景需手动操作或 DB 直查
- `ios/` 目录由 `expo prebuild` 生成，已加入 .gitignore，不应手动修改后提交

## 7. 后续恢复开发方式

- iOS 工作目录：`/Users/ning/zaiya-ios48h`
- 当前分支：`spike/ios-48h`
- Node 推荐版本：v24（`nvm use 24`），运行 expo 可用 v26，部署 Vercel 必须用 v24
- 安装依赖：`cd /Users/ning/zaiya-ios48h/ios-app && npm install`
- Metro 启动命令：`cd /Users/ning/zaiya-ios48h/ios-app && unset CI && npx expo start --clear`
- 模拟器运行命令：`cd /Users/ning/zaiya-ios48h/ios-app/ios && xcodebuild -workspace app.xcworkspace -scheme app -configuration Debug -destination 'platform=iOS Simulator,id=<SIM_ID>' -derivedDataPath build` 然后 `xcrun simctl install <SIM_ID> build/Build/Products/Debug-iphonesimulator/app.app && xcrun simctl launch <SIM_ID> com.buning1989.zaiya.validation`
- 真机运行命令：`cd /Users/ning/zaiya-ios48h/ios-app && npx expo run:ios --device <DEVICE_UDID>`（需真机可用）
- TypeScript 检查：`cd /Users/ning/zaiya-ios48h/ios-app && npx tsc --noEmit`
- expo-doctor：`cd /Users/ning/zaiya-ios48h/ios-app && npx expo-doctor`
- 数据库版本：PRAGMA user_version = 1
- 数据库表：chat_sessions / chat_messages / sleep_records
- 数据库文件位置（模拟器）：`~/Library/Developer/CoreSimulator/Devices/<SIM_ID>/data/Containers/Data/Application/<APP_ID>/Documents/SQLite/zaiya.db`
- 禁止在中文路径构建（必须使用 `/Users/ning/zaiya-ios48h` worktree）

## 8. 当前建议

当前 POC 进入工程冻结状态。

恢复开发前，应先完成：

1. 真实 iPhone SQLite 闭环补测（11 项强退恢复 + 连续运行 10 分钟）
2. 服务端 Preview 安全收口（鉴权、限流、密钥轮换）
3. 产品范围重新确认（POC 范围 ≠ 产品范围）
4. 再决定是否进入 UI 收敛和长期产品开发
