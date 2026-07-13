import { useEffect, useState } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

/**
 * 统一的在在动画入口。
 *
 * 当前仓库统一使用 public/lil_guy.riv 作为在在角色动画。
 * 如果实际文件名不同，只需要改这里的常量，Hero、Demo、角色区会同步替换。
 */
export const ZAIZAI_RIVE_SRC = "./lil_guy.riv";
// 保留导出供历史调用方使用；默认不再强制动画名，避免 riv 内无对应名时加载异常
export const ZAIZAI_IDLE_ANIMATIONS = ["idle", "blink"];
export const ZAIZAI_WAVE_ANIMATIONS = ["idle", "blink"];

type Props = {
  /** 容器尺寸类名，需给出明确宽高（如 h-56 w-56），否则 Rive canvas 会塌陷为 0 */
  className?: string;
  /** 起始动画名。不传时由 Rive 播放默认动画，避免强依赖不存在的名称 */
  animations?: string | string[];
};

export default function ZaizaiRive({
  className = "h-24 w-24",
  animations,
}: Props) {
  const { rive, RiveComponent } = useRive({
    src: ZAIZAI_RIVE_SRC,
    // 不传 animations 时让 Rive 用默认动画，避免 idle/blink 不存在导致空白
    ...(animations ? { animations } : {}),
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  // fallback：rive 在 1.2s 内未就绪则显示橙色圆形占位，避免空白
  // 仅用于兜底（加载失败 / 404 / 名称不匹配），不替代正常 Rive
  const [showFallback, setShowFallback] = useState(false);
  useEffect(() => {
    if (rive) {
      setShowFallback(false);
      return;
    }
    const t = setTimeout(() => setShowFallback(true), 1200);
    return () => clearTimeout(t);
  }, [rive]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {showFallback && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-full w-full rounded-full bg-accent" />
        </div>
      )}
      {/* scale(1.25) 放大实际可见主体，抵消 Rive 文件的透明边距 */}
      <RiveComponent
        className="relative h-full w-full"
        style={{ transform: "scale(1.25)", transformOrigin: "center center" }}
      />
    </div>
  );
}
