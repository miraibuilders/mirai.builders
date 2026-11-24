"use client";

import { useState } from "react";
import { siteContent, t, type Locale } from "@/content/site";

const locale: Locale = "ja";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setMessage(t(siteContent.loginPage.failed, locale));
        return;
      }
      window.location.href = next;
    } catch {
      setMessage(t(siteContent.loginPage.failed, locale));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <label className="field">
        {t(siteContent.loginPage.email, locale)}
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="field">
        {t(siteContent.loginPage.password, locale)}
        <input
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button className="button" type="submit" disabled={pending}>
        {t(siteContent.loginPage.submit, locale)}
      </button>
      {message ? <p>{message}</p> : null}
    </form>
  );
}
