"use client";

import { cloneElement, useId, type ReactElement } from "react";

export interface TooltipProps {
  content: string;
  children: ReactElement<Record<string, unknown>>;
  demoState?: "default" | "hover";
}

export function Tooltip({ content, children, demoState = "default" }: TooltipProps) {
  const id = `ui-tooltip-${useId().replace(/:/g, "")}`;
  return (
    <span className="ui-tooltip-wrap" data-demo-state={demoState === "hover" ? "hover" : undefined}>
      {cloneElement(children, { "aria-describedby": id })}
      <span className="ui-tooltip-bubble" id={id} role="tooltip">
        {content}
      </span>
    </span>
  );
}
