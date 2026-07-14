/* —— 小晨体验模式统一数据源：隐私状态 ——
 *
 * 从 contacts.ts 拆分隐私状态部分，便于 Selector 与页面按需引用。
 * 实际数据定义仍在 contacts.ts 中维护，本文件只做 re-export。 */
export type { ExperiencePrivacyState } from "./contacts";
export { XIAOCHEN_PRIVACY_STATE } from "./contacts";
