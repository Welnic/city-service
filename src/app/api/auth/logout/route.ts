import { NextResponse } from "next/server";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();

    // Best effort: try to invalidate the token on Directus side
    if (refreshToken) {
      await fetch(`${DIRECTUS_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {
        // Ignore errors — we still clear cookies regardless
      });
    }

    await clearAuthCookies();

    return NextResponse.json({ success: true });
  } catch {
    // Even if something goes wrong, clear cookies
    await clearAuthCookies();
    return NextResponse.json({ success: true });
  }
}
