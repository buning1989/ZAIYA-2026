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
        {/* 表壳：扁平统一描边，无阴影、无伪元素、无双层边框 */}
        <div className="absolute inset-0 rounded-[42px] border-[5px] border-[#243020] bg-white">
          {/* 单表冠 */}
          <div className="absolute -right-[7px] top-[38%] h-9 w-[5px] rounded-r-full bg-[#243020]" />

          {/* 表盘屏幕：纵向 flex-start 紧凑布局，不平均分布 */}
          <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[36px] bg-white px-6 pt-[28px]">
            {/* 顶部大时间（适中尺寸，不压制角色） */}
            <div className="w-full text-center">
              <p className="font-watch text-[72px] font-medium leading-[0.95] tracking-[-0.045em] tabular-nums text-[#243020]">
                {time}
              </p>
            </div>

            {/* 中部在在吃饭形象（放大实际可见主体） */}
            <div className="mt-2 flex h-[94px] w-[106px] items-center justify-center overflow-visible">
              <video
                src="./assets/zaiya/zaizai-eating.webm"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="block h-full w-full select-none object-contain"
                style={{
                  transform: "scale(1.95) translateY(0%)",
                  transformOrigin: "center center",
                }}
              />
            </div>

            {/* 文案区域（标题 + 辅助文案） */}
            <div className="mt-auto w-full pb-[20px] text-center">
              <p className="text-[15px] font-semibold leading-[21px] text-[#34402F]">
                到饭点啦
              </p>
              <p className="mt-px text-[13px] font-normal leading-[19px] text-[#737A70]">
                今天吃点什么呀?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
