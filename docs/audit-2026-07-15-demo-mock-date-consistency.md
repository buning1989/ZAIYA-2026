# 演示模式 Mock 数据日期一致性审计报告

> **审计日期**:2026-07-15
> **审计性质**:只读审计(未修改任何代码、未删除任何数据、未自动批量替换日期)
> **审计范围**:演示模式下所有与"小晨"相关的 Mock 数据日期、时间逻辑、事件顺序与状态变化
> **统一基准**:当前演示日期 `2026-07-15`,开始使用 `2026-05-16`(两个月),复诊日期 `2026-07-18`(复诊前 3 天),诊断"中度抑郁、重度焦虑",称呼"小晨"

---

## 1. 总体结论

**评级:存在明显时间线冲突(接近"需要统一重构日期数据源"边界)**

最严重的发现是**体验模式内部存在两套互不引用的日级数据源**,且二者描述同一人物同一周却互相矛盾。`lookbackRecords.ts`(新设计)与 `constants.ts + records.ts + timeline.ts + conversations.ts + praiseCards.ts + organize.ts`(旧设计)是两套独立时间线,目前正处于迁移未完成状态——这解释了几乎所有跨模块矛盾。

### 最主要的 5 个问题

1. **两套"今天"基准并存于体验模式内部**:`lookbackRecords.ts` 设定 7-15 为当前日且 7-15 有完整记录;`constants.ts` 设定 7-17 为参考日(`PERIOD_END`/`REFERENCE_DATE`)且 7-15 被列入 `XIAOCHEN_UNRECORDED_DATE_KEYS`。回头看看模块消费前者,其他 5 个模块消费后者。

2. **未来日期已有完整数据(数据穿越)**:`records.ts` 在 7-16/7-17 都有完整记录,`praiseCards.ts` 最后一张卡在 7-17,`conversations.ts` 默认初始对话线程是 7-17 21:30,`selectOrganizeSummary.ts` 的 session.createdAt = 7-17 21:30,`DemoOrganizeFlow.tsx` 的沟通确认单创建日 = 7-18(复诊当日)。这些都超出"7-15 当前日期"。

3. **固定剧情"两周后"叙事与任务"两个月使用时长"严重冲突**:`TwoWeekTransition`、`GuidedCaseResultPage`、`xiaochenDay2.ts`(CASE_DATE=2026-07-26)、`xiaochenTwoWeekSummary.ts`、`DemoOrganizeFlow.tsx` 等 9 处文案统一使用"两周后/两周前",与任务要求的"5-16 开始,7-15 当前,使用两个月"完全不符。固定剧情隐含的复诊日是 7-27,与 `APPOINTMENT_DATE=2026-07-18` 矛盾。

4. **重点节点数据与任务定位完全相反**:7-09 任务要求"明显低谷+漏服",数据却为"状态最佳日"(mood:3、服药 taken、三餐齐全);7-14 任务要求"情绪未记录但其他维度有数据",数据却为"六类完整记录";7-13 任务要求"早晚两次情绪记录",数据却只有单条 mood。

5. **同一人物在演示模式与体验模式下的人物档案不同**:`demoUser.ts` 出生 2010-09-12(15 岁、高一、北京、51.4kg);`experienceUser.ts` 出生 2009-09-12(16 岁、高二、二线城市、48.7kg)。`XiaochenCaseIntro.tsx` 显示"16 岁"与体验模式一致,与演示模式不一致。

---

## 2. 全局时间设定现状

| 项目 | 当前代码实际值 | 任务期望值 | 一致性 |
|---|---|---|---|
| 演示模式当前日(Demo) | `xiaochenDay1` `2026-07-12`,`xiaochenDay2` `2026-07-26`,`DEMO_REFERENCE_DATE` `2026-07-13` | `2026-07-15` | ❌ 不一致(三个值) |
| 体验模式"当前日"(`lookbackRecords.ts`) | `XIAOCHEN_LOOKBACK_CURRENT_DATE` `2026-07-15` | `2026-07-15` | ✓ 一致 |
| 体验模式"当前日"(`constants.ts`) | `REFERENCE_DATE` / `PERIOD_END` `2026-07-17` | `2026-07-15` | ❌ 偏差 +2 天 |
| 回头看看 Demo 流程参考日 | `DemoLookbackFlow.tsx` `2026-07-13T23:59:59+08:00` | `2026-07-15` | ❌ 偏差 -2 天 |
| 第二周(Day2)回头看看参考日 | `xiaochenTwoWeekSummary.ts` `2026-07-26T22:30:00+08:00` | 不应超出复诊日 7-18 | ❌ 跨过复诊日 |
| 开始使用日期(`lookbackRecords.ts`) | `XIAOCHEN_LOOKBACK_START` `2026-05-16` | `2026-05-16` | ✓ 一致 |
| 开始使用日期(`constants.ts`) | `PERIOD_START` `2026-06-15` | `2026-05-16` | ❌ 少 1 个月 |
| 复诊日期 | `APPOINTMENT_DATE` `2026-07-18` ✓ / 固定剧情隐含 `2026-07-27` | `2026-07-18` | ⚠️ 常量一致但固定剧情矛盾 |
| 最早 Mock 数据日期 | `lookbackRecords` `2026-05-16` / `constants` `2026-06-15` | `2026-05-16` | ⚠️ 双值 |
| 最晚 Mock 数据日期 | `constants` `2026-07-17`(有完整记录) / `lookbackRecords` `2026-07-15` | `2026-07-15` | ❌ 7-17 数据穿越 |
| 实际覆盖时长 | `lookbackRecords` 61 天 / `constants` 33 天 / Demo 固定剧情 2 周 | 约 2 个月 | ❌ 三种长度并存 |
| 是否使用真实系统时间 | 是,且分散于 9+ 文件(AppMainSurface/lookback.ts/praise.ts/PrivacyPage 等) | 应固定为 7-15 | ❌ |
| 是否存在多个日期基准 | 是,至少 5 个(`7-12`、`7-13`、`7-15`、`7-17`、`7-26`) | 应统一为 1 个 | ❌ |
| 是否存在统一 `DEMO_CURRENT_DATE` 常量 | **不存在**,仅有 `DEMO_REFERENCE_DATE`(7-13,仅用于年龄推导) | 应建立 | ❌ |

### 关键常量定义位置

- `src/data/userProfile.ts#L29`:`DEMO_REFERENCE_DATE = new Date("2026-07-13T00:00:00+08:00")`(仅用于年龄推导)
- `src/apps/experience/data/xiaochen/constants.ts#L10`:`PERIOD_START = "2026-06-15"`
- `src/apps/experience/data/xiaochen/constants.ts#L13`:`PERIOD_END = "2026-07-17"`
- `src/apps/experience/data/xiaochen/constants.ts#L16`:`REFERENCE_DATE = "2026-07-17"`
- `src/apps/experience/data/xiaochen/constants.ts#L19`:`APPOINTMENT_DATE = "2026-07-18"` ✓
- `src/apps/experience/data/xiaochen/lookbackRecords.ts#L12`:`XIAOCHEN_LOOKBACK_START = "2026-05-16"` ✓
- `src/apps/experience/data/xiaochen/lookbackRecords.ts#L13`:`XIAOCHEN_LOOKBACK_CURRENT_DATE = "2026-07-15"` ✓
- `src/apps/experience/data/xiaochen/lookbackRecords.ts#L14`:`XIAOCHEN_LOOKBACK_APPOINTMENT_DATE = "2026-07-18"` ✓
- `src/components/demo/DemoLookbackFlow.tsx#L47`:`fixedReferenceDate = new Date("2026-07-13T23:59:59+08:00")`
- `src/components/demo/scenarios/xiaochenDay1.ts#L20`:`CASE_DATE = "2026-07-12"`
- `src/components/demo/scenarios/xiaochenDay2.ts#L14`:`CASE_DATE = "2026-07-26"`

---

## 3. 问题清单

| 优先级 | 模块/文件 | 当前日期或逻辑 | 预期日期或逻辑 | 问题说明 | 建议处理方式 |
|---|---|---|---|---|---|
| **P0** | `constants.ts#L13,L16,L55` | `PERIOD_END`/`REFERENCE_DATE` = 7-17,7-17 在 `RECORDED_DATE_KEYS` 中且有完整数据 | 应 ≤ 7-15 | 体验模式数据周期延伸到未来 2 天,与"7-15 当前日"冲突 | 将 `PERIOD_END`/`REFERENCE_DATE` 改为 7-15,7-16/7-17 数据移除或降级为"未记录" |
| **P0** | `constants.ts#L67` vs `lookbackRecords.ts#L384-387` | 7-15 同时被标记为"未记录日"和"完整记录日" | 7-15 应为当前日且应有数据 | 体验模式内部两套数据源对同一日期定义矛盾 | 统一为单一数据源(`lookbackRecords.ts` 的设定正确) |
| **P0** | `constants.ts#L10` | `PERIOD_START` = 6-15 | 应为 5-16 | 数据周期少 1 个月,不支撑"两个月使用时长" | 改为 5-16,补齐 5-16~6-14 的 Mock 数据 |
| **P0** | `records.ts#L498-510`(7-09) | mood:3、服药 taken、三餐齐全 | 应为明显低谷且存在漏服 | 7-09 任务定位与数据完全相反 | 重写 7-09 数据为低谷日,加入 `MISSED_MED_DATES` |
| **P0** | `records.ts#L561-573`(7-14) | mood:3,六类完整 | 应情绪未记录但其他维度有数据 | 7-14 任务定位与数据完全相反 | 将 7-14 的 mood/moodWords/moodTrigger/moodNote/moodEntries 置为 null,保留其他维度 |
| **P0** | `records.ts#L548-558`(7-13) | 单个 mood 值,无 moodEntries | 应有早晚两次情绪记录 | 7-13 任务定位与数据不符 | 为 7-13 添加早晚两次 moodEntries,或扩展 `buildRecordedDay` |
| **P0** | `timeline.ts#L89,L94,L98,L106` | 4 处文案"漏服舍曲林" | 应为"喹硫平"(`constants.ts#L136` `MEDICATION_NAME`) | 药物名称跨模块矛盾 | 统一改为"喹硫平"或使用 `MEDICATION_NAME` 常量引用 |
| **P0** | `conversations.ts#L104-106` | 默认初始对话 = `CONVERSATION_THREAD_0717`(7-17 21:30) | 初始对话应在 7-15 或更早 | 体验模式进入第一眼看到的是 2 天后的未来对话 | 将初始对话改为 7-14 或 7-15 线程 |
| **P0** | `conversations.ts#L93-99` | `CONVERSATION_THREAD_0718` 在 7-18 15:00 | 不应存在(7-18 是未来复诊日,不应有对话数据) | 复诊当日对话穿越 | 删除该线程,或标注为"复诊后预演(不展示)" |
| **P0** | `xiaochenDay2.ts#L14,L72` | `CASE_DATE` = 7-26,L72 描述"为明天和王医生的复诊做准备" | 固定剧情复诊日应 = `APPOINTMENT_DATE`(7-18) | 固定剧情隐含复诊日 = 7-27,与常量 7-18 矛盾 9 天 | 重新设计固定剧情日期:首日应在 5-16,两周后应在 5-30,与"两个月使用时长"匹配;或彻底重写为"两个月后"叙事 |
| **P0** | `xiaochenTwoWeekSummary.ts#L76,L201-209` | `referenceDate` = 7-26,organize session 7-13~7-26,createdAt 7-26 22:40 | 应在 7-15 之前 | Day2 organize 数据穿越到未来 | 同上,重写为符合两个月设定的日期 |
| **P0** | `TwoWeekTransition.tsx#L18,L23` / `GuidedCaseResultPage.tsx#L47` / `xiaochenDay2.ts#L22-107` / `xiaochenTwoWeekSummary.ts#L223` / `DemoOrganizeFlow.tsx#L38` | 9 处"两周后/两周前"叙事 | 应为"两个月后/两个月前" | 固定剧情叙事与任务设定完全冲突 | 统一改为"两个月"叙事,或调整任务设定(若保留两周叙事,则需修改任务要求) |
| **P1** | `userProfile.ts#L29` | `DEMO_REFERENCE_DATE` = 2026-07-13 | 应 = 7-15 | 演示模式年龄推导参考日偏 2 天 | 改为 7-15;或建立 `DEMO_CURRENT_DATE` 统一引用 |
| **P1** | `DemoLookbackFlow.tsx#L47-49` | `fixedReferenceDate` = 7-13,`fixedWeekStartKey` = 6-30,`fixedMonthKey` = 7 | 应基于 7-15(周 7-13~7-19,月 2026-07) | Demo 回头看看参考日偏差 | 改为 7-15,重算周起始 |
| **P1** | `DemoOrganizeFlow.tsx#L33-35` | 记录日期 7-3~7-17,创建日 7-18 | 应为 5-16~7-15,创建日应在复诊前(7-15 或更早) | Demo 沟通确认单创建日 = 复诊日,违背"复诊前准备"定位;且记录天数 10/14 实际为 11/15(跨度 15 天) | 重新计算记录天数;改创建日为 7-15 或 7-17;且需与体验模式 `organize.ts` 周期对齐 |
| **P1** | `selectOrganizeSummary.ts#L98` | session createdAt = 7-17 21:30 | 应 ≤ 7-15 | 沟通确认单创建日为未来 | 改为 7-15 或更早 |
| **P1** | `organize.ts#L52-53`(体验) | 联系人 createdAt 6-15 08:00 / lastUsedAt 7-17 21:30 | lastUsedAt 应 ≤ 7-15 | lastUsedAt 穿越 | 改为 7-15 或更早 |
| **P1** | `praiseCards.ts#L35-40` | 第 6 张夸夸卡 createdAt = 7-17T20:30 | 应 ≤ 7-15 | 夸夸卡穿越 | 改日期为 7-14 或 7-15 |
| **P1** | `praiseCards.ts#L24` | 7-09 夸"今天上午虽然很困" | 7-09 不在 `XIAOCHEN_DROWSINESS_DATES` 中 | 夸夸卡描述与日级记录矛盾 | 调整 7-09 困倦记录,或将夸夸卡日期改为 7-10/7-11 |
| **P1** | `demoUser.ts#L13` vs `experienceUser.ts#L18` | 演示 birthDate 2010-09-12(15 岁、高一、北京、51.4kg)/ 体验 birthDate 2009-09-12(16 岁、高二、二线城市、48.7kg) | 同一人物应统一 | 演示与体验模式下人物档案不同 | 统一为 2009-09-12(16 岁、高二),`XiaochenCaseIntro.tsx#L46` 的"16 岁"已对应 |
| **P1** | `records.ts#L576-585`(7-17) | mood:3,有完整记录,note "明天复诊" | 不应有数据(7-17 > 7-15 当前日) | 未来日有完整记录 | 移除 7-17 数据,或降级为"未记录" |
| **P1** | `records.ts#L251-287`(`buildUnrecordedDay`) | 对所有非记录日统一为空记录 | 应区分"过去漏记"与"未来未发生" | 7-15(当前日)和 7-16(未来日)被与历史漏记同等对待 | 增加 `isFutureDay` 判断,未来日不应进入数据周期 |
| **P1** | `src/data/organize.ts#L304,L442,L451,L551,L402,L407,L418` | 旧 mock 仍使用"舍曲林";7-12 错记未到校;"落数学卷子"误分类为"药物滥用" | 应清理或对齐 | 旧 mock 残留,虽被 `selectOrganizeSummary.ts#L9-10` 禁止使用但代码仍在 | 删除或对齐 |
| **P1** | `conversations.ts#L18` / `organize.ts#L52-53` / `selectOrganizeSummary.ts#L98` | `new Date(数字参数)` 本地时区 | 应统一使用 `+08:00` ISO 字符串 | 跨时区环境时间戳会偏移 | 改为 ISO 字符串构造 |
| **P2** | `lookbackRecords.ts#L23` | `XIAOCHEN_LOOKBACK_MONTHS = ["2026-06","2026-07"]` | 应含 5 月(因 START = 5-16) | 月视图无法查看 5 月数据 | 加入 `"2026-05"` |
| **P2** | `Demo.tsx#L218` | "复诊前一晚" | 应明确指 7-17 还是其他 | 时间标签模糊 | 明确为"7 月 17 日晚"或调整 |
| **P2** | `DoneStep.tsx#L31-34` vs `organize.ts#L988-992` | 两套创建日格式化函数(中文/数字) | 应统一 | 同一沟通确认单在不同页面格式不一致 | 统一使用一种格式化函数 |
| **P2** | `AppMainSurface.tsx#L414,L417,L421` | 自由体验模式 `now = new Date()`,每 20s 刷新 | 体验模式应固定为 7-15 | 非演示日运行时,首页时间锚点会显示真实日期 | 体验模式下也注入固定 `now`(如 7-15 23:59) |
| **P2** | `AppMainSurface.tsx#L673,L681,L699` | 快捷入口判断和 7 天冷却期用 `Date.now()` | 应基于演示时间 | 演示模式下可能基于真实系统时间触发 | 演示模式下隔离这些逻辑 |
| **P2** | `AppMainSurface.tsx#L223` | `formatDialogTime` 默认 `reference = new Date()` | 应基于演示日期 | "今天/昨天"标签可能错乱 | 接收 `demoState.now` 或固定参考日 |
| **P2** | `records.ts#L392-401`(6-26) | mood:2(非最低档) | 任务定位"明显低谷"应为 mood:1 | 6-26 低谷程度不充分 | 调整 mood 为 1,或调整任务定位 |
| **P2** | `records.ts#L527-533`(7-11) | mood:2、漏服、困倦 | 任务定位"较好但不夸张" | 与"较好"定位不符 | 调整 7-11 数据或修改任务定位 |
| **P3** | `Footer.tsx#L98` | `new Date().getFullYear()` 版权年 | 静态文案 | 影响小 | 可保留 |
| **P3** | `GuidedScenarioPlayer.tsx` | 死代码,`DemoStage` 未使用 | — | 维护负担 | 删除或重构 |
| **P3** | `src/data/organize.ts#L187-188,L220-235` | 旧 mock 默认 session 日期 6-15~7-17 | 应对齐或删除 | 旧 mock 残留 | 清理 |
| **P3** | `lookback.ts#L486,L505,L532,L558-562` | 默认参数 `new Date()`,模块级 `lookbackData` 直接调用 | 应禁止体验模式使用 | 旧数据层残留,前序审计已禁止但代码仍在 | 清理 |

### 问题统计

- **P0 严重(12 项)**:未来数据穿越、数据源双轨、任务定位与数据相反、药物名矛盾、固定剧情"两周后"叙事冲突
- **P1 重要(9 项)**:参考日偏差、创建日为未来、人物档案不一致、时区构造不统一、旧 mock 残留
- **P2 改进(6 项)**:月视图缺 5 月、时间标签模糊、格式化函数不统一、自由体验模式真实系统时间、重点节点数据偏差
- **P3 规范(4 项)**:死代码、旧 mock 清理

---

## 4. 数据覆盖矩阵

| 模块 | 最早日期 | 最晚日期 | 当前默认日期 | 是否与 7-15 匹配 | 是否支持两个月历史 |
|---|---|---|---|---|---|
| **回头看看(体验)** `lookbackRecords.ts` | 2026-05-16 ✓ | 2026-07-15 ✓ | 2026-07-15 ✓ | ✓ | ✓(61 天) |
| **回头看看(Demo)** `demoLookbackData.ts` | 2026-06-30 | 2026-07-13 | 2026-07-13 23:59 | ❌(-2 天) | ❌(14 天) |
| **情绪记录** `records.ts`(constants) | 2026-06-15 | 2026-07-17 | 2026-07-17 | ❌(+2 天) | ❌(33 天) |
| **睡眠记录** `records.ts` | 2026-06-15 | 2026-07-17 | 2026-07-17 | ❌ | ❌ |
| **三餐记录** `records.ts` | 2026-06-15 | 2026-07-17 | 2026-07-17 | ❌ | ❌ |
| **服药记录** `records.ts` | 2026-06-15 | 2026-07-17 | 2026-07-17 | ❌ | ❌ |
| **活动记录** `records.ts` | 2026-06-16 | 2026-07-17 | 2026-07-17 | ❌ | ❌ |
| **体重** `WEIGHT_RECORDS` | 2026-06-16 | 2026-07-12 | 无默认 | — | ❌(2 点) |
| **呼吸练习** `BREATHING_EXERCISE_DATE` | 2026-07-04 | 2026-07-04 | 无默认 | — | ❌(1 点) |
| **消极念头** `NEGATIVE_THOUGHT_DATES` | 2026-06-24 | 2026-07-06 | 无默认 | — | ❌(2 点) |
| **时间线** `timeline.ts` | 2026-06-15 | 2026-07-18(复诊事件) | — | ⚠️(含 7-18 复诊) | ❌ |
| **AI 对话** `conversations.ts` | 2026-07-01 | 2026-07-18 | 2026-07-17 21:30(初始线程) | ❌(+2 天) | ❌(18 天) |
| **夸夸卡** `praiseCards.ts` | 2026-07-04 | 2026-07-17 | 2026-07-17 | ❌ | ❌(14 天) |
| **帮我整理(体验)** `organize.ts` | 2026-06-15 | 2026-07-17 | createdAt 7-17 21:30 | ❌ | ❌(33 天) |
| **帮我整理(Demo)** `DemoOrganizeFlow.tsx` | 2026-07-03 | 2026-07-17 | 创建日 7-18 | ❌(+3 天) | ❌(15 天) |
| **隐私(联系人)** `contacts.ts` | 2026-06-15 | 2026-06-15(无 updatedAt) | — | — | ❌(单点) |
| **隐私(高风险披露)** `organize.ts` | 2026-06-24 | 2026-07-06 | — | ✓ | ❌(2 点) |
| **能量获取** `useEnergy.ts` | 真实系统时间(`Date.now()`) | 真实系统时间 | — | ❌ | ❌(动态) |
| **首页时间锚点** `AppMainSurface.tsx` | 真实系统时间 | 真实系统时间(非演示模式) | 真实系统时间 | ❌(自由体验) | ❌ |
| **固定剧情 Day1** `xiaochenDay1.ts` | 2026-07-12 | 2026-07-12 | 2026-07-12 | ❌(-3 天) | ❌ |
| **固定剧情 Day2** `xiaochenDay2.ts` | 2026-07-26 | 2026-07-26 | 2026-07-26 | ❌(+11 天) | ❌ |

---

## 5. 建议修复顺序

本轮仅提出方案,不执行。建议按以下顺序处理,每一步都建立在前一步之上。

### 第 1 步:建立三个统一常量(基础地基)

在 `src/apps/experience/data/xiaochen/constants.ts`(或新建 `timeConfig.ts`)中建立:

```typescript
export const DEMO_CURRENT_DATE = "2026-07-15";
export const DEMO_START_DATE = "2026-05-16";
export const DEMO_FOLLOWUP_DATE = "2026-07-18";
export const DEMO_REFERENCE_DATE = new Date(`${DEMO_CURRENT_DATE}T00:00:00+08:00`);
```

将 `userProfile.ts#L29` 的 `DEMO_REFERENCE_DATE`(7-13)、`constants.ts#L16` 的 `REFERENCE_DATE`(7-17)、`DemoLookbackFlow.tsx#L47` 的 `fixedReferenceDate`(7-13)统一引用 `DEMO_CURRENT_DATE`,消除多基准。

### 第 2 步:决定数据源统一策略(关键决策)

当前体验模式存在两套日级数据源:

- **方案 A(推荐)**:以 `lookbackRecords.ts` 为唯一数据源,将 `constants.ts` 的 `PERIOD_START`/`PERIOD_END`/`REFERENCE_DATE` 改为引用 `lookbackRecords.ts`,并将 `records.ts`/`timeline.ts`/`organize.ts`/`conversations.ts`/`praiseCards.ts` 改为消费 `lookbackRecords.ts` 的日级数据。删除 `constants.ts` 中独立的 `XIAOCHEN_RECORDED_DATE_KEYS`/`XIAOCHEN_UNRECORDED_DATE_KEYS`(由 `lookbackRecords.ts` 派生)。
- **方案 B**:以 `constants.ts`+`records.ts` 为唯一数据源,将 `PERIOD_START` 改为 5-16、`PERIOD_END`/`REFERENCE_DATE` 改为 7-15,补齐 5-16~6-14 的 Mock 数据,然后让 `lookbackRecords.ts` 改为消费 `records.ts`。

建议选方案 A,因为 `lookbackRecords.ts` 已经符合任务要求,且数据更精细(如 7-15 有 mood:4 完整记录)。

### 第 3 步:清理未来日期数据(P0 消除穿越)

按选定的数据源统一后:

- 删除或重写 `records.ts` 中 7-16、7-17 的完整数据(改为空记录或移除)
- 删除 `conversations.ts#L93-99` 的 `CONVERSATION_THREAD_0718`(7-18 复诊当日对话)
- 将 `conversations.ts#L104-106` 默认初始对话从 7-17 改为 7-14 或 7-15
- 删除 `praiseCards.ts#L35-40` 的 7-17 卡片,或改日期为 7-14/7-15
- 修改 `selectOrganizeSummary.ts#L98` 的 session.createdAt 从 7-17 改为 7-15
- 修改 `organize.ts#L53` 的 lastUsedAt 从 7-17 改为 7-15
- 修改 `DemoOrganizeFlow.tsx#L35` 的 CREATED_DATE 从 7-18 改为 7-15
- 扩展 `buildUnrecordedDay`(records.ts)增加 `isFutureDay` 判断,未来日不进入数据周期

### 第 4 步:重写重点节点数据(P0 修正剧情冲突)

按任务定位重写以下日期的 `records.ts` 数据:

- **5-16**:新增"开始使用"首日记录(若方案 A,在 lookbackRecords 中已有则跳过)
- **6-26**:调整为 mood:1(明显低谷)
- **7-09**:重写为 mood:1、服药 missed、三餐不齐、活动 level 0、零点后入睡,加入 `MISSED_MED_DATES`
- **7-11**:调整为 mood:3(较好),移出 `MISSED_MED_DATES`,移除困倦
- **7-13**:添加早晚两次 moodEntries(扩展 `buildRecordedDay`)
- **7-14**:将 mood/moodWords/moodTrigger/moodNote/moodEntries 置为 null,保留睡眠/三餐/服药/活动
- **7-15**:确保是当前日且数据完整(若用方案 A,lookbackRecords 已有)

### 第 5 步:修正药物名称矛盾(P0)

将 `timeline.ts#L89,L94,L98,L106` 的"舍曲林"统一改为"喹硫平",或直接引用 `MEDICATION_NAME` 常量。

清理 `src/data/organize.ts#L304,L442,L451,L551` 的旧 mock(虽被禁止使用但代码仍在)。

### 第 6 步:重写固定剧情时间线(P0)

由于固定剧情"两周后"叙事与"两个月使用时长"严重冲突,需做出决策:

- **方案 A(推荐)**:将固定剧情改为"两个月后"叙事,`xiaochenDay1` 的 `CASE_DATE` 改为 5-16(开始使用首日),`xiaochenDay2` 的 `CASE_DATE` 改为 7-15(当前日,复诊前 3 天)。修改所有"两周"文案为"两个月"。`xiaochenTwoWeekSummary` 改为 `xiaochenTwoMonthSummary`。
- **方案 B**:保留"两周后"叙事,但需明确这是"使用首两周"的历史节点,且需在 UI 上明确区分"历史剧情"与"当前体验状态"。修改 `CASE_DATE` 让首日 + 两周后都落在 5-16~7-15 区间内。

无论哪种方案,都需修正 `xiaochenDay2.ts#L72` 的复诊日矛盾(隐含 7-27 vs 常量 7-18)。

### 第 7 步:统一人物档案(P1)

将 `demoUser.ts#L13` 的 birthDate 从 2010-09-12 改为 2009-09-12(与 `experienceUser.ts` 和 `XiaochenCaseIntro.tsx` 的"16 岁"一致),并统一 city、weightKg、grade。

### 第 8 步:隔离真实系统时间(P1/P2)

- 将 `AppMainSurface.tsx#L414,L417,L421` 在自由体验模式下也注入固定 `now`(7-15 23:59)
- 将 `AppMainSurface.tsx#L673,L681,L699` 的快捷入口判断在演示/体验模式下隔离
- 将 `lookback.ts#L486,L505,L532` 的默认参数改为接收 `DEMO_CURRENT_DATE`
- 将 `praise.ts#L104,L142` 的默认 `new Date()` 改为接收演示日期
- 将 `PrivacyPage.tsx#L831,L1205` 的 `new Date().toISOString()` 改为接收演示日期
- 将 `conversations.ts#L18`、`organize.ts#L52-53`、`selectOrganizeSummary.ts#L98` 的 `new Date(数字参数)` 改为 ISO `+08:00` 字符串构造

### 第 9 步:清理旧 mock 和死代码(P3)

- 删除或对齐 `src/data/organize.ts` 中的旧 mock 数据(L187-235,L304-551)
- 删除 `GuidedScenarioPlayer.tsx`(未被使用)
- 清理 `lookback.ts` 的模块级 `lookbackData`(已被 `selectLookbackData.ts` 取代)
- 在 `XIAOCHEN_LOOKBACK_MONTHS` 中加入 `"2026-05"`(lookbackRecords.ts#L23)

---

## 6. 涉及文件路径清单

便于下一轮逐项修复,所有路径已分类。

### 体验模式核心数据(必须修改)

- `src/apps/experience/data/xiaochen/constants.ts`
- `src/apps/experience/data/xiaochen/records.ts`
- `src/apps/experience/data/xiaochen/timeline.ts`
- `src/apps/experience/data/xiaochen/conversations.ts`
- `src/apps/experience/data/xiaochen/praiseCards.ts`
- `src/apps/experience/data/xiaochen/organize.ts`
- `src/apps/experience/data/xiaochen/lookbackRecords.ts`(参考基准,基本正确)
- `src/apps/experience/data/xiaochen/profile.ts`
- `src/apps/experience/data/xiaochen/contacts.ts`

### 体验模式选择器(可能需修改)

- `src/apps/experience/selectors/selectLookbackData.ts`(参考日已正确)
- `src/apps/experience/selectors/selectOrganizeSummary.ts`
- `src/apps/experience/selectors/selectConversationThreads.ts`
- `src/apps/experience/selectors/selectPraiseCards.ts`

### 演示组件(必须修改)

- `src/components/demo/DemoOrganizeFlow.tsx`
- `src/components/demo/DemoLookbackFlow.tsx`
- `src/components/demo/demoLookbackData.ts`
- `src/components/demo/TwoWeekTransition.tsx`
- `src/components/demo/GuidedCaseResultPage.tsx`
- `src/components/demo/XiaochenCaseIntro.tsx`

### 固定剧情脚本(必须修改)

- `src/components/demo/scenarios/xiaochenDay1.ts`
- `src/components/demo/scenarios/xiaochenDay2.ts`
- `src/components/demo/scenarios/xiaochenTwoWeekSummary.ts`

### 用户档案(必须修改)

- `src/data/userProfile.ts`
- `src/apps/demo/data/demoUser.ts`
- `src/apps/experience/data/experienceUser.ts`

### 共享数据层(清理)

- `src/data/organize.ts`(旧 mock,清理)
- `src/data/lookback.ts`(旧数据层,清理)
- `src/data/praise.ts`(默认参数修改)
- `src/data/privacy.ts`(时间戳处理修改)

### 共享组件(隔离真实系统时间)

- `src/components/AppMainSurface.tsx`
- `src/components/PrivacyPage.tsx`
- `src/components/PraisePage.tsx`
- `src/components/RecordFlow.tsx`
- `src/components/BreathingFlow.tsx`

---

## 7. 审计总结

本轮审计为**只读**操作,未修改任何代码、未删除任何数据。共扫描 30+ 文件,识别 **P0 严重问题 12 项**、**P1 重要问题 9 项**、**P2 改进问题 6 项**、**P3 规范问题 4 项**。

**最关键的认知**:体验模式内部存在 `lookbackRecords.ts`(新设计,5-16~7-15,符合任务要求)与 `constants.ts + records.ts + 其他模块`(旧设计,6-15~7-17,与任务要求冲突)两套并行的日级数据源。这意味着团队已经在迁移过程中,但尚未完成。下一轮修复应优先决定保留哪一套作为唯一数据源,然后系统性消除另一套。

**是否需要重构**:接近"需要统一重构日期数据源"边界。若仅修复 P0,可获得"日期逻辑基本一致"的演示;若要彻底消除所有矛盾,需执行上述 9 步重构方案。

待下一轮明确修复方案后再执行。
