import { NextResponse } from "next/server";
import { getPool } from "@mirai/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getPool().query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { status: "error", database: "disconnected", error: message },
      { status: 503 },
    );
  }
}
