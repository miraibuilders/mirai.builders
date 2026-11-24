import { siteContent, t, type Locale } from "@/content/site";
import { LoginForm } from "./login-form";
import "./login.css";

const locale: Locale = "ja";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-brand-panel" aria-label={t(siteContent.brand.name, locale)}>
          <div className="login-brand-inner">
            <div className="login-brand-mark" aria-hidden="true">ML</div>
            <p className="ui-mono login-eyebrow">MIRAI Lab / Internal</p>
            <h2>{t(siteContent.brand.tagline, "en")}</h2>
            <p>{t(siteContent.brand.description, "en")}</p>
          </div>
          <div className="login-brand-grid" aria-hidden="true" />
        </section>
        <section className="login-card-panel">
          <h1>{t(siteContent.loginPage.title, locale)}</h1>
          <LoginForm next={destination} />
        </section>
      </div>
    </main>
  );
}
