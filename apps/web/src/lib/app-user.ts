import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export async function getAppUser(): Promise<AppUser | null> {
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? session.user.email ?? "Account",
    email: session.user.email ?? "",
  };
}
