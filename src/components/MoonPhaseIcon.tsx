import { useId } from "react";

export type MoonPhaseLevel = 1 | 2 | 3 | 4 | 5;

type MoonPhaseIconProps = {
  level: MoonPhaseLevel;
  color?: string;
  size?: number;
  className?: string;
};

const DEFAULT_MOON_COLOR = "#A7B765";

const shadowCircleX: Partial<Record<MoonPhaseLevel, number>> = {
  2: 6.5,
  3: 4.2,
  4: 1.8,
};

export function MoonPhaseIcon({
  level,
  color = DEFAULT_MOON_COLOR,
  size = 18,
  className,
}: MoonPhaseIconProps) {
  const id = useId();
  const clipId = `moon-phase-clip-${id.replace(/:/g, "")}`;
  const maskId = `moon-phase-mask-${id.replace(/:/g, "")}`;
  const radius = 7.1;
  const usesShadowMask = level === 2 || level === 3 || level === 4;

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="9" cy="9" r={radius} />
        </clipPath>
        {usesShadowMask && (
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect width="18" height="18" fill="black" />
            <circle cx="9" cy="9" r={radius} fill="white" />
            <circle cx={shadowCircleX[level]} cy="9" r={radius} fill="black" />
          </mask>
        )}
      </defs>

      {level === 1 ? null : (
        <g clipPath={`url(#${clipId})`}>
          <circle
            cx="9"
            cy="9"
            r={radius}
            fill={color}
            opacity="0.95"
            mask={usesShadowMask ? `url(#${maskId})` : undefined}
          />
        </g>
      )}

      <circle
        cx="9"
        cy="9"
        r={radius}
        stroke={color}
        strokeWidth="1.2"
        opacity={level === 1 ? 0.9 : 0.95}
      />
    </svg>
  );
}
