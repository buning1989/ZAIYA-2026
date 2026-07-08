/* —— 起床窗帘动画（在在）——
 * 统一封装 wake-up.gif 的展示，按 variant 区分三个使用场景：
 *   phone-app       首页主视觉
 *   desktop-widget  桌面小组件卡片
 *   watch           手表表盘
 *
 * GIF 画布 640×1138（9:16），主体（窗帘+在在）只占画布中部一部分，
 * 上下与左右都有透明边距。因此不能直接以画布尺寸为准，
 * 需要在外层容器内用 transform scale 放大主体到目标可见宽度。
 *
 * 三个 variant 独立设置容器尺寸 + scale，互不影响：
 *   - 容器尺寸控制占位（不撑大父级布局）
 *   - scale 控制主体可见尺寸（以可见主体边界为准）
 *   - object-contain + 居中，保持原始宽高比，不裁切不拉伸
 */
type ZaiyaWakeAnimationVariant = "phone-app" | "desktop-widget" | "watch";

const VARIANT_CONFIG: Record<
  ZaiyaWakeAnimationVariant,
  { container: string; scale: number }
> = {
  // 首页主视觉：主体宽度约 150–170px
  // 容器 176px × 314px（保持 9:16），scale 1.45 → 主体约 160px
  "phone-app": { container: "h-[176px] w-[314px]", scale: 1.45 },
  // 桌面小组件：主体宽度约 78–90px，不撑大白色卡片
  // 容器 84px × 150px，scale 1.4 → 主体约 84px
  "desktop-widget": { container: "h-[84px] w-[150px]", scale: 1.4 },
  // 手表表盘：主体宽度约 90–105px，表盘中央清晰可见
  // 容器 96px × 170px，scale 1.5 → 主体约 96px
  watch: { container: "h-[96px] w-[170px]", scale: 1.5 },
};

export default function ZaiyaWakeAnimation({
  variant,
  className = "",
}: {
  variant: ZaiyaWakeAnimationVariant;
  className?: string;
}) {
  const { container, scale } = VARIANT_CONFIG[variant];
  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${container} ${className}`}
    >
      <img
        src="/assets/zaiya/wake-up.gif"
        alt="在在起床"
        draggable={false}
        className="h-full w-full object-contain select-none"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}
