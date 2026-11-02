import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  hashToken,
  generateRefreshToken,
  signAccessToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const refreshTokenRaw = request.cookies.get("refreshToken")?.value;
    if (!refreshTokenRaw) {
      return NextResponse.json({ success: false, error: "No refresh token provided." }, { status: 401 });
    }

    const tokenHash = hashToken(refreshTokenRaw);
    const storedSession = db.getRefreshToken(tokenHash);

    if (!storedSession || storedSession.revoked) {
      const response = NextResponse.json(
        { success: false, error: "Invalid or revoked refresh token." },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    if (new Date(storedSession.expiresAt) < new Date()) {
      db.revokeRefreshToken(tokenHash);
      const response = NextResponse.json(
        { success: false, error: "Refresh token expired." },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    const user = db.getUserById(storedSession.userId);
    if (!user || user.status !== "ACTIVE") {
      const response = NextResponse.json(
        { success: false, error: "User is no longer active." },
        { status: 403 }
      );
      clearAuthCookies(response);
      return response;
    }

    // Refresh Token Rotation: Revoke previous token
    db.revokeRefreshToken(tokenHash);

    // Issue new pair
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: user.name,
    });

    const { token: newRefreshTokenRaw, hash: newRefreshHash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.storeRefreshToken(
      newRefreshHash,
      user.id,
      expiresAt,
      request.headers.get("user-agent") || undefined,
      request.headers.get("x-forwarded-for") || undefined
    );

    const response = NextResponse.json({
      success: true,
      message: "Session refreshed.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    setAuthCookies(response, accessToken, newRefreshTokenRaw);
    return response;
  } catch (error) {
    console.error("Refresh Error:", error);
    return NextResponse.json({ success: false, error: "Failed to refresh token." }, { status: 500 });
  }
}

