import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_KEY = process.env.API_KEY;
const BACKEND_BASE_URL =
  process.env.MOONXBT_API_URL ||
  process.env.A0X_AGENT_API_URL ||
  process.env.NEXT_PUBLIC_MOONXBT_API_URL ||
  "";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const influencerId = searchParams.get("influencerId");

    if (!influencerId) {
      return NextResponse.json(
        { error: "Influencer ID is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `${BACKEND_BASE_URL}/moonxbt/${influencerId}/videos`,
      {
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
