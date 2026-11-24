"use client";

import Link from "next/link";
import { useEffect } from "react";

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
    <main id="main-content" className="lp-error-main">
      <section className="lp-error-panel" role="alert">
        <p className="lp-mono-label">MIRAI Lab / SYSTEM NOTICE</p>
        <h1 className="lp-h1">現在メンテナンス中です</h1>
        <p className="lp-lead">ページを表示できませんでした。しばらくしてからもう一度お試しください。</p>
        <p className="lp-error-en">We could not display this page. Please try again shortly.</p>
        {error.digest ? <p className="lp-error-digest">REF: {error.digest}</p> : null}
        <div className="lp-error-actions">
          <button type="button" className="lp-btn lp-btn-primary" onClick={reset}>
            再読み込み / Reload
          </button>
          <Link className="lp-btn lp-btn-outline" href="/">
            トップへ戻る / Back to top
          </Link>
        </div>
      </section>
    </main>
  );
}
