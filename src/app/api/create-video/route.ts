import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  try {
    const { name, description, websiteUrl, websiteDocUrl } =
      await request.json();

    // Required fields validation
    if (!name || !description || !websiteUrl) {
      return NextResponse.json(
        { error: "Name, description and website URL are required" },
        { status: 400 }
      );
    }

    // Prepare data for API
    const projectData = {
      projectData: {
        name,
        description,
        websiteUrl,
        websiteDocUrl: websiteDocUrl || undefined,
      },
      cloudStorageService: true,
      scrapeWebsite: true,
      useCloudStorage: true,
      influencerId: "3e444822-7a6c-0e5d-a36d-7087fb23685b",
      voiceId: "L4ndSW2PzthljqHuvso3",
      captureWebsite: true,
      screenshotService: "screenshotmachine",
    };

    // Call backend endpoint
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/moonxbt/create-influencer-video`,
      projectData,
      {
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    // Return task ID
    return NextResponse.json({
      message: "Video creation initiated",
      taskId: response.data.taskId,
    });
  } catch (error) {
    console.error("Error creating promotional video:", error);
    return NextResponse.json(
      { error: "Failed to create promotional video" },
      { status: 500 }
    );
  }
}
