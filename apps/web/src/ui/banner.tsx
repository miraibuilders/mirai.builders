import type { ReactNode } from "react";
import { Button } from "./button";
import { Icon, type IconName } from "./icons";

export type BannerTone = "info" | "success" | "warning" | "danger";

const toneIcons: Record<BannerTone, IconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  danger: "alert-circle",
};

export interface InlineBannerProps {
  tone?: BannerTone;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
}

export function InlineBanner({ tone = "info", title, children, onDismiss }: InlineBannerProps) {
  return (
    <div className="ui-banner" data-tone={tone} role={tone === "danger" ? "alert" : "status"}>
      <div className="ui-banner-main">
        <span className="ui-banner-icon" aria-hidden="true">
          <Icon name={toneIcons[tone]} />
        </span>
        <div className="ui-banner-copy">
          {title ? <p className="ui-banner-title">{title}</p> : null}
          <div className="ui-banner-body">{children}</div>
        </div>
      </div>
      {onDismiss ? (
        <Button variant="ghost" size="sm" iconOnly icon="close" aria-label="Dismiss message" onClick={onDismiss} />
      ) : null}
    </div>
  );
}
