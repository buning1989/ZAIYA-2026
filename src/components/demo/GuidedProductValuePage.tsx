/* —— 关系总结页｜小晨与身边的人 ——
 * Guided Demo 第二张总结页。独立阶段页，第三方视角描述小晨与家长、老师、医生之间
 * 支持关系的重新建立。
 *
 * 结构：
 *   A. 主标题
 *   B. 副标题
 *   C. 中心人物 + 三方连接（家长 / 老师 / 医生 围绕 小晨）
 *   D. 用户主导说明条（弱化）
 *   E. 页面收束
 *   F. 行动引导文案 + 操作按钮（重新观看案例 / 进入自由体验）
 *
 * 不包含：数据图表、产品机制、GPM/BPS 理论、第一页中的记录 / 整理 / 回看内容。
 * 视觉与第一张总结页保持一组：相同宽度、标题字号、卡片圆角、边框和背景。
 * 关系展示采用中心结构，不与第一页的三张横向卡片重复。
 *
 * 作为 Guided Demo 最后一页，左箭头由 UnifiedDemoStage 统一承载返回第一页；
 * 右箭头由 UnifiedDemoStage 统一隐藏，不允许继续循环到案例开头。
 */

type Props = {
  /** 重新观看案例：重置 Guided Demo 进度，返回第一节点 */
  onRestart: () => void;
  /** 进入自由体验：切换到自由体验模式 */
  onEnterFreeExperience: () => void;
};

type RoleCard = {
  role: string;
  body: string;
};

const roleCards: RoleCard[] = [
  {
    role: "家长",
    body: "从只看到结果，到逐渐理解过程，减少误解和冲突。",
  },
  {
    role: "医生",
    body: "不只依赖一次门诊，也能了解更连续的生活状态。",
  },
  {
    role: "老师",
    body: "更早看见她的困难，也更容易提供合适的节奏和支持。",
  },
];

export default function GuidedProductValuePage({
  onRestart,
  onEnterFreeExperience,
}: Props) {
  const [parent, doctor, teacher] = roleCards;

  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* —— A. 主标题 —— */}
      <h1 className="text-[26px] font-semibold leading-[1.5] text-ink">
        小晨和身边的人，开始重新建立连接。
      </h1>

      {/* —— B. 副标题 —— */}
      <p className="mt-6 text-[17px] leading-[1.8] text-ink-soft">
        当真实的日常被看见，家长、老师和医生不再各自判断，
        <br />
        而是围绕同一段生活提供支持。
      </p>

      {/* —— C. 中心人物 + 三方连接 —— */}
      <div className="relative mx-auto mt-10 w-full max-w-[680px]">
        {/* 连接线（在卡片下层，仅卡片间隙处可见，淡色虚线表达关系重新建立） */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* 医生（顶部） → 小晨（中心）：纵线穿过行间隙 */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="78"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
            className="text-line-soft"
          />
          {/* 家长（左） → 小晨：横线穿过列间隙 */}
          <line
            x1="15"
            y1="78"
            x2="50"
            y2="78"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
            className="text-line-soft"
          />
          {/* 小晨 → 老师（右）：横线穿过列间隙 */}
          <line
            x1="50"
            y1="78"
            x2="85"
            y2="78"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
            className="text-line-soft"
          />
        </svg>

        {/* 卡片网格：第一行只显示医生（居中）；第二行家长 / 小晨 / 老师 */}
        <div className="relative grid grid-cols-3 items-center gap-x-6 gap-y-10 sm:gap-x-10">
          <div />
          <RoleCardItem role={doctor.role} body={doctor.body} />
          <div />

          <RoleCardItem role={parent.role} body={parent.body} />
          <CenterCard name="小晨" />
          <RoleCardItem role={teacher.role} body={teacher.body} />
        </div>
      </div>

      {/* —— D. 用户主导说明条（弱化） —— */}
      <div className="mt-8 rounded-xl border border-line-soft bg-card-soft/40 px-5 py-4">
        <p className="text-[13px] leading-[1.7] text-ink-soft">
          信息先由小晨查看和确认，再决定是否分享。
        </p>
      </div>

      {/* —— E. 页面收束 —— */}
      <div className="mt-8 border-t border-line-soft pt-8">
        <p className="text-[17px] leading-[1.8] text-ink-soft">
          在呀连接的，不只是信息，
          <br />
          也是小晨重新回到家庭、学校和现实生活中的桥梁。
        </p>
      </div>

      {/* —— F. 行动引导 + 操作按钮 —— */}
      <p className="mt-8 text-center text-[15px] font-medium text-ink">
        接下来，亲自体验在呀。
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-line bg-white px-7 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:border-ink-faint hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4"
        >
          重新观看案例
        </button>
        <button
          type="button"
          onClick={onEnterFreeExperience}
          className="rounded-full bg-ink px-7 py-3 text-[15px] font-medium text-white transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4"
        >
          进入自由体验
        </button>
      </div>
    </div>
  );
}

/* —— 角色卡片：家长 / 老师 / 医生 使用统一样式 —— */
function RoleCardItem({ role, body }: { role: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line-soft bg-card-soft/60 px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-[15px] font-semibold leading-[1.4] text-ink sm:text-[16px]">
        {role}
      </p>
      <p className="mt-2 text-[13px] leading-[1.7] text-ink-soft sm:text-[14px]">
        {body}
      </p>
    </div>
  );
}

/* —— 中心人物卡片：小晨 —— */
function CenterCard({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-ink/15 bg-white px-5 py-6 text-center">
      <p className="text-[16px] font-semibold leading-[1.4] text-ink sm:text-[17px]">
        {name}
      </p>
    </div>
  );
}
