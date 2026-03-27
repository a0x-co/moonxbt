import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.A0X_AGENT_API_KEY;
const BACKEND_BASE_URL =
  process.env.MOONXBT_API_URL ||
  process.env.A0X_AGENT_API_URL ||
  process.env.NEXT_PUBLIC_MOONXBT_API_URL ||
  "";

export async function POST(request: NextRequest) {
  try {
    const { fid, taskId, completed } = await request.json();

    if (!fid || !taskId) {
      return NextResponse.json(
        { error: "FID and taskId are required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${BACKEND_BASE_URL}/moonxbt/airdrop/admin-dashboard`,
      {
        action: "update_task",
        farcasterFid: fid,
        taskName: taskId,
        completed,
      },
      {
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update task");
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
