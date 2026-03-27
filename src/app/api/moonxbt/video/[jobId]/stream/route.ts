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

export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
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

  try {
    const backendRes = await fetch(
      `${BACKEND_BASE_URL}/moonxbt/video/${params.jobId}/stream`,
      {
        headers: { "x-api-key": BACKEND_API_KEY },
        cache: "no-store",
      }
    );

    if (!backendRes.ok || !backendRes.body) {
      const text = await backendRes.text().catch(() => "");
      return NextResponse.json(
        {
          error:
            text ||
            `Failed to fetch preview stream from backend (${backendRes.status})`,
        },
        { status: backendRes.status || 502 }
      );
    }

    return new NextResponse(backendRes.body, {
      status: 200,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") || "video/mp4",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        backendBaseUrl: BACKEND_BASE_URL,
        error:
          err instanceof Error
            ? err.message
            : "Failed to reach MoonXBT backend",
      },
      { status: 502 }
    );
  }
}
