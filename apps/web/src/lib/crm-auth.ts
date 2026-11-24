import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export type CrmRole = "admin" | "editor" | "viewer" | "user";

export type CrmActor = {
  userId: string;
  role: CrmRole;
};

export function canEnqueueScan(role: CrmRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

export async function getCrmActor(): Promise<CrmActor | null> {
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session?.session?.userId || !session.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "editor" && role !== "viewer" && role !== "user") return null;
  return { userId: session.session.userId, role };
}

export async function requireCrmEditor(): Promise<CrmActor> {
  const actor = await getCrmActor();
  if (!actor || !canEnqueueScan(actor.role)) throw new Error("CRM_FORBIDDEN");
  return actor;
}

export async function requireCrmAdmin(): Promise<CrmActor> {
  const actor = await getCrmActor();
  if (!actor || actor.role !== "admin") throw new Error("CRM_FORBIDDEN");
  return actor;
}
