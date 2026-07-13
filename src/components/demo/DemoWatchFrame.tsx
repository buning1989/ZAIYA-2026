/* —— 手表 Demo 框架 ——
 * 第一天 12:00 拒绝吃饭的手表场景。
 *
 * 设计要点：
 * - 对齐首页手表 Demo：接近正方形、薄边框、大圆角、单表冠
 * - 顶部大时间为主视觉，动画与文案上下排列
 * - 中部在在吃饭形象居中放大
 * - 底部一句轻提醒文案
 * - 不展示用户回复、按钮或任何交互过程
 * - 只传递"在呀在饭点轻轻出现"
 *
 * 文案严格使用剧情文件原文：
 *   到饭点啦，
 *   今天吃点什么呀?
 */

type Props = {
  /** 系统时间显示 */
  time?: string;
};

export default function DemoWatchFrame({ time = "12:00" }: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white">
      {/* —— 手表外壳 —— */}
      <div className="relative aspect-square w-[min(300px,calc(100vw-96px),calc(52vh-24px))] shrink-0">
        {/* 表壳 */}
        <div className="absolute inset-0 rounded-[42px] border-[6px] border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.22)]">
          {/* 单表冠 */}
          <div className="absolute -right-[7px] top-[38%] h-9 w-[5px] rounded-r-full bg-ink/85 shadow-sm" />

          {/* 表盘屏幕 */}
          <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[36px] bg-white">
            {/* 顶部大时间（主视觉） */}
            <div className="mt-7 w-full text-center">
              <p className="font-watch text-[72px] font-medium leading-none tracking-normal text-ink">
                {time}
              </p>
            </div>

            {/* 中部在在吃饭形象（居中放大） */}
            <div className="relative -mt-1 flex h-[40%] w-full items-center justify-center">
              <video
                src="./assets/zaiya/zaizai-eating.webm"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="block h-full w-auto max-w-none select-none object-contain"
                style={{
                  transform: "scale(1.42)",
                  transformOrigin: "center center",
                }}
              />
            </div>

            {/* 底部短文案（轻提醒） */}
            <div className="mt-auto mb-6 w-full px-5 text-center">
              <p className="text-[14px] font-medium leading-[1.45] text-ink-soft">
                到饭点啦，
                <br />
                今天吃点什么呀?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
