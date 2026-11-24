import { NextResponse } from "next/server";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { enqueueScan, normalizeScanKind } from "@/lib/scans";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await getCrmActor();
  if (!actor) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!canEnqueueScan(actor.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const leadId =
    typeof body === "object" && body !== null && "leadId" in body
      ? String((body as { leadId: unknown }).leadId ?? "")
      : "";
  const requestedKind =
    typeof body === "object" && body !== null && "kind" in body
      ? normalizeScanKind((body as { kind: unknown }).kind)
      : "scan";
  if (!requestedKind) {
    return NextResponse.json({ error: "INVALID_SCAN_KIND" }, { status: 400 });
  }

  const result = await enqueueScan(leadId, requestedKind);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, ...(result.message ? { message: result.message } : {}) },
      { status: result.status },
    );
  }
  return NextResponse.json({ scanId: result.scanId, kind: result.kind, status: "queued" }, { status: 202 });
}
