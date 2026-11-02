import { NextRequest, NextResponse } from "next/server";
import { RateService } from "@/lib/server/rate-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/alerts?userContact=user@example.com
 * Lists active rate alerts for a specific user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userContact = searchParams.get("userContact");

    if (!userContact) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'userContact' query parameter",
        },
        { status: 400 }
      );
    }

    const alerts = await RateService.getAlerts(userContact);

    return NextResponse.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch rate alerts",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/alerts
 * Creates a new rate alert trigger
 * Body: { userContact: "trader@example.com", baseCurrency: "USD", targetCurrency: "NGN", targetRate: 1600, direction: "ABOVE" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userContact, baseCurrency, targetCurrency, targetRate, direction } = body;

    if (!userContact || !baseCurrency || !targetCurrency || !targetRate) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required alert parameters: userContact, baseCurrency, targetCurrency, and targetRate are required.",
        },
        { status: 400 }
      );
    }

    const alert = await RateService.createAlert(
      userContact,
      baseCurrency,
      targetCurrency,
      Number(targetRate),
      direction === "BELOW" ? "BELOW" : "ABOVE"
    );

    return NextResponse.json(
      {
        success: true,
        message: `Alert activated. We will notify ${userContact} when ${baseCurrency.toUpperCase()}/${targetCurrency.toUpperCase()} crosses ${targetRate}.`,
        data: alert,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create rate alert",
      },
      { status: 400 }
    );
  }
}
