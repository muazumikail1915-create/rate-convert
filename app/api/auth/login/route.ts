import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  setAuthCookies,
  generateOTP,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(email);
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const waitMinutes = Math.ceil(
        (new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000)
      );
      return NextResponse.json(
        {
          success: false,
          error: `Account is temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minute(s).`,
          code: "ACCOUNT_LOCKED",
        },
        { status: 423 }
      );
    }

    // Verify Password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutUntil: string | undefined = undefined;

      if (failedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }

      db.updateUser(user.id, {
        failedLoginAttempts: failedAttempts,
        lockoutUntil,
      });

      db.createAuditLog({
        userId: user.id,
        userEmail: user.email,
        action: "LOGIN_FAILED",
        details: { reason: "Bad Password", failedAttempts },
        ipAddress,
      });

      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Reset failed login count upon valid password
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      db.updateUser(user.id, {
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
      });
    }

    // Check Account Status
    if (user.status === "PENDING_VERIFICATION") {
      const newOtp = generateOTP();
      db.createVerificationToken(user.email, "EMAIL_VERIFY", newOtp, 15);
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_NOT_VERIFIED",
          error: "Your email address has not been verified. Please complete verification.",
          email: user.email,
          testOtp: newOtp,
        },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED" || user.status === "LOCKED") {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNT_SUSPENDED",
          error: "Your account has been suspended or locked. Please contact support.",
        },
        { status: 403 }
      );
    }

    // Check 2FA / MFA Requirement (Required for Admins, Super Admins, or if user enabled it)
    if (user.mfaEnabled || user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      const mfaCode = generateOTP();
      db.createVerificationToken(user.email, "MFA_CHALLENGE", mfaCode, 10);

      db.createAuditLog({
        userId: user.id,
        userEmail: user.email,
        action: "MFA_CHALLENGE_ISSUED",
        ipAddress,
      });

      return NextResponse.json({
        success: true,
        requiresMFA: true,
        email: user.email,
        message: "Two-factor authentication code required.",
        testMfaCode: mfaCode, // Exposed for convenience in testing environment
      });
    }

    // Issue Tokens directly (for regular users without 2FA)
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
      ipAddress
    );

    // Audit log
    db.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: "USER_LOGIN_SUCCESS",
      details: { role: user.role },
      ipAddress,
    });

    const destination = "/";

    const response = NextResponse.json({
      success: true,
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
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
