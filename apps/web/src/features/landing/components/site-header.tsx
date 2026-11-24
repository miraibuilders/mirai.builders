"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountLink } from "@/app/(marketing)/_components/account-link";
import { BrandMark } from "./brand-mark";
import { useLanding } from "./landing-provider";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  const { content, locale, setLocale } = useLanding();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <a className="lp-skip-link" href="#main-content">
        {content.a11y.skipLink}
      </a>
      <div className="lp-brand-bar" aria-hidden="true" />
      <header className="lp-header">
        <div className="lp-container lp-header-inner">
          <BrandMark />
          <nav className="lp-nav" aria-label={content.a11y.mainNavLabel}>
            {content.header.nav.map((item) => (
              <Link className="lp-nav-link" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="lp-header-actions">
            <a
              className="lp-phone"
              href={`tel:${content.header.phoneTel}`}
              aria-label={`${content.a11y.phoneLinkPrefix} ${content.header.phoneDisplay}`}
            >
              <span className="lp-phone-number">{content.header.phoneDisplay}</span>
              <span className="lp-phone-hours">{content.header.hours}</span>
            </a>
            <div className="lp-lang-switch" role="group" aria-label={content.header.languageLabel}>
              <button
                type="button"
                className="lp-lang-btn"
                aria-pressed={locale === "ja"}
                onClick={() => setLocale("ja")}
              >
                {content.header.jaLabel}
              </button>
              <button
                type="button"
                className="lp-lang-btn"
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
              >
                {content.header.enLabel}
              </button>
            </div>
            <AccountLink />
            <Link className="lp-btn lp-btn-primary" href="/#contact">
              {content.header.ctaLabel}
            </Link>
            <button
              type="button"
              className="lp-menu-toggle"
              aria-label={menuOpen ? content.a11y.closeMenuLabel : content.a11y.openMenuLabel}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lp-scroll-progress" aria-hidden="true" />
    </>
  );
}
