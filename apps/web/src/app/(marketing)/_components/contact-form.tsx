"use client";

import { useActionState } from "react";
import { siteContent, t, type Locale } from "@/content/site";
import { submitContactRequest, type ContactFormState } from "../actions";

const locale: Locale = "ja";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactRequest, initialState);

  return (
    <form action={action} className="contact-form">
      <div className="field">
        <label htmlFor="name">{t(siteContent.formLabels.name, locale)}</label>
        <input id="name" name="name" type="text" autoComplete="name" required maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="company">{t(siteContent.formLabels.company, locale)}</label>
        <input id="company" name="company" type="text" autoComplete="organization" required maxLength={160} />
      </div>
      <div className="field">
        <label htmlFor="email">{t(siteContent.formLabels.email, locale)}</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={320} />
      </div>
      <div className="field">
        <label htmlFor="phone">{t(siteContent.formLabels.phone, locale)}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} />
      </div>
      <div className="field">
        <label htmlFor="message">{t(siteContent.formLabels.message, locale)}</label>
        <textarea id="message" name="message" required maxLength={4000} />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">{t(siteContent.formLabels.website, locale)}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "success" ? (
        <p className="form-status success" role="status">
          {t(siteContent.formLabels.success, locale)}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="form-status error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="button" disabled={pending}>
        {pending ? t(siteContent.formLabels.submitting, locale) : t(siteContent.formLabels.submit, locale)}
      </button>
      <p className="privacy-note">{t(siteContent.formLabels.privacyNote, locale)}</p>
    </form>
  );
}
