"use client";

import Link from "next/link";
import { useLanding } from "./landing-provider";

export function StickyActionBar() {
  const { content } = useLanding();

  return (
    <div className="lp-sticky-bar">
      <a
        className="lp-btn lp-btn-light"
        href={`tel:${content.header.phoneTel}`}
        aria-label={`${content.a11y.phoneLinkPrefix} ${content.header.phoneDisplay}`}
      >
        {content.stickyBar.callLabel}
      </a>
      <Link className="lp-btn lp-btn-primary" href="/#contact">
        {content.stickyBar.consultLabel}
      </Link>
    </div>
  );
}
