"use client";

import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { useLanding } from "./landing-provider";

export function SiteFooter() {
  const { content } = useLanding();

  return (
    <footer className="lp-footer">
      <div className="lp-footer-grid-bg" aria-hidden="true" />
      <div className="lp-container lp-footer-inner">
        <div className="lp-footer-cta">
          <div>
            <p className="lp-eyebrow">{content.footer.eyebrow}</p>
            <h2>{content.footer.title}</h2>
            <p>{content.footer.body}</p>
          </div>
          <Link className="lp-btn lp-btn-primary" href="/#contact">
            {content.footer.ctaLabel}
          </Link>
        </div>
        <nav className="lp-footer-columns" aria-label={content.a11y.footerNavLabel}>
          {content.footer.columns.map((column) => (
            <div className="lp-footer-col" key={column.title}>
              <h3>{column.title}</h3>
              <div className="lp-footer-links">
                {column.items.map((item) => (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="lp-footer-bottom">
          <BrandMark inverted />
          <p>{content.footer.tagline}</p>
          <span>{content.footer.copyright}</span>
          <Link href="/#top">{content.footer.backToTopLabel}</Link>
        </div>
      </div>
    </footer>
  );
}
