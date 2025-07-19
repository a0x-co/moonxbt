import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export interface GetSignedAssetUrlRequest {
  bucketName: string;
  filePath: string;
  expiresIn?: number; // Optional expiration in seconds (default: 1 hour)
}

export interface GetSignedAssetUrlResponse {
  signedUrl: string;
  originalPath: string;
  expiresAt: string;
}

export interface AssetError {
  error: string;
  details?: string;
  status?: number;
}

function createErrorResponse(
  error: string,
  details?: string,
  status: number = 500
): NextResponse<AssetError> {
  const errorResponse: AssetError = {
    error,
    details,
    status,
  };

  console.error("Asset API Error:", errorResponse);

  return NextResponse.json(errorResponse, { status });
}

export const maxDuration = 30;

export async function POST(
  request: NextRequest
): Promise<NextResponse<GetSignedAssetUrlResponse | AssetError>> {
  try {
    const body: GetSignedAssetUrlRequest = await request.json();
    const { bucketName, filePath, expiresIn = 3600 } = body;

    // Validate required fields
    if (!bucketName || !filePath) {
      return NextResponse.json(
        { error: "Missing required fields: bucketName and filePath" },
        { status: 400 }
      );
    }

    // Validate expiresIn
    if (expiresIn < 60 || expiresIn > 86400) {
      return NextResponse.json(
        { error: "expiresIn must be between 60 and 86400 seconds" },
        { status: 400 }
      );
    }

    // Get the backend API URL from environment
    const backendUrl =
      process.env.A0X_MIRROR_API_URL || "http://localhost:3001";

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/agents/signed-asset-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketName,
        filePath,
        expiresIn,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific backend errors
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Asset not found",
            details: "The requested file does not exist",
          },
          { status: 404 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error: "Access denied",
            details: "Insufficient permissions to access the file",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to get signed URL",
          details:
            errorData.error || errorData.details || "Unknown backend error",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const expiresAt = Date.now() + expiresIn * 1000;

    const result: GetSignedAssetUrlResponse = {
      signedUrl: data.signedUrl,
      originalPath: filePath,
      expiresAt: new Date(expiresAt).toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in signed-url API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Support GET requests for simple file access
export async function GET(
  request: NextRequest
): Promise<NextResponse<GetSignedAssetUrlResponse | AssetError>> {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = searchParams.get("bucketName");
    const filePath = searchParams.get("filePath");
    const expiresIn = parseInt(searchParams.get("expiresIn") || "3600");

    // Validate required fields
    if (!bucketName || !filePath) {
      return NextResponse.json(
        { error: "Missing required query parameters: bucketName and filePath" },
        { status: 400 }
      );
    }

    // Validate expiresIn
    if (expiresIn < 60 || expiresIn > 86400) {
      return NextResponse.json(
        { error: "expiresIn must be between 60 and 86400 seconds" },
        { status: 400 }
      );
    }

    // Get the backend API URL from environment
    const backendUrl =
      process.env.A0X_MIRROR_API_URL || "http://localhost:3001";

    // Forward the request to the backend
    const response = await fetch(
      `${backendUrl}/agents/signed-asset-url?bucketName=${encodeURIComponent(
        bucketName
      )}&filePath=${encodeURIComponent(filePath)}&expiresIn=${expiresIn}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific backend errors
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Asset not found",
            details: "The requested file does not exist",
          },
          { status: 404 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error: "Access denied",
            details: "Insufficient permissions to access the file",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to get signed URL",
          details:
            errorData.error || errorData.details || "Unknown backend error",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const expiresAt = Date.now() + expiresIn * 1000;

    const result: GetSignedAssetUrlResponse = {
      signedUrl: data.signedUrl,
      originalPath: filePath,
      expiresAt: new Date(expiresAt).toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in signed-url API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
