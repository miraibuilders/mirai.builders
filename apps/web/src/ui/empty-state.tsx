import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: IconName;
  action?: ReactNode;
  secondary?: ReactNode;
}

export function EmptyState({ title, description, icon = "inbox", action, secondary }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <span className="ui-empty-state-icon">
        <Icon name={icon} size={20} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action || secondary ? (
        <div className="ui-empty-state-actions">
          {action}
          {secondary}
        </div>
      ) : null}
    </div>
  );
}
