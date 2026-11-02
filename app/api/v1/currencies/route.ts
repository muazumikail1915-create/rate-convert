import { NextRequest, NextResponse } from "next/server";
import { RateService } from "@/lib/server/rate-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/currencies?category=major|african|emerging|all
 * Returns list of supported currencies with metadata and categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const currencies = await RateService.getCurrencies(category);

    return NextResponse.json({
      success: true,
      count: currencies.length,
      data: currencies,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch currencies",
      },
      { status: 500 }
    );
  }
}
