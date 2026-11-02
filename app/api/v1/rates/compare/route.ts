import { NextRequest, NextResponse } from "next/server";
import { RateService } from "@/lib/server/rate-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/rates/compare?amount=1000&from=USD&to=NGN
 * Returns ranked multi-channel comparison matrix across CBN NFEM, Commercial Banks, and Fintechs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get("amount") || "1000";
    const from = searchParams.get("from") || "USD";
    const to = searchParams.get("to") || "NGN";

    const comparison = await RateService.compare(amount, from, to);

    return NextResponse.json({
      success: true,
      amount,
      pair: `${from.toUpperCase()}/${to.toUpperCase()}`,
      count: comparison.length,
      data: comparison,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate rate comparison",
      },
      { status: 400 }
    );
  }
}
