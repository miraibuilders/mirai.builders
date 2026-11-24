"use client";

import { useEffect, useState } from "react";
import { useLanding } from "@/features/landing/components/landing-provider";

export function AccountLink() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { content, locale } = useLanding();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/get-session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (active) setLoggedIn(Boolean(session?.user));
      })
      .catch(() => {
        if (active) setLoggedIn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <a className="marketing-account-link" href={loggedIn ? "/dashboard" : "/login"}>
      {loggedIn ? (locale === "ja" ? "ダッシュボード" : "Dashboard") : content.header.accountLabel}
    </a>
  );
}
