/* —— 起床窗帘动画（在在）——
 * 统一封装 wake-up.gif 的展示，按 variant 区分三个使用场景：
 *   phone-app       首页主视觉
 *   desktop-widget  桌面小组件卡片
 *   watch           手表表盘
 *   dialog          对话顶部陪伴区
 *
 * wake-up.gif 画布 640×1138（9:16 竖向），主体（窗帘+在在）只占画布中部一部分。
 * 透明帧 union bbox 约为 x=102..561, y=309..767，布局时按主体视觉中心校正，
 * 不直接用整张 9:16 画布中心作为对齐基准。
 * 采用 slot + media 两层结构：
 *   - slotClass：外层占位，控制组件在页面中的视觉占位，不撑大父级布局
 *   - mediaClass：内层 GIF 本体按 9:16 竖向展示，保证完整显示窗帘/在在主体
 *   - scale：微调可见主体大小
 *   - y：微调垂直位置
 * 外层 overflow-visible，不裁切竖向动画；各 variant 独立调参互不影响。
 */
type ZaiyaWakeAnimationVariant =
  | "phone-app"
  | "desktop-widget"
  | "watch"
  | "dialog";

const WAKE_UP_SRC = "./assets/zaiya/wake-up.gif";
const IDLE_LEAN_BACK_SRC = "./assets/zaiya/zaizai-idle-lean-back-slow.gif";

const VARIANT_CONFIG: Record<
  ZaiyaWakeAnimationVariant,
  {
    src: string;
    slotClass: string;
    mediaClass: string;
    scale: number;
    y?: number;
  }
> = {
  "phone-app": {
    src: WAKE_UP_SRC,
    // 首页视觉占位：略放大，配合 AppMainSurface 的光学居中位置
    slotClass: "h-[190px] w-[190px]",
    // GIF 本体按 9:16 竖向显示
    mediaClass: "h-[338px] w-[190px]",
    scale: 1.12,
    y: 10,
  },
  dialog: {
    src: WAKE_UP_SRC,
    // 对话页顶部：slot 收紧到可见主体附近，避免透明画布参与过渡定位
    slotClass: "h-[174px] w-[190px]",
    mediaClass: "h-[338px] w-[190px]",
    scale: 1.18,
    y: -16,
  },
  "desktop-widget": {
    src: IDLE_LEAN_BACK_SRC,
    // 小组件内使用 1:1 发呆动图，压低尺寸避免挤占文字（+30%）
    slotClass: "h-[107px] w-[107px]",
    mediaClass: "h-[107px] w-[107px]",
    scale: 1.08,
    y: 0,
  },
  watch: {
    src: IDLE_LEAN_BACK_SRC,
    // 手表表盘中使用 1:1 发呆动图，与细长数字保持留白（+50%）
    slotClass: "h-[210px] w-[210px]",
    mediaClass: "h-[210px] w-[210px]",
    scale: 1.08,
    y: 0,
  },
};

export default function ZaiyaWakeAnimation({
  variant,
  className = "",
}: {
  variant: ZaiyaWakeAnimationVariant;
  className?: string;
}) {
  const { src, slotClass, mediaClass, scale, y = 0 } = VARIANT_CONFIG[variant];

  return (
    <div
      className={`pointer-events-none relative grid place-items-center overflow-visible ${slotClass} ${className}`}
    >
      <img
        src={src}
        alt="在在起床"
        draggable={false}
        className={`block max-w-none select-none object-contain ${mediaClass}`}
        style={{
          transform: `translateY(${y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
