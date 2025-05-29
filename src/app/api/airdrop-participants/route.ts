import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.A0X_AGENT_API_KEY;
const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const {
      fid,
      username,
      task,
      status,
      platform,
      limit = "50",
      startAfter,
      getAll = "false",
    } = Object.fromEntries(searchParams.entries());

    const response = await axios.get(
      `${A0X_AGENT_API_URL}/a0x-framework/airdrop/admin-dashboard`,
      {
        params: {
          fid,
          username,
          task,
          status,
          platform,
          limit,
          startAfter,
          getAll,
        },
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching airdrop participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch airdrop participants" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farcasterFid, taskName, completed, notes } = body;

    if (!farcasterFid || !taskName) {
      return NextResponse.json(
        { error: "farcasterFid and taskName are required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/airdrop/admin-dashboard`,
      {
        action: "update_task",
        farcasterFid,
        taskName,
        completed,
        notes,
      },
      {
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
