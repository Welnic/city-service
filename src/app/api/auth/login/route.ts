import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error?.errors?.[0]?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data } = await response.json();
    const { access_token, refresh_token, expires } = data;

    await setAuthCookies(
      access_token,
      refresh_token,
      expires ? Math.floor(expires / 1000) : undefined
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
