"use client";

import Link from "next/link";
import { useEffect } from "react";

const bodyStyle = {
  margin: 0,
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "32px",
  background: "#0b0f19",
  color: "#f8fafc",
  fontFamily: "sans-serif",
};

const panelStyle = {
  width: "min(100%, 640px)",
  padding: "36px 28px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#171b30",
  textAlign: "center" as const,
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "44px",
  padding: "0 18px",
  borderRadius: "999px",
  border: "0",
  background: "#269ad9",
  color: "#ffffff",
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
};

export default function GlobalError({
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
      body: JSON.stringify({ digest: error.digest ?? "", reason: "global_error_boundary" }),
    }).catch(() => undefined);
  }, [error.digest]);

  return (
    <html lang="ja">
      <body style={bodyStyle}>
        <main style={panelStyle} role="alert">
          <p style={{ margin: "0 0 12px", color: "#7fd4ff", fontWeight: 700 }}>MIRAI Lab</p>
          <h1 style={{ margin: "0 0 12px", fontSize: "28px" }}>現在メンテナンス中です</h1>
          <p style={{ margin: "0 0 24px", color: "#d7deea" }}>
            ページを表示できませんでした。しばらくしてからもう一度お試しください。
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button type="button" onClick={reset} style={buttonStyle}>
              再読み込み / Reload
            </button>
            <Link href="/" style={{ ...buttonStyle, background: "transparent", border: "1px solid #52617a" }}>
              トップへ / Top
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
