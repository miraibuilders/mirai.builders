"use client";

import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "./contact-form";
import { EditorialSections } from "./editorial-sections";
import { useLanding } from "./landing-provider";

export function LandingSections() {
  const { content } = useLanding();
  const {
    a11y,
    header,
    hero,
    problems,
    reasons,
    services,
    pricing,
    flow,
    commitments,
    caseStudies,
    faq,
    company,
    contact,
  } = content;

  return (
    <main id="main-content" className="lp-lang-stage">
      <section id="top" className="lp-hero">
        <div className="lp-hero-grid-bg" aria-hidden="true" />
        <div className="lp-hero-image-frame" aria-hidden="true">
          <Image
            src="/brand/hero_tokyo_architecture_1795524957427.jpg"
            alt=""
            width={1600}
            height={1067}
            priority
            unoptimized
          />
        </div>
        <div className="lp-container lp-hero-layout">
          <div>
            <p className="lp-eyebrow">{hero.eyebrow}</p>
            <h1 className="lp-h1" aria-label={`${hero.headline}${hero.headlineAccent}`}>
              {hero.headline}
              <span className="lp-h1-accent">{hero.headlineAccent}</span>
            </h1>
            <p className="lp-lead">{hero.subheadline}</p>
            <div className="lp-chip-row">
              {hero.trustChips.map((chip) => (
                <span className="lp-chip" key={chip}>
                  {chip}
                </span>
              ))}
            </div>
            <div className="lp-hero-actions">
              <Link className="lp-btn lp-btn-primary" href="/#contact">
                {hero.primaryCta}
              </Link>
              <Link className="lp-btn lp-btn-outline" href="/#pricing">
                {hero.secondaryCta}
              </Link>
            </div>
            <p className="lp-hero-phone">
              <span>{hero.phoneLabel}</span>
              <a
                href={`tel:${header.phoneTel}`}
                aria-label={`${a11y.phoneLinkPrefix} ${header.phoneDisplay}`}
              >
                <strong>{header.phoneDisplay}</strong>
              </a>
            </p>
          </div>
          <div className="lp-report-card" aria-label={hero.sampleCard.title}>
            <div className="lp-report-head">
              <span className="lp-report-badge">{hero.sampleCard.badge}</span>
              <span className="lp-report-status">{hero.sampleCard.status}</span>
            </div>
            <h2 className="lp-report-title">{hero.sampleCard.title}</h2>
            <p className="lp-report-caption">{hero.sampleCard.caption}</p>
            {hero.image ? (
              <Image
                className="lp-report-image"
                src={hero.image.src}
                alt={hero.image.alt}
                width={hero.image.width}
                height={hero.image.height}
                unoptimized
              />
            ) : null}
            <div className="lp-check-list">
              {hero.sampleCard.items.map((item) => (
                <div className="lp-check-row" key={item.label}>
                  <span className="lp-check-dot" data-tone={item.tone} aria-hidden="true" />
                  <span>
                    {item.label}
                    <span className="lp-field-help">{item.detail}</span>
                  </span>
                  <span className="lp-check-status">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="problems" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{problems.eyebrow}</p>
            <h2 className="lp-h2">{problems.title}</h2>
            <p className="lp-lead">{problems.lead}</p>
          </div>
          <p className="lp-segment-label">{problems.segmentsLabel}</p>
          <div className="lp-chip-row">
            {problems.segments.map((segment) => (
              <span className="lp-chip" key={segment}>
                {segment}
              </span>
            ))}
          </div>
          <div className="lp-grid-3">
            {problems.items.slice(0, 3).map((item) => (
              <article className="lp-card" key={item.number}>
                <span className="lp-num">{item.number}</span>
                <p className="lp-segment-label">{item.segment}</p>
                <h3 className="lp-h3">{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reasons" className="lp-section lp-dark-panel">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-kicker">{reasons.eyebrow}</p>
            <h2 className="lp-h2">{reasons.title}</h2>
          </div>
          <div className="lp-grid-3">
            {reasons.items.map((item) => (
              <article className="lp-card" key={item.number}>
                <span className="lp-num">{item.number}</span>
                <h3 className="lp-h3">{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{services.eyebrow}</p>
            <h2 className="lp-h2">{services.title}</h2>
          </div>
          <div className="lp-service-layout">
            {services.items.map((item) => (
              <article className="lp-service lp-card" key={item.number}>
                <span className="lp-num">{item.number}</span>
                <div className="lp-service-body">
                  <h3 className="lp-h3">{item.title}</h3>
                  <p className="lp-service-summary">{item.summary}</p>
                  <div className="lp-service-facts">
                    <div className="lp-fact">
                      <span className="lp-fact-label">{item.audienceLabel}</span>
                      <span className="lp-fact-value">{item.audience}</span>
                    </div>
                    <div className="lp-fact">
                      <span className="lp-fact-label">{item.scopeLabel}</span>
                      <span className="lp-fact-value">{item.scope}</span>
                    </div>
                    <div className="lp-fact">
                      <span className="lp-fact-label">{item.deliverableLabel}</span>
                      <span className="lp-fact-value">{item.deliverable}</span>
                    </div>
                  </div>
                </div>
                <Link className="lp-btn lp-btn-outline" href="/#contact">
                  {item.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <EditorialSections />

      <section id="pricing" className="lp-section lp-section-muted">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{pricing.eyebrow}</p>
            <h2 className="lp-h2">{pricing.title}</h2>
          </div>
          <div className="lp-plan-grid">
            {pricing.plans.map((plan) => (
              <article
                className="lp-plan"
                data-recommended={plan.recommended ? "true" : undefined}
                key={plan.number}
              >
                {plan.recommended && plan.recommendedLabel ? (
                  <span className="lp-plan-badge">{plan.recommendedLabel}</span>
                ) : null}
                <span className="lp-segment-label">{plan.number}</span>
                <h3 className="lp-plan-name">{plan.name}</h3>
                <p className="lp-plan-price">{plan.price}</p>
                <p className="lp-plan-tax">{plan.taxNote}</p>
                <p className="lp-plan-summary">{plan.summary}</p>
                <ul className="lp-plan-items">
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link className="lp-btn lp-btn-outline" href="/#contact">
                  {pricing.midCtaButton}
                </Link>
              </article>
            ))}
          </div>
          <p className="lp-estimate-note">{pricing.estimateNote}</p>
          <div className="lp-mid-cta">
            <p>{pricing.midCtaText}</p>
            <Link className="lp-btn lp-btn-light" href="/#contact">
              {pricing.midCtaButton}
            </Link>
          </div>
        </div>
      </section>

      <section id="flow" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{flow.eyebrow}</p>
            <h2 className="lp-h2">{flow.title}</h2>
          </div>
          <div className="lp-steps">
            {flow.steps.map((step) => (
              <div className="lp-step" key={step.number}>
                <span className="lp-step-num">{step.number}</span>
                <div>
                  <h3 className="lp-h3">{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <span className="lp-step-duration">
                  {flow.durationLabel} {step.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="commitments" className="lp-section lp-section-muted">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{commitments.eyebrow}</p>
            <h2 className="lp-h2">{commitments.title}</h2>
          </div>
          <div className="lp-commit-grid">
            {commitments.items.map((item) => (
              <div className="lp-commit" key={item.number}>
                <span className="lp-commit-icon">{item.number}</span>
                <div>
                  <h3 className="lp-h3">{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="case-studies" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{caseStudies.eyebrow}</p>
            <h2 className="lp-h2">{caseStudies.title}</h2>
            <p className="lp-lead">{caseStudies.lead}</p>
          </div>
          <div className="lp-case-grid">
            {caseStudies.items.map((item, index) => (
              <article className="lp-card lp-case" key={`${item.meta}-${index}`}>
                {item.image ? (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.width}
                    height={item.image.height}
                    unoptimized
                  />
                ) : null}
                <div className="lp-case-body">
                  <p className="lp-case-meta">{item.meta}</p>
                  <h3 className="lp-h3">{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="lp-section lp-section-muted">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{faq.eyebrow}</p>
            <h2 className="lp-h2">{faq.title}</h2>
          </div>
          <div className="lp-faq-list">
            {faq.items.map((item) => (
              <details className="lp-faq-item" key={item.question}>
                <summary className="lp-faq-q">{item.question}</summary>
                <div className="lp-faq-a">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="company" className="lp-section">
        <div className="lp-container lp-company-layout">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{company.eyebrow}</p>
            <h2 className="lp-h2">{company.title}</h2>
          </div>
          <table className="lp-company-table">
            <tbody>
              {company.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="contact" className="lp-section lp-section-muted">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{contact.eyebrow}</p>
            <h2 className="lp-h2">{contact.title}</h2>
            <p className="lp-lead">{contact.lead}</p>
          </div>
          <div className="lp-contact-layout">
            <div className="lp-contact-info">
              <div className="lp-contact-panel">
                <h3 className="lp-h3">{contact.phoneHeading}</h3>
                <a
                  className="lp-contact-bigphone"
                  href={`tel:${header.phoneTel}`}
                  aria-label={`${a11y.phoneLinkPrefix} ${header.phoneDisplay}`}
                >
                  {header.phoneDisplay}
                </a>
                <ul className="lp-contact-list">
                  <li>
                    <strong>{contact.hoursPrefix}</strong> {header.hours}
                  </li>
                </ul>
              </div>
              <div className="lp-contact-panel">
                <h3 className="lp-h3">{contact.replyLabel}</h3>
                <p>{contact.replyValue}</p>
              </div>
              <div className="lp-contact-panel">
                <h3 className="lp-h3">{company.title}</h3>
                <ul className="lp-contact-list">
                  {company.rows.map((row) => (
                    <li key={row.label}>
                      <strong>{row.label}</strong> {row.value}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lp-contact-panel">
                <h3 className="lp-h3">{contact.nextStepsHeading}</h3>
                <ol className="lp-contact-list">
                  {contact.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
