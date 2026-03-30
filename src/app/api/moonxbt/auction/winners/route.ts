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

export async function GET(request: NextRequest) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json(
      { error: "A0X_AGENT_API_URL is not configured" },
      { status: 503 },
    );
  }

  if (!BACKEND_API_KEY) {
    return NextResponse.json(
      { error: "API_KEY is not configured" },
      { status: 503 },
    );
  }

  const limit = request.nextUrl.searchParams.get("limit") || "10";

  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/moonxbt/auction/winners?limit=${encodeURIComponent(limit)}`,
      {
        headers: {
          "x-api-key": BACKEND_API_KEY,
        },
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        backendBaseUrl: BACKEND_BASE_URL,
        error:
          err instanceof Error
            ? err.message
            : "Failed to reach MoonXBT backend",
      },
      { status: 502 },
    );
  }
}
