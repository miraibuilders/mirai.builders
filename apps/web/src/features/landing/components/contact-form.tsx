"use client";

import { useEffect, useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { submitContactRequest, type ContactFormState } from "@/app/(marketing)/actions";
import { validateContact, type ContactErrors, type ContactInput } from "../validation";
import { useLanding } from "./landing-provider";

const initialState: ContactFormState = { status: "idle" };

function fieldValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function toContactInput(formData: FormData): ContactInput {
  return {
    company: fieldValue(formData, "company"),
    name: fieldValue(formData, "name"),
    email: fieldValue(formData, "email"),
    phone: fieldValue(formData, "phone"),
    topic: fieldValue(formData, "topic"),
    websiteUrl: fieldValue(formData, "websiteUrl"),
    noWebsite: formData.has("noWebsite"),
    message: fieldValue(formData, "message"),
    consent: formData.has("consent"),
    honeypot: fieldValue(formData, "website"),
  };
}

export function ContactForm() {
  const { content } = useLanding();
  const formCopy = content.contact.form;
  const fields = formCopy.fields;
  const [state, action, pending] = useActionState(submitContactRequest, initialState);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [silentSuccess, setSilentSuccess] = useState(false);
  const [renderedAt, setRenderedAt] = useState("");

  useEffect(() => {
    setRenderedAt(String(Date.now()));
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validateContact(toContactInput(new FormData(event.currentTarget)), formCopy.topics);
    if (!result.ok) {
      event.preventDefault();
      setErrors("reason" in result ? {} : result.errors);
      setSilentSuccess("reason" in result);
      return;
    }
    setErrors({});
    setSilentSuccess(false);
  }

  const showSuccess = silentSuccess || state.status === "success";
  const showError = !showSuccess && (state.status === "error" || Object.keys(errors).length > 0);

  return (
    <form className="lp-form" action={action} onSubmit={handleSubmit} noValidate>
      {showSuccess ? (
        <p className="lp-form-status" data-status="success" role="status">
          <strong>{formCopy.successTitle}</strong> {formCopy.successBody}
        </p>
      ) : null}
      {showError ? (
        <p className="lp-form-status" data-status="error" role="alert">
          <strong>{formCopy.errorTitle}</strong>{" "}
          {state.status === "error" && state.message ? state.message : formCopy.errorMessage}
        </p>
      ) : null}
      <div className="lp-form-row">
        <div className="lp-field">
          <label className="lp-field-label" htmlFor="company">
            <span>{fields.company.label}</span>
            <span className="lp-required">{fields.company.requiredLabel}</span>
          </label>
          <input
            className="lp-input"
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            required
            maxLength={160}
            placeholder={fields.company.placeholder}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "company-error" : undefined}
          />
          {fields.company.help ? <span className="lp-field-help">{fields.company.help}</span> : null}
          {errors.company ? (
            <span className="lp-field-error" id="company-error">
              {formCopy.errorCodes[errors.company]}
            </span>
          ) : null}
        </div>
        <div className="lp-field">
          <label className="lp-field-label" htmlFor="name">
            <span>{fields.name.label}</span>
            <span className="lp-required">{fields.name.requiredLabel}</span>
          </label>
          <input
            className="lp-input"
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            placeholder={fields.name.placeholder}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {fields.name.help ? <span className="lp-field-help">{fields.name.help}</span> : null}
          {errors.name ? (
            <span className="lp-field-error" id="name-error">
              {formCopy.errorCodes[errors.name]}
            </span>
          ) : null}
        </div>
        <div className="lp-field">
          <label className="lp-field-label" htmlFor="email">
            <span>{fields.email.label}</span>
            <span className="lp-required">{fields.email.requiredLabel}</span>
          </label>
          <input
            className="lp-input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            placeholder={fields.email.placeholder}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {fields.email.help ? <span className="lp-field-help">{fields.email.help}</span> : null}
          {errors.email ? (
            <span className="lp-field-error" id="email-error">
              {formCopy.errorCodes[errors.email]}
            </span>
          ) : null}
        </div>
        <div className="lp-field">
          <label className="lp-field-label" htmlFor="phone">
            <span>{fields.phone.label}</span>
            <span className="lp-required">{fields.phone.requiredLabel}</span>
          </label>
          <input
            className="lp-input"
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={40}
            placeholder={fields.phone.placeholder}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {fields.phone.help ? <span className="lp-field-help">{fields.phone.help}</span> : null}
          {errors.phone ? (
            <span className="lp-field-error" id="phone-error">
              {formCopy.errorCodes[errors.phone]}
            </span>
          ) : null}
        </div>
      </div>
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="topic">
          <span>{fields.topic.label}</span>
          <span className="lp-required">{fields.topic.requiredLabel}</span>
        </label>
        <select
          className="lp-select"
          id="topic"
          name="topic"
          required
          defaultValue=""
          aria-invalid={Boolean(errors.topic)}
          aria-describedby={errors.topic ? "topic-error" : undefined}
        >
          <option value="" disabled>
            {formCopy.topicPlaceholder}
          </option>
          {formCopy.topics.map((topic) => (
            <option value={topic} key={topic}>
              {topic}
            </option>
          ))}
        </select>
        {fields.topic.help ? <span className="lp-field-help">{fields.topic.help}</span> : null}
        {errors.topic ? (
          <span className="lp-field-error" id="topic-error">
            {formCopy.errorCodes[errors.topic]}
          </span>
        ) : null}
      </div>
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="websiteUrl">
          <span>{fields.websiteUrl.label}</span>
          <span className="lp-optional">{fields.websiteUrl.optionalLabel}</span>
        </label>
        <input
          className="lp-input"
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder={fields.websiteUrl.placeholder}
          aria-invalid={Boolean(errors.websiteUrl)}
          aria-describedby={errors.websiteUrl ? "websiteUrl-error" : undefined}
        />
        {fields.websiteUrl.help ? <span className="lp-field-help">{fields.websiteUrl.help}</span> : null}
        <label className="lp-checkbox-row" htmlFor="noWebsite">
          <input id="noWebsite" name="noWebsite" type="checkbox" />
          <span>{formCopy.noWebsiteLabel}</span>
        </label>
        {errors.websiteUrl ? (
          <span className="lp-field-error" id="websiteUrl-error">
            {formCopy.errorCodes[errors.websiteUrl]}
          </span>
        ) : null}
      </div>
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="message">
          <span>{fields.message.label}</span>
          <span className="lp-optional">{fields.message.optionalLabel}</span>
        </label>
        <textarea
          className="lp-textarea"
          id="message"
          name="message"
          maxLength={1000}
          placeholder={fields.message.placeholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {fields.message.help ? <span className="lp-field-help">{fields.message.help}</span> : null}
        {errors.message ? (
          <span className="lp-field-error" id="message-error">
            {formCopy.errorCodes[errors.message]}
          </span>
        ) : null}
      </div>
      <div className="lp-field">
        <span className="lp-field-label">
          <span>{fields.consent.label}</span>
          <span className="lp-required">{fields.consent.requiredLabel}</span>
        </span>
        <label className="lp-checkbox-row" htmlFor="consent">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            {formCopy.consentPrefix}
            <Link href="/privacy">{formCopy.privacyLabel}</Link>
            {formCopy.consentSuffix}
          </span>
        </label>
        {fields.consent.help ? <span className="lp-field-help">{fields.consent.help}</span> : null}
        {errors.consent ? (
          <span className="lp-field-error" id="consent-error">
            {formCopy.errorCodes[errors.consent]}
          </span>
        ) : null}
      </div>
      <div className="lp-hp-field" aria-hidden="true">
        <label htmlFor="website">{fields.websiteUrl.label}</label>
        <input
          className="lp-hp-field"
          id="website"
          name="website"
          type="text"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <button className="lp-btn lp-btn-primary" type="submit" disabled={pending}>
        {pending ? formCopy.submittingLabel : formCopy.submitLabel}
      </button>
    </form>
  );
}
