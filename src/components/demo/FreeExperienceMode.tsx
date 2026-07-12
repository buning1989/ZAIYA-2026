import AppMainSurface from "@/components/AppMainSurface";

type Props = {
  onExitToSelect: () => void;
};

/**
 * 自由体验模式：直接展示现有 Demo 首页与全部功能。
 *
 * 复用 AppMainSurface（与现有 Demo 的 HomeScreen 同源），
 * 不改变任何业务模块逻辑。手机壳外右上角保留一个低干扰的
 * 「切换体验模式」入口，点击返回模式选择页。
 */
export default function FreeExperienceMode({ onExitToSelect }: Props) {
  return (
    <div className="relative grid min-h-full place-items-center p-4">
      {/* 低干扰入口：手机壳外部，右上角 */}
      <button
        onClick={onExitToSelect}
        className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
      >
        切换体验模式
      </button>

      {/* 手机壳：与现有 Demo 视觉一致 */}
      <div className="aspect-[9/18] w-[min(390px,calc(100vw-32px),calc(50vh-16px))]">
        <div className="h-full w-full rounded-[40px] border-[7px] border-ink bg-ink p-[2px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
          <div className="no-scrollbar relative h-full w-full overflow-hidden rounded-[33px] bg-white">
            <AppMainSurface interactive variant="immersive" />
          </div>
        </div>
      </div>
    </div>
  );
}
