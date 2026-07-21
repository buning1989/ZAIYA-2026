// 本地固定回复轮换池。不调用任何 API。
export const LOCAL_REPLIES: readonly string[] = [
  '我在。你可以慢一点说，不需要一下子把所有事情讲清楚。',
  '嗯，我听到了。这些事能讲出来本身就不容易。',
  '我先不急着给建议。你想多说说现在的感觉吗？',
];

export function pickReply(index: number): string {
  return LOCAL_REPLIES[index % LOCAL_REPLIES.length];
}
