import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { verifyAccessToken } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Admin access required to view audit logs." },
        { status: 403 }
      );
    }

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
    const logs = db.getAuditLogs(limit);
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Audit Logs GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

