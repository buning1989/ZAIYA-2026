import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

/**
 * 统一的在在动画入口。
 *
 * 当前仓库统一使用 public/lil_guy.riv 作为在在角色动画。
 * 如果实际文件名不同，只需要改这里的常量，Hero、Demo、角色区会同步替换。
 */
export const ZAIZAI_RIVE_SRC = "/lil_guy.riv";
export const ZAIZAI_IDLE_ANIMATIONS = ["idle", "blink"];
export const ZAIZAI_WAVE_ANIMATIONS = ["idle", "blink"];

type Props = {
  className?: string;
  animations?: string | string[];
};

export default function ZaizaiRive({
  className = "h-24 w-24",
  animations = ZAIZAI_IDLE_ANIMATIONS,
}: Props) {
  const { RiveComponent } = useRive({
    src: ZAIZAI_RIVE_SRC,
    animations,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  return (
    <div className={className}>
      <RiveComponent className="h-full w-full" />
    </div>
  );
}
