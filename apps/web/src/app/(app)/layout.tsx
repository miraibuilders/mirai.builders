import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/app-user";
import { getCrmActor } from "@/lib/crm-auth";
import { AppShell } from "./_shell/app-shell";

export const dynamic = "force-dynamic";

function currentPath(requestHeaders: Headers): string {
  const matched =
    requestHeaders.get("x-pathname") ??
    requestHeaders.get("x-matched-path") ??
    requestHeaders.get("x-invoke-path");
  if (matched?.startsWith("/")) return matched.split("?")[0];
  return "/";
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await getCrmActor();
  if (!actor) {
    const requestHeaders = await headers();
    redirect(`/login?next=${encodeURIComponent(currentPath(requestHeaders))}`);
  }
  const user = await getAppUser();
  if (!user) redirect("/login");
  return <AppShell user={user} role={actor.role}>{children}</AppShell>;
}
