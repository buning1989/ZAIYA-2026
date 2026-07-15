import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ZaizaiSpeechBubbleProps = {
  children: ReactNode;
  className?: string;
  textClassName?: string;
  tail?: "left" | "none";
  size?: "compact" | "regular";
};

const bubbleSizeClass = {
  compact: "rounded-lg px-3 py-2",
  regular: "rounded-lg px-3.5 py-2.5",
} as const;

const textSizeClass = {
  compact: "text-[12px]",
  regular: "text-[13px]",
} as const;

export default function ZaizaiSpeechBubble({
  children,
  className,
  textClassName,
  tail = "left",
  size = "compact",
}: ZaizaiSpeechBubbleProps) {
  return (
    <div
      className={cn(
        "relative bg-surface-soft text-left",
        bubbleSizeClass[size],
        className,
      )}
    >
      <p
        className={cn(
          "leading-relaxed text-ink-soft",
          textSizeClass[size],
          textClassName,
        )}
      >
        {children}
      </p>
      {tail === "left" && (
        <div className="absolute -left-1.5 top-3">
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            className="text-surface-soft"
            aria-hidden="true"
          >
            <path d="M0 6L8 0v12L0 6z" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  );
}
