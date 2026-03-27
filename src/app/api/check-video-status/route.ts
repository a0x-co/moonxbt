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
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Check task status from backend
    const response = await axios.get(
      `${BACKEND_BASE_URL}/moonxbt/task/${taskId}/status`,
      {
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error checking video status:", error);
    return NextResponse.json(
      { error: "Failed to check video status" },
      { status: 500 }
    );
  }
}
