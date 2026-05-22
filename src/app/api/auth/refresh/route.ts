import { NextResponse } from "next/server";
import {
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token" },
        { status: 401 }
      );
    }

    const response = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: refreshToken,
        mode: "json",
      }),
    });

    if (!response.ok) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: "Token refresh failed" },
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
    await clearAuthCookies();
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
