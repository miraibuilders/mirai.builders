import { getCrmActor, type CrmActor, type CrmRole } from "@/lib/crm-auth";

export function canViewCms(role: CrmRole | null | undefined): boolean {
  return role === "admin" || role === "editor" || role === "viewer";
}

export function canCreateCmsPost(role: CrmRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

export function canEditCmsPost(
  role: CrmRole | null | undefined,
  postAuthorId: string | null,
  userId: string,
): boolean {
  if (role === "admin") return true;
  return role === "editor" && postAuthorId === userId;
}

export function canDeleteCmsPost(role: CrmRole | null | undefined): boolean {
  return role === "admin";
}

export function canPublishCmsPost(role: CrmRole | null | undefined): boolean {
  return role === "admin";
}

export function canManageCmsAuthors(role: CrmRole | null | undefined): boolean {
  return role === "admin";
}

export function canUploadCmsMedia(role: CrmRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

export async function requireCmsViewer(): Promise<CrmActor> {
  const actor = await getCrmActor();
  if (!actor || !canViewCms(actor.role)) throw new Error("CMS_FORBIDDEN");
  return actor;
}

export async function requireCmsEditor(): Promise<CrmActor> {
  const actor = await getCrmActor();
  if (!actor || !canCreateCmsPost(actor.role)) throw new Error("CMS_FORBIDDEN");
  return actor;
}

export async function requireCmsAdmin(): Promise<CrmActor> {
  const actor = await getCrmActor();
  if (!actor || actor.role !== "admin") throw new Error("CMS_FORBIDDEN");
  return actor;
}
