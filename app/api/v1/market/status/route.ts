import { NextRequest, NextResponse } from "next/server";
import { RateService } from "@/lib/server/rate-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/market/status
 * Returns current Nigerian Foreign Exchange Market (NFEM) trading window status, WAT clock, turnover, and parallel spread
 */
export async function GET(request: NextRequest) {
  try {
    const session = await RateService.getMarketStatus();

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch market session status",
      },
      { status: 500 }
    );
  }
}
