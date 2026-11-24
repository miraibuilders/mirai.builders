import { NextResponse } from "next/server";
import { getPool } from "@mirai/db";
import { notifyStaff } from "@/lib/staff-alert";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getPool().query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    await notifyStaff(
      "health_database_failure",
      { route: "/api/health", reason: "database_unavailable" },
      error,
    );
    return NextResponse.json({ status: "error", database: "disconnected" }, { status: 503 });
  }
}
