import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

/**
 * 统一的在在动画入口。
 *
 * 当前仓库未暴露具体 .riv 文件名时，先约定放在 public/zaizai.riv。
 * 如果实际文件名不同，只需要改这里的常量，Hero、Demo、角色区会同步替换。
 */
export const ZAIZAI_RIVE_SRC = "/zaizai.riv";

type Props = {
  className?: string;
  fallbackClassName?: string;
};

export default function ZaizaiRive({
  className = "h-24 w-24",
  fallbackClassName = "h-full w-full",
}: Props) {
  const { RiveComponent } = useRive({
    src: ZAIZAI_RIVE_SRC,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <div className={`rounded-full bg-ink/15 ${fallbackClassName}`} />
      </div>
      <RiveComponent className="relative h-full w-full" />
    </div>
  );
}
