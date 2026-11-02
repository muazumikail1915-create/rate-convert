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
        { success: false, error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    const verificationRecord = db.getVerificationToken(email, "EMAIL_VERIFY");
    if (!verificationRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    if (new Date(verificationRecord.expiresAt) < new Date()) {
      db.deleteVerificationToken(email, "EMAIL_VERIFY");
      return NextResponse.json(
        { success: false, error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (verificationRecord.token !== code.trim()) {
      return NextResponse.json(
        { success: false, error: "Incorrect verification code." },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: "User account not found." }, { status: 404 });
    }

    // Activate the user
    const updatedUser = db.updateUser(user.id, { status: "ACTIVE" });
    db.deleteVerificationToken(email, "EMAIL_VERIFY");

    // Generate tokens & session
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: "ACTIVE",
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
      action: "EMAIL_VERIFIED_ACTIVATED",
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully. Welcome to RateConvert!",
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        role: updatedUser?.role,
        status: updatedUser?.status,
      },
      redirectTo: "/",
    });

    setAuthCookies(response, accessToken, refreshTokenRaw);
    return response;
  } catch (error) {
    console.error("Verify Email Error:", error);
    return NextResponse.json({ success: false, error: "Verification failed." }, { status: 500 });
  }
}

