import { API_URL } from "@/lib/constants";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decode } from "@/lib/helpers/encodeDecode";

export async function POST() {
  const cookieStore = await cookies();

  // Try to get refresh token from cookie and call backend logout
  try {
    const encodedRefreshToken = cookieStore.get("refreshToken")?.value;
    if (encodedRefreshToken) {
      const refreshToken = decode(encodedRefreshToken);

      // Call backend logout to revoke the refresh token
      await axios.post(`${API_URL}/auth/logout`, { refreshToken });
    }
  } catch (error) {
    // Don't care if backend logout fails, still clear cookies
    console.log("Backend logout failed (ignoring):", error);
  }

  // Clear cookies regardless of backend result
  cookieStore.delete("refreshToken");

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}
