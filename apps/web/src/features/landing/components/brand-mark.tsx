"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanding } from "./landing-provider";

export function BrandMark({ inverted = false }: { inverted?: boolean }) {
  const { content } = useLanding();

  return (
    <Link
      href="/"
      className="lp-logo"
      aria-label={content.brand.logoAlt}
      data-inverted={inverted ? "true" : undefined}
    >
      <Image
        className="lp-logo-image"
        src="/brand/mirai-lab-mark.png"
        alt=""
        width={40}
        height={40}
        unoptimized
      />
      <span className="lp-logo-text">
        <span className="lp-logo-wordmark">MIRAI Lab</span>
        <span className="lp-logo-sub">WEB &amp; SYSTEMS</span>
      </span>
    </Link>
  );
}
