import { redirect } from "next/navigation";
import { getCrmActor } from "@/lib/crm-auth";
import { canViewCms } from "@/lib/cms-auth";
import "./cms.css";

export const dynamic = "force-dynamic";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const actor = await getCrmActor();
  if (!actor) redirect("/login?next=%2Fcms");
  if (!canViewCms(actor.role)) redirect("/?notice=CMS_FORBIDDEN");
  return <>{children}</>;
}
