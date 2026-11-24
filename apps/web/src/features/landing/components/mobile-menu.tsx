"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { useLanding } from "./landing-provider";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { content, locale, setLocale } = useLanding();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="lp-mobile-drawer" role="presentation" onClick={onClose}>
      <div
        className="lp-mobile-panel"
        role="dialog"
        aria-modal="true"
        aria-label={content.a11y.mobileNavLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="lp-mobile-panel-head">
          <BrandMark />
          <button
            ref={closeButtonRef}
            type="button"
            className="lp-mobile-close"
            aria-label={content.a11y.closeMenuLabel}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <nav className="lp-mobile-nav" aria-label={content.a11y.mobileNavLabel}>
          {content.header.nav.map((item) => (
            <Link href={item.href} key={item.href} onClick={onClose}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="lp-mobile-cta">
          <a
            className="lp-phone-number"
            href={`tel:${content.header.phoneTel}`}
            aria-label={`${content.a11y.phoneLinkPrefix} ${content.header.phoneDisplay}`}
          >
            {content.header.phoneDisplay}
          </a>
          <span className="lp-phone-hours">{content.header.hours}</span>
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
          <Link className="lp-btn lp-btn-primary" href="/#contact" onClick={onClose}>
            {content.header.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
