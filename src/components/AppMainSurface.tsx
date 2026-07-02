import { useState } from "react";
import { Menu, MessageCircle, Users, Wind } from "lucide-react";
import ZaizaiRive, { ZAIZAI_WAVE_ANIMATIONS } from "./ZaizaiRive";

type Props = {
  /** 预览态：仅瞬时视觉反馈，不触发任何回调（首页 Hero 使用） */
  previewMode?: boolean;
  /** 可交互态：点击触发回调（沉浸式 Demo 使用）。previewMode 优先 */
  interactive?: boolean;
  /** AI对话主入口点击回调（右下角，最右下角的主入口） */
  onPrimaryAction?: () => void;
  /** 其他核心按钮点击回调：Wind=1（快速缓解压力）、Users=2（轻社交） */
  onButtonClick?: (id: number) => void;
};

/**
 * 手机 App 主界面内部内容（共享组件）。
 *
 * 主页信息架构：四角象限，非列表/工具栏。
 * - 在在居中，体量明显大于任何图标（视觉主体）
 * - 左上：菜单入口（汉堡菜单）
 * - 右上：快速记录（条件性显示，默认隐藏留空）
 * - 左下：轻社交
 * - 右下：快速缓解压力（Wind，上）+ AI对话（MessageCircle，最右下角，略大）
 * - 所有图标为裸符号：无背景容器、无边框、无文字标签
 * - 四角位置有高低差异，不读成一条工具栏
 *
 * 首页 Hero 预览与沉浸式 Demo 的 HomeScreen 复用同一组件，
 * 视觉结构完全一致；点击行为通过 props 区分。
 */
export default function AppMainSurface({
  previewMode = false,
  interactive = false,
  onPrimaryAction,
  onButtonClick,
}: Props) {
  const [active, setActive] = useState<number | null>(null);

  // 核心按钮：preview 仅瞬时反馈；interactive 触发回调
  const coreHandlers = (i: number) => {
    if (previewMode || !interactive) {
      return {
        onPointerDown: () => setActive(i),
        onPointerUp: () => setActive(null),
        onPointerLeave: () => setActive(null),
      };
    }
    return {
      onClick: () => {
        setActive(i);
        setTimeout(() => {
          if (i === 0) onPrimaryAction?.();
          else onButtonClick?.(i);
        }, 300);
      },
    };
  };

  return (
    <div className="relative h-full w-full bg-white">
      {/* 在在：视觉主体，居中，体量明显大于任何图标 */}
      <div className="absolute inset-0 grid place-items-center">
        <ZaizaiRive className="h-64 w-64" animations={ZAIZAI_WAVE_ANIMATIONS} />
      </div>

      {/* 左上：菜单入口（汉堡菜单）—— 工具型入口，仅瞬时反馈 */}
      <button
        aria-label="菜单"
        onPointerDown={() => setActive(10)}
        onPointerUp={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        className={`absolute left-6 top-7 p-1 transition-colors ${
          active === 10 ? "text-ink" : "text-ink-soft"
        }`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 右上：快速记录入口（条件性显示，默认隐藏，未开启时该角保持空白） */}

      {/* 左下：轻社交 */}
      <button
        aria-label="轻社交"
        {...coreHandlers(2)}
        className={`absolute bottom-7 left-6 p-1 transition-colors ${
          active === 2 ? "text-ink" : "text-ink-soft"
        }`}
      >
        <Users className="h-6 w-6" />
      </button>

      {/* 右下：Wind（上）+ AI对话（下，最右下角，略大） */}
      <div className="absolute bottom-7 right-6 flex flex-col items-end gap-3">
        <button
          aria-label="快速缓解压力"
          {...coreHandlers(1)}
          className={`p-1 transition-colors ${
            active === 1 ? "text-ink" : "text-ink-soft"
          }`}
        >
          <Wind className="h-6 w-6" />
        </button>

        <button
          aria-label="AI对话"
          {...coreHandlers(0)}
          className={`p-1 transition-colors ${
            active === 0 ? "text-ink" : "text-ink-soft"
          }`}
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
