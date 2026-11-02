import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/lib/server/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/keys?key=rc_live_...
 * Query API key details, quota limit, and usage
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      // List active sample keys
      const allKeys = rateLimiter.listKeys().map((k) => ({
        id: k.id,
        name: k.name,
        maskedKey: `${k.key.slice(0, 7)}...${k.key.slice(-4)}`,
        ownerEmail: k.ownerEmail,
        plan: k.plan,
        rateLimitPerMin: k.rateLimitPerMin,
        totalRequests: k.totalRequests,
        isActive: k.isActive,
        createdAt: k.createdAt,
      }));

      return NextResponse.json({
        success: true,
        count: allKeys.length,
        data: allKeys,
      });
    }

    const record = rateLimiter.getKey(key);
    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "API key not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        name: record.name,
        key: record.key,
        ownerEmail: record.ownerEmail,
        plan: record.plan,
        rateLimitPerMin: record.rateLimitPerMin,
        totalRequests: record.totalRequests,
        isActive: record.isActive,
        createdAt: record.createdAt,
        lastUsedAt: record.lastUsedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve API key information",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/keys
 * Create a new API key
 * Body: { ownerEmail: "dev@company.com", name: "Main Backend Service", plan: "PRO" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerEmail, name, plan } = body;

    if (!ownerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: 'ownerEmail' is required.",
        },
        { status: 400 }
      );
    }

    const validPlan = (plan === "PRO" || plan === "ENTERPRISE" ? plan : "FREE") as "FREE" | "PRO" | "ENTERPRISE";
    const newKey = rateLimiter.createKey(ownerEmail, name || "Developer App", validPlan);

    return NextResponse.json(
      {
        success: true,
        message: `API Key successfully generated for plan [${validPlan}].`,
        data: newKey,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create API key",
      },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/v1/keys
 * Revoke an API key
 * Body: { key: "rc_live_..." }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: 'key' is required to revoke.",
        },
        { status: 400 }
      );
    }

    const success = rateLimiter.revokeKey(key);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "API key not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `API Key ${key} has been revoked successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to revoke API key",
      },
      { status: 500 }
    );
  }
}
