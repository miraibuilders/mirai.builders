"use client";

import type { ReactNode } from "react";
import { useLanding } from "./landing-provider";

export function SubpageFrame({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  const { content } = useLanding();

  return (
    <main id="main-content" className="lp-legal-main">
      <div className="lp-container">
        <header className="lp-legal-head">
          <p className="lp-eyebrow">{eyebrow ?? content.brand.legalName}</p>
          <h1 className="lp-h1">{title}</h1>
          {lead ? <p className="lp-lead">{lead}</p> : null}
        </header>
        <div className="lp-grid-2">{children}</div>
      </div>
    </main>
  );
}
