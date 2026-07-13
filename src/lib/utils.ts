import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* —— 全局图标线宽规范 ——
 * 仅两档：
 *   regular (1.8) —— 导航、返回/关闭、更多、普通功能入口、输入框附属图标、未选中选项、信息提示
 *   emphasis (2.4) —— 勾选标记、完成态、选中核心标识、加号等小尺寸主行动符号
 * 不适用于：数据图表线宽、呼吸圆环、SVG 插画、角色素材、动画路径、Logo、装饰线条、Canvas、趋势图折线 */
export const ICON_STROKE_WIDTH = {
  regular: 1.8,
  emphasis: 2.4,
} as const

