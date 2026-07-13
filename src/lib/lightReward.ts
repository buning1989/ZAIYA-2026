export type LightRewardKind = "sunlight" | "moonlight" | "starlight";

const lightRewardTitles: Record<LightRewardKind, string> = {
  sunlight: "收下一点日光",
  moonlight: "收下一点月光",
  starlight: "收下一点星光",
};

export function getLightRewardKind(input: number | Date): LightRewardKind {
  const date = typeof input === "number" ? new Date(input) : input;
  const hour = date.getHours();

  if (hour >= 6 && hour < 18) return "sunlight";
  if (hour >= 18) return "moonlight";
  return "starlight";
}

export function getLightRewardTitle(kind: LightRewardKind): string {
  return lightRewardTitles[kind];
}
