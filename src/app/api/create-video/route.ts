import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  try {
    const { name, description, websiteUrl, websiteDocUrl } =
      await request.json();

    // Validación de campos requeridos
    if (!name || !description || !websiteUrl) {
      return NextResponse.json(
        { error: "Name, description and website URL are required" },
        { status: 400 }
      );
    }

    // Preparar los datos para la API
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

    // Llamar al endpoint del backend
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/create-influencer-video`,
      projectData,
      {
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      message: "Video creation initiated",
      data: response.data,
    });
  } catch (error) {
    console.error("Error creating promotional video:", error);
    return NextResponse.json(
      { error: "Failed to create promotional video" },
      { status: 500 }
    );
  }
}
