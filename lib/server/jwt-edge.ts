import { jwtVerify } from "jose";
import { AuthJWTPayload } from "./types";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "fx-rate-convert-super-secret-jwt-key-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

/**
 * Lightweight, Edge-runtime compatible JWT verification for Next.js Middleware
 */
export async function verifyEdgeToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthJWTPayload;
  } catch {
    return null;
  }
}

