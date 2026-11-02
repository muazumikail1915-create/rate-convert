import { NextRequest, NextResponse } from "next/server";
import { RateService } from "@/lib/server/rate-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/rates/latest?base=USD&target=NGN
 * Returns latest spot exchange rates from official, commercial bank, and provider sources
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base") || "USD";
    const target = searchParams.get("target") || "NGN";

    const data = await RateService.getLatestRates(base, target);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch latest exchange rates",
      },
      { status: 400 }
    );
  }
}
