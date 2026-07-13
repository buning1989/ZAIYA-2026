/* —— 手表 Demo 框架 ——
 * 第一天 12:00 拒绝吃饭的手表场景。
 *
 * 设计要点：
 * - 真实手表比例（圆角矩形表盘 + 表壳 + 表冠）
 * - 与手机 Demo 属于同一套设计语言（深色边框 + 圆角屏幕）
 * - 表盘内：在在吃饭动画 + 饭点邀请 + 轻量"不想吃"反馈
 * - 不进入聊天、记录或打卡流程
 * - 自动演示小晨选择"不想吃"，选择后进入安静的接受拒绝状态
 * - 不新增剧情文档之外的产品回应文字
 *
 * 文案严格使用剧情文件原文：
 *   到饭点啦，今天吃点什么呀?
 *   不想吃
 */

import { useEffect, useState } from "react";

type Props = {
  /** 系统时间显示 */
  time?: string;
};

/* —— 手表表盘状态 ——
 * inviting: 展示饭点邀请 + "不想吃" 按钮
 * accepted: "不想吃"已选中，在在继续吃饭，邀请文案收起
 */
type WatchStage = "inviting" | "accepted";

export default function DemoWatchFrame({ time = "12:00" }: Props) {
  const [stage, setStage] = useState<WatchStage>("inviting");

  // 自动演示小晨选择"不想吃"：进入页面后短暂展示邀请，然后自动进入接受拒绝状态
  useEffect(() => {
    setStage("inviting");
    const timer = setTimeout(() => setStage("accepted"), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white">
      {/* —— 手表外壳 —— */}
      <div className="relative aspect-square w-[min(248px,calc(100vw-96px),calc(50vh-48px))] shrink-0">
        {/* 表壳 */}
        <div className="absolute inset-0 rounded-[34%] border-[6px] border-ink bg-ink shadow-[0_8px_32px_-12px_rgba(0,0,0,0.22)]">
          {/* 表冠 */}
          <div className="absolute -right-[8px] top-[38%] h-6 w-2 rounded-r-sm bg-ink" />
          <div className="absolute -right-[8px] top-[58%] h-4 w-2 rounded-r-sm bg-ink" />
          {/* 侧边按钮 */}
          <div className="absolute -left-[8px] top-[42%] h-5 w-2 rounded-l-sm bg-ink" />

          {/* 表盘屏幕 */}
          <div className="no-scrollbar relative h-full w-full overflow-hidden rounded-[28%] bg-[#FBFCF5]">
            {/* 状态栏 */}
            <div className="flex items-center justify-between px-4 pt-2 text-ink">
              <span className="text-[10px] font-semibold tracking-tight">
                {time}
              </span>
              <div className="flex items-center gap-1">
                {/* 电池小图标 */}
                <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
                  <rect
                    x="0.5"
                    y="0.5"
                    width="11"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeOpacity="0.4"
                  />
                  <rect
                    x="1.5"
                    y="1.5"
                    width="9"
                    height="4"
                    rx="0.75"
                    fill="currentColor"
                  />
                  <rect
                    x="12"
                    y="2.5"
                    width="1"
                    height="2"
                    rx="0.5"
                    fill="currentColor"
                    fillOpacity="0.4"
                  />
                </svg>
              </div>
            </div>

            {/* —— 表盘内容 —— */}
            <div className="flex h-[calc(100%-22px)] flex-col items-center justify-between px-3 pb-3 pt-1">
              {/* 在在吃饭动画 */}
              <div className="relative flex h-[55%] w-full items-center justify-center">
                <video
                  src="/assets/zaiya/zaizai-eating.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="block h-full w-auto max-w-none select-none object-contain"
                  style={{
                    transform: "scale(1.05)",
                    transformOrigin: "center center",
                  }}
                />
              </div>

              {/* 邀请文案 / 接受拒绝状态 */}
              <div className="flex w-full flex-1 flex-col items-center justify-center">
                {stage === "inviting" ? (
                  <>
                    <p className="text-center text-[12px] font-medium leading-[1.4] text-ink">
                      到饭点啦，
                      <br />
                      今天吃点什么呀?
                    </p>
                    <span className="mt-2.5 rounded-full border border-line-soft bg-white px-3.5 py-1 text-[11px] text-ink-soft">
                      不想吃
                    </span>
                  </>
                ) : (
                  /* 接受拒绝状态：只显示"不想吃"已选中，不新增回应文字 */
                  <span className="rounded-full border border-ink-faint bg-white px-3.5 py-1 text-[11px] text-ink">
                    不想吃
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
