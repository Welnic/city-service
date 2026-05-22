import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${DIRECTUS_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 401 }
      );
    }

    const { data } = await response.json();

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
