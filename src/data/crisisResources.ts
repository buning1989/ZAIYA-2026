/* —— 安全承接页资源配置 ——
 * 热线号码与紧急联系人均为可配置项，便于后续按地区调整。
 * 当前为中国大陆场景：全国统一心理援助热线 12356，青少年服务热线 12355。
 * Demo 阶段紧急联系人为 mock 数据，不接真实通讯录。 */

export type CrisisHotline = {
  id: string;
  name: string;
  phone: string;
  note: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
};

/* —— 心理援助热线 ——
 * 12356：全国统一心理援助热线（2025 年启用，覆盖全国）
 * 12355：青少年服务热线（共青团中央主办，适合青少年相关求助） */
export const crisisHotlines: CrisisHotline[] = [
  {
    id: "national_mental_health",
    name: "全国统一心理援助热线",
    phone: "12356",
    note: "适合情绪危机、心理支持求助",
  },
  {
    id: "youth_service",
    name: "青少年服务热线",
    phone: "12355",
    note: "适合青少年相关求助",
  },
];

/* —— Mock 紧急联系人 ——
 * Demo 阶段使用 mock 数据，不接真实通讯录。
 * 后续可替换为用户实际配置的紧急联系人。 */
export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: "mother",
    name: "妈妈",
    relation: "家人",
    phone: "138-0000-0000",
  },
  {
    id: "father",
    name: "爸爸",
    relation: "家人",
    phone: "139-0000-0000",
  },
  {
    id: "teacher",
    name: "班主任",
    relation: "学校支持者",
    phone: "136-0000-0000",
  },
];

/* —— ZAIYA 对话 starter 文案 ——
 * 从安全承接页进入 ZAIYA 对话时预填的起始文案，
 * 帮助用户把这一刻说出来，降低开口门槛。 */
export const SAFETY_DIALOG_STARTER = "我现在有点不安全，想先有人陪我说一会儿。";
