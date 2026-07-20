# 在呀 ZÀIYA｜环境预检

## 1. 基础环境

| 项目 | 当前结果 | PASS / WARNING / BLOCKED | 处理 |
|---|---|---|---|
| macOS | | | |
| Mac 芯片 | | | |
| Xcode | | | |
| Command Line Tools | | | |
| Node.js | | | |
| 包管理器 | | | |
| Git | | | |
| iOS Simulator | | | |
| 磁盘空间 | | | |
| ffmpeg | | | |

检查命令：

```bash
sw_vers
uname -m
xcodebuild -version
xcode-select -p
node -v
npm -v
git --version
df -h /
xcrun simctl list devices available
which ffmpeg || true
ffmpeg -version || true
```

不要自动升级系统、Xcode 或 Node.js。

## 2. 免费 Apple 开发条件

| 项目 | 结果 | 状态 |
|---|---|---|
| Xcode 已登录 Apple Account | | |
| Personal Team 存在 | | |
| iPhone 被 Xcode 识别 | | |
| iPhone 已信任 Mac | | |
| 开发者模式已开启 | | |
| Xcode 可选择目标设备 | | |

检查：

```bash
xcrun xctrace list devices
```

人工步骤：数据线连接、解锁、信任、Xcode Devices and Simulators、开启开发者模式、重启、再次连接。

## 3. 仓库保护

| 项目 | 结果 | 状态 |
|---|---|---|
| 当前分支 | | |
| 工作区干净 | | |
| main 与远端同步 | | |
| 稳定 commit | | |
| Vercel 稳定版本 | | |

```bash
git status
git branch --show-current
git remote -v
git log -1 --oneline
git fetch origin
git status -sb
```

不得自动执行 `reset --hard` 或 `clean -fd`。

## 4. 版本决策

| 项目 | 决策 |
|---|---|
| Expo SDK | |
| React Native | |
| Node.js | |
| 最低 iOS | |
| Xcode | |
| 包管理器 | |

## 5. App 配置

```text
显示名：在呀
英文名：ZÀIYA
目录：ios-app
分支：spike/ios-48h
平台：iOS only
方向：竖屏
Scheme：ZaiyaDev
Bundle ID：待确认
```

建议候选：

```text
com.buning1989.zaiya
```

## 6. AI 接口

| 项目 | 结果 | 状态 |
|---|---|---|
| HTTPS 可访问 | | |
| 密钥仅服务端 | | |
| 模型余额 | | |
| 10 次冒烟 | | |
| JSON 稳定 | | |
| 超时 | | |
| 固定降级 | | |
| 敏感日志控制 | | |

## 7. 视频

目标：本地 H.264 MP4、3～8 秒、无音频、可循环、背景已烘焙。不使用 WebM、透明视频、GIF 或 Rive。

## 8. 开工判定

```text
准备完成度：
可以开始：是 / 否
阻塞项数量：
```

人工阻塞项：

- [ ] iPhone 被 Xcode 识别
- [ ] 开发者模式
- [ ] Apple Account / Personal Team
- [ ] Bundle ID
- [ ] 模型 API Key 与余额
