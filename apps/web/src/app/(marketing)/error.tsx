"use client";

import Link from "next/link";
import { useEffect } from "react";

const shellStyle = {
  minHeight: "70vh",
  display: "grid",
  placeItems: "center",
  padding: "64px 20px",
  background: "#0b0f19",
  color: "#f8fafc",
};

const panelStyle = {
  width: "min(100%, 720px)",
  padding: "40px 32px",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "linear-gradient(145deg, #171b30 0%, #0d1222 100%)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.32)",
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "48px",
  padding: "0 20px",
  borderRadius: "999px",
  border: "0",
  background: "#269ad9",
  color: "#ffffff",
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
};

const secondaryStyle = {
  ...buttonStyle,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.28)",
};

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/staff-alert", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ digest: error.digest ?? "", reason: "public_error_boundary" }),
    }).catch(() => undefined);
  }, [error.digest]);

  return (
    <main id="main-content" style={shellStyle}>
      <section style={panelStyle} role="alert">
        <p style={{ margin: "0 0 12px", color: "#7fd4ff", fontWeight: 700 }}>MIRAI Lab</p>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 5vw, 44px)", lineHeight: 1.2 }}>
          現在メンテナンス中です
        </h1>
        <p style={{ margin: "0 0 8px", color: "#d7deea" }}>
          ページを表示できませんでした。しばらくしてからもう一度お試しください。
        </p>
        <p style={{ margin: "0 0 28px", color: "#aeb9cc" }}>
          We could not display this page. Please try again shortly.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <button type="button" onClick={reset} style={buttonStyle}>
            再読み込み / Reload
          </button>
          <Link href="/" style={secondaryStyle}>
            トップへ戻る / Back to top
          </Link>
        </div>
      </section>
    </main>
  );
}
