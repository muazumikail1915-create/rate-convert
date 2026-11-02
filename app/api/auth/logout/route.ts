import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { hashToken, clearAuthCookies } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshTokenRaw = request.cookies.get("refreshToken")?.value;
    if (refreshTokenRaw) {
      const tokenHash = hashToken(refreshTokenRaw);
      db.revokeRefreshToken(tokenHash);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error("Logout Error:", error);
    const response = NextResponse.json({ success: true, message: "Logged out." });
    clearAuthCookies(response);
    return response;
  }
}

