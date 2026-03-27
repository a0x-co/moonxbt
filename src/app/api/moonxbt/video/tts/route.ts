import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.MOONXBT_API_URL ||
  process.env.A0X_AGENT_API_URL ||
  process.env.NEXT_PUBLIC_MOONXBT_API_URL ||
  "";

const BACKEND_API_KEY =
  process.env.API_KEY ||
  process.env.MOONXBT_API_KEY ||
  process.env.MOONXBT_BACKEND_API_KEY ||
  "";

export async function POST(request: NextRequest) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json(
      { error: "A0X_AGENT_API_URL is not configured" },
      { status: 503 }
    );
  }

  if (!BACKEND_API_KEY) {
    return NextResponse.json(
      { error: "API_KEY is not configured" },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const res = await fetch(`${BACKEND_BASE_URL}/moonxbt/video/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": BACKEND_API_KEY,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
