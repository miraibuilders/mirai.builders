import type { ReactNode } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import type { BreadcrumbItem } from "@/lib/navigation";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  tabs?: ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumbs, tabs }: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="ui-page-header-main">
        <div>
          <h1>{title}</h1>
          {description ? <p className="ui-page-header-desc">{description}</p> : null}
        </div>
        {actions ? <div className="ui-page-header-actions">{actions}</div> : null}
      </div>
      {tabs ? <div className="ui-page-header-tabs">{tabs}</div> : null}
    </header>
  );
}

export function SectionHeader({ title, description, actions }: Omit<PageHeaderProps, "breadcrumbs" | "tabs">) {
  return (
    <div className="ui-section-header">
      <div>
        <h2>{title}</h2>
        {description ? <p className="ui-page-header-desc">{description}</p> : null}
      </div>
      {actions ? <div className="ui-page-header-actions">{actions}</div> : null}
    </div>
  );
}
