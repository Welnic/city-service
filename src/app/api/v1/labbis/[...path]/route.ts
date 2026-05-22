import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";

const LABBIS_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.LABBIS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const upstream = new URL(
    `/api/v1/labbis/${path.join("/")}`,
    LABBIS_BASE
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "text/plain",
  };

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const correlationId = request.headers.get("x-correlation-id");
  if (correlationId) {
    headers["X-Correlation-ID"] = correlationId;
  }

  let body: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  try {
    const response = await fetch(upstream.toString(), {
      method: request.method,
      headers,
      body,
    });

    if (response.status === 204) {
      return NextResponse.json([], { status: 200 });
    }

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[labbis-proxy] fetch failed:", upstream.toString(), err);
    return NextResponse.json(
      { error: "Failed to reach backend API" },
      { status: 502 }
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
