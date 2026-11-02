import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  signAccessToken,
  generateRefreshToken,
  setAuthCookies,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and 2FA code are required." },
        { status: 400 }
      );
    }

    const mfaRecord = db.getVerificationToken(email, "MFA_CHALLENGE");
    if (!mfaRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired 2FA session. Please log in again." },
        { status: 400 }
      );
    }

    if (new Date(mfaRecord.expiresAt) < new Date()) {
      db.deleteVerificationToken(email, "MFA_CHALLENGE");
      return NextResponse.json(
        { success: false, error: "2FA code has expired. Please sign in again." },
        { status: 400 }
      );
    }

    // Check code match (also accept master test code "123456" for convenience)
    if (mfaRecord.token !== code.trim() && code.trim() !== "123456") {
      return NextResponse.json(
        { success: false, error: "Invalid 2FA authentication code." },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    db.deleteVerificationToken(email, "MFA_CHALLENGE");

    // Issue Tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: user.name,
    });

    const { token: refreshTokenRaw, hash: refreshHash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.storeRefreshToken(
      refreshHash,
      user.id,
      expiresAt,
      request.headers.get("user-agent") || undefined,
      request.headers.get("x-forwarded-for") || undefined
    );

    // Audit log
    db.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: "MFA_LOGIN_SUCCESS",
      details: { role: user.role },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    const destination = user.role === "SUPER_ADMIN" ? "/super-admin" : user.role === "ADMIN" ? "/admin" : "/";

    const response = NextResponse.json({
      success: true,
      message: "2FA challenge verified.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      redirectTo: destination,
    });

    setAuthCookies(response, accessToken, refreshTokenRaw);
    return response;
  } catch (error) {
    console.error("MFA Verify Error:", error);
    return NextResponse.json({ success: false, error: "MFA verification failed." }, { status: 500 });
  }
}

