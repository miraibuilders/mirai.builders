import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import type { Tone } from "./tokens";

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  icon?: IconName;
  className?: string;
}

export function Badge({ children, tone = "neutral", icon, className }: BadgeProps) {
  return (
    <span className={["ui-badge", className].filter(Boolean).join(" ")} data-tone={tone}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}
