const ALLOWED_ORIGINS = [
  "https://prudency.app",
  "https://www.prudency.app",
];

function getAllowedOrigin(requestOrigin: string | null): string {
  // In development, allow all origins
  const env = Deno.env.get("ENVIRONMENT") ?? "production";
  if (env === "development" || env === "local") {
    return requestOrigin ?? "*";
  }

  // In production, only allow known origins and the Expo app scheme
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  // For mobile app requests (no Origin header), return the default
  return ALLOWED_ORIGINS[0];
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}
