import { NextRequest } from "next/server";

type AdminAuthSuccess = { ok: true };
type AdminAuthFailure = { ok: false; error: string; status: number };

type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

function extractToken(request: NextRequest) {
  const headerToken =
    request.headers.get("x-admin-key") || request.headers.get("x-api-key") || "";

  if (headerToken) {
    return headerToken.trim();
  }

  const authorization = request.headers.get("authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return "";
}

function getConfiguredAdminKeys() {
  return [
    process.env.MOONXBT_ADMIN_API_KEY,
    process.env.ADMIN_API_KEY,
    process.env.NEXT_ADMIN_API_KEY,
  ].filter((value): value is string => Boolean(value && value.trim()));
}

export async function verifyAdminRequest(request: NextRequest): Promise<AdminAuthResult> {
  const allowedKeys = getConfiguredAdminKeys();

  if (allowedKeys.length === 0) {
    return {
      ok: false,
      error: "Admin auth is not configured",
      status: 503,
    };
  }

  const token = extractToken(request);
  if (!token || !allowedKeys.includes(token)) {
    return {
      ok: false,
      error: "Unauthorized admin request",
      status: 401,
    };
  }

  return { ok: true };
}
