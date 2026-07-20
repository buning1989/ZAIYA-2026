# 在呀 ZÀIYA｜已知问题记录

## 记录要求

每个问题必须包含编号、时间、阶段、设备、复现步骤、实际结果、预期结果、频率、影响、处理、修复 commit 和复测。

## ISSUE-001

```text
标题：expo run:ios 完成安装后通过 exp+zaiya:// scheme 拉起 app 时 simctl openurl 报 LSApplicationWorkspaceErrorDomain error 115，app 进程未能由 CLI 自动进入业务页面
发现时间：2026-07-20 19:42（6 小时节点验收期间）
阶段：0～6 小时｜iOS 模拟器首次启动
设备：iPhone 17 Pro 模拟器（iOS 26.5）
iOS：26.5
App 构建：Debug-iphonesimulator，Development Client，bundle id com.buning1989.zaiya.validation
```

复现步骤：

1. 在 worktree `/Users/ning/zaiya-ios48h/ios-app` 执行 `npx expo run:ios`
2. CLI 完成 pod install + xcodebuild，将 `app.app` 安装到模拟器
3. CLI 进入 `Opening exp+zaiya://expo-development-client/?url=http%3A%2F%2F192.168.1.5%3A8081 on iPhone 17 Pro`
4. 日志输出：`[appleaccountd] App install observer error: appleaccountd.AppInstallObserverError.placeHolder`
5. 最终抛出：`Error: xcrun simctl openurl <UDID> exp+zaiya://expo-development-client/?url=... exited with non-zero code: 115`
6. CLI 进程退出码 1，但 app.app 已成功安装到模拟器

实际结果：

```text
xcrun simctl openurl 失败，CLI 抛出 LSApplicationWorkspaceErrorDomain error 115。
appleaccountd 同时输出 AppInstallObserverError.placeHolder。
app.app 已成功写入模拟器，但 dev-client URL scheme 未被系统识别为可处理 URL。
```

预期结果：

```text
expo run:ios 在 build + install 完成后通过 URL scheme 拉起 app，并自动连接 Metro。
CLI 退出码 0，模拟器中 app 进入首页（含在在角色 MP4 与两个按钮）。
```

频率：

```text
仅一次（首次安装后必现；后续启动可规避）
```

等级：

```text
P1 影响关键体验或稳定性
```

是否影响红黄绿：否  
状态：已降级  
修复 commit：无（通过操作顺序规避，无需改代码）  
复测：通过

## 处理与降级方式

实际修复方式（基于真实执行命令验证，非推测）：

1. 不重启模拟器，保留 `app.app` 的已安装状态。
2. 用 `xcrun simctl launch <UDID> com.buning1989.zaiya.validation` 直接拉起 app 进程（返回 PID，成功）。
3. 单独启动 Metro：`npx expo start --dev-client --port 8081`。
4. 用 `xcrun simctl openurl <UDID> "exp+zaiya://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"` 注入 Metro URL。
5. Metro 日志显示 `iOS Bundled 874ms node_modules/expo-router/entry.js (1240 modules)`，JS bundle 成功注入 app。
6. 通过 deep link `zaiyadev://chat` / `zaiyadev://sleep` / `zaiyadev://review` / `zaiyadev://` 验证四页均可打开（截图差异 132KB → 210KB 证明 UI 已切换）。

根因判断（仅基于可观察日志）：

- `appleaccountd` 是模拟器侧账号守护进程，`AppInstallObserverError.placeHolder` 表明 app 安装观察者仍处于 placeholder 状态，URL scheme 注册晚于 `simctl openurl` 调用。
- 不是签名、bundle id、Info.plist 或 Podfile 问题：app 安装成功，独立 launch 也成功，deep link 也可被路由。
- 不是 Metro 或 JS bundle 问题：Metro 日志显示 bundle 成功，1240 modules 全部解析。
- 仅是 expo CLI 首次安装后的"自动拉起 + URL scheme 注入"这一步与模拟器的 URL 注册时机冲突。

对真机阶段的影响：

- 真机阶段使用 Xcode Development Build 或 `npx expo run:ios --device`，安装后由 iOS 系统直接 launch app 进程，不依赖 `simctl openurl`。
- 即便真机也出现首次 URL scheme 注入失败，可手动点击 app 图标冷启动，再让 Metro 通过 LAN / Tunnel 主动连接。
- 此问题对 6～10 小时真机阶段不构成阻断。

## 汇总

| 编号 | 标题 | 等级 | 频率 | 核心闭环 | 状态 | 结论 |
|---|---|---|---|---|---|---|
| ISSUE-001 | simctl openurl error 115 首次拉起 dev-client 失败 | P1 | 仅一次 | 否 | 已降级 | 通过 simctl launch + 独立 Metro + 手动 openurl 规避 |

未解决 P0：

```text
无
```

已采用降级：

```text
ISSUE-001：操作顺序规避（先 simctl launch，再启动 Metro，再 openurl 注入）
```

赛后问题：

```text
无
```
