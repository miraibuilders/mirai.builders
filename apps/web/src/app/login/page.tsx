import { siteContent, t, type Locale } from "@/content/site";
import { LoginForm } from "./login-form";

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
    <main className="container">
      <h1>{t(siteContent.loginPage.title, locale)}</h1>
      <LoginForm next={destination} />
    </main>
  );
}
