import { useEffect, useState } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

/**
 * 通用 Rive 角色组件，用于「共同在场」场景中展示多个不同用户角色。
 *
 * 与 ZaizaiRive（专属在在入口）不同，本组件不绑定具体 riv 文件，
 * 通过 src 传入 public 下的相对路径加载任意角色动画。
 *
 * - 使用最基础配置：src + autoplay + layout，不传 animations / stateMachines
 * - 不硬编码动画名（不统一传 ["idle","blink"]），避免名称不匹配导致空白
 * - rive 就绪后通过 onRiveReady 读取 animationNames 运行时自动播放（按文件实际内容）
 * - 加载失败 / 超时（1.2s 未就绪）显示低调圆形 fallback 并 console.warn 当前 src
 */
type Props = {
  /** public 下的相对路径，例如 /presence-characters/assistant_character.riv */
  src: string;
  /** 容器尺寸类名，需给出明确宽高（如 h-20 w-20），否则 Rive canvas 会塌陷为 0 */
  className?: string;
  /** fallback 圆形的外层类名，可选（默认低调灰） */
  fallbackClassName?: string;
};

export default function PresenceCharacterRive({
  src,
  className,
  fallbackClassName,
}: Props) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    // rive 就绪后自动检测并播放可用动画（运行时读取，不硬编码名称）。
    // 不同 .riv 文件动画名不同，统一硬编码 idle/blink 会导致部分文件空白。
    onRiveReady: (riveInstance) => {
      const anims = riveInstance.animationNames;
      if (anims && anims.length > 0) {
        // 播放该文件实际拥有的动画，确保不是静态首帧
        riveInstance.play(anims);
      }
    },
  });

  // fallback：1.2s 内未就绪则显示低调圆形占位，避免空白；同时 warn 当前 src 便于排查
  const [showFallback, setShowFallback] = useState(false);
  useEffect(() => {
    if (rive) {
      setShowFallback(false);
      return;
    }
    const t = setTimeout(() => setShowFallback(true), 1200);
    return () => clearTimeout(t);
  }, [rive]);

  useEffect(() => {
    if (showFallback) {
      // eslint-disable-next-line no-console
      console.warn(`[PresenceCharacterRive] Rive 未就绪，显示占位。src=${src}`);
    }
  }, [showFallback, src]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {showFallback && (
        <div
          className={`absolute inset-0 grid place-items-center ${fallbackClassName ?? ""}`}
        >
          <div className="h-3/4 w-3/4 rounded-full bg-line-soft" />
        </div>
      )}
      <RiveComponent className="relative h-full w-full" />
    </div>
  );
}
