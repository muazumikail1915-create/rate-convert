import { NextRequest, NextResponse } from "next/server";
import { RateService } from "@/lib/server/rate-service";
import { RateType } from "@/lib/mock-rates";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/rates/convert?amount=1000&from=USD&to=NGN&type=official|bank|provider
 * Performs precision client or server side FX conversion with fee deduction breakdowns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get("amount") || "1000";
    const from = searchParams.get("from") || "USD";
    const to = searchParams.get("to") || "NGN";
    const type = (searchParams.get("type") as RateType) || "official";

    const result = await RateService.convert({
      amount,
      from,
      to,
      type,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Conversion failed",
      },
      { status: 400 }
    );
  }
}

/**
 * POST /api/v1/rates/convert
 * Request Body: { amount: "1000", from: "USD", to: "NGN", type: "official" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, from, to, type } = body;

    if (!from || !to) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: 'from' and 'to' are required",
        },
        { status: 400 }
      );
    }

    const result = await RateService.convert({
      amount: String(amount || "1000"),
      from: String(from),
      to: String(to),
      type: type || "official",
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Conversion calculation failed",
      },
      { status: 400 }
    );
  }
}
