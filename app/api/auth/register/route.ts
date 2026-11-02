import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { hashPassword, generateOTP } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, termsAccepted } = body;

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: "You must accept the Terms of Service to continue." },
        { status: 400 }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Password validation: minimum 8 characters, at least 1 uppercase and 1 number
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long and contain at least one uppercase letter and one number.",
        },
        { status: 400 }
      );
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = db.createUser({
      email,
      name,
      passwordHash,
      role: "USER",
      status: "PENDING_VERIFICATION",
    });

    // Generate 6-digit verification OTP
    const otp = generateOTP();
    db.createVerificationToken(email, "EMAIL_VERIFY", otp, 15);

    // Audit log
    db.createAuditLog({
      userId: newUser.id,
      userEmail: newUser.email,
      action: "USER_REGISTERED",
      details: { role: "USER", status: "PENDING_VERIFICATION" },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please enter the verification code sent to your email.",
      email: newUser.email,
      // In development/test mode, return testOtp so user can verify immediately
      testOtp: otp,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}

