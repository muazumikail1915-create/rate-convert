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
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const users = db.getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Admin Users GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, role, status } = body;

    // Only SUPER_ADMIN can modify roles
    if (role && payload.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Super Admins can assign roles." },
        { status: 403 }
      );
    }

    // Admins can update status (suspend/activate), but not modify SUPER_ADMIN users
    const targetUser = db.getUserById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Target user not found" }, { status: 404 });
    }

    if (targetUser.role === "SUPER_ADMIN" && payload.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Cannot modify a Super Admin account." },
        { status: 403 }
      );
    }

    const updates: Partial<typeof targetUser> = {};
    if (role) updates.role = role;
    if (status) updates.status = status;

    const updated = db.updateUser(targetUserId, updates);

    // Audit log
    db.createAuditLog({
      userId: payload.userId,
      userEmail: payload.email,
      action: role ? "USER_ROLE_UPDATED" : "USER_STATUS_UPDATED",
      resource: targetUserId,
      details: { updates, previousRole: targetUser.role, previousStatus: targetUser.status },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Admin Users PATCH Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

