import { NextRequest, NextResponse } from "next/server";
import { RateService } from "@/lib/server/rate-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/rates/historical?base=USD&target=NGN&timeframe=24H|7D|30D|90D|1Y
 * Returns historical OHLC time-series data for charting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base") || "USD";
    const target = searchParams.get("target") || "NGN";
    const timeframe = (searchParams.get("timeframe") as "24H" | "7D" | "30D" | "90D" | "1Y") || "30D";

    const data = await RateService.getHistorical(base, target, timeframe);

    return NextResponse.json({
      success: true,
      pair: `${base.toUpperCase()}/${target.toUpperCase()}`,
      timeframe,
      pointsCount: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve historical rates",
      },
      { status: 400 }
    );
  }
}
