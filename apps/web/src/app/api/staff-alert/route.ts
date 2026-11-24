import { NextResponse, type NextRequest } from "next/server";
import { notifyStaff } from "@/lib/staff-alert";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const data = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const digest = typeof data.digest === "string" ? data.digest.slice(0, 64) : undefined;
  const reason = typeof data.reason === "string" ? data.reason.slice(0, 64) : undefined;

  await notifyStaff("public_error_boundary", {
    route: "public",
    reason: reason ?? "unexpected_error",
    digest,
  });

  return NextResponse.json({ ok: true });
}
