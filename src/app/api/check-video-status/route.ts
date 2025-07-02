import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

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
      `${A0X_AGENT_API_URL}/moonxbt/task/${taskId}/status`,
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
