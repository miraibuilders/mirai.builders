"use client";

import Link from "next/link";
import type { LegalSlug } from "../types";
import { useLanding } from "./landing-provider";

export function LegalPageView({ slug }: { slug: LegalSlug }) {
  const { content } = useLanding();
  const doc = content.legal[slug];

  return (
    <main id="main-content" className="lp-legal-main">
      <div className="lp-container">
        <header className="lp-legal-head">
          <p className="lp-eyebrow">{doc.eyebrow}</p>
          <h1 className="lp-h1">{doc.title}</h1>
          <p className="lp-lead">{doc.lead}</p>
          <p className="lp-legal-meta">
            <span>{doc.updatedLabel}</span>
            <span>{doc.updatedValue}</span>
          </p>
        </header>
        <div className="lp-legal-doc">
          {slug === "tokushoho" && doc.rows ? (
            <table className="lp-legal-rows">
              <tbody>
                {doc.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {doc.sections.map((section) => (
            <section className="lp-legal-section" key={section.number}>
              <div className="lp-legal-section-head">
                <span className="lp-legal-section-num">{section.number}</span>
                <h2>{section.heading}</h2>
              </div>
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.number}-${index}`}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet, index) => (
                    <li key={`${section.number}-bullet-${index}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        <aside className="lp-legal-cta" aria-labelledby="legal-cta-title">
          <h2 id="legal-cta-title">{doc.ctaTitle}</h2>
          <p>{doc.ctaBody}</p>
          <Link className="lp-btn lp-btn-light" href="/#contact">
            {content.header.ctaLabel}
          </Link>
        </aside>
      </div>
    </main>
  );
}
