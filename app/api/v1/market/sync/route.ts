import { NextRequest, NextResponse } from "next/server";
import { LiveFXService } from "@/lib/server/live-fx-service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await LiveFXService.syncLiveRates();
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Market Sync Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to synchronize live exchange rates.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = LiveFXService.getSyncStatus();
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Market Sync Status Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve sync status." },
      { status: 500 }
    );
  }
}

