import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AuthJWTPayload, UserRole, UserStatus } from "./types";
import { NextResponse } from "next/server";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "fx-rate-convert-super-secret-jwt-key-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

// Access token lifetime: 15 minutes
export const ACCESS_TOKEN_EXPIRY = "15m";
// Refresh token lifetime: 7 days (in seconds)
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const REFRESH_TOKEN_EXPIRY_SECONDS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

/**
 * Hash plain password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plain password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create and sign a short-lived Access JWT
 */
export async function signAccessToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  name: string;
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an Access JWT
 */
export async function verifyAccessToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographically secure random refresh token and its SHA-256 hash
 */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(40).toString("hex");
  const hash = hashToken(token);
  return { token, hash };
}

/**
 * Hash a token using SHA-256 (stored in DB instead of plaintext)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a 6-digit OTP code for email verification & 2FA
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Set secure HttpOnly cookies for access and refresh tokens
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === "production";

  // Access Token: 15 minutes
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 mins
  });

  // Refresh Token: 7 days
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
}

/**
 * Clear authentication cookies on logout or invalid session
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

