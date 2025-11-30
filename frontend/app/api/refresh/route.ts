import { API_URL } from "@/lib/constants";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  encode,
  decode,
  parseExpiryToSeconds,
} from "@/lib/helpers/encodeDecode";
import { serializeError } from "serialize-error";
import { getAPIErrMessage } from "@/helpers/errorHelpers";

import { RefreshTokenResponse } from "@/types/auth.types";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let refreshToken: string | undefined;

    // Try to get refresh token from body first
    try {
      const body = await req.json();
      refreshToken = body.refreshToken;
    } catch {
      // If body parsing fails, try cookies
    }

    // If not in body, try to get from cookies and decode
    if (!refreshToken) {
      const encodedRefreshToken = cookieStore.get("refreshToken")?.value;
      if (encodedRefreshToken) {
        try {
          refreshToken = decode(encodedRefreshToken);
        } catch (decodeError) {
          console.error("Failed to decode refresh token:", decodeError);
          return NextResponse.json(
            { message: "Invalid refresh token in cookie" },
            { status: 401 }
          );
        }
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token is required" },
        { status: 401 }
      );
    }

    const url = `${API_URL}/auth/refresh`;

    const response = await axios.post<RefreshTokenResponse>(url, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Set new refresh token cookie
    const refreshTokenMaxAge = parseExpiryToSeconds(
      process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    );
    cookieStore.set("refreshToken", encode(newRefreshToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: refreshTokenMaxAge,
      path: "/",
    });

    return NextResponse.json(
      {
        message: "Token refreshed successfully",
        data: {
          accessToken,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? error?.response?.status ?? 401;

    return NextResponse.json(
      {
        message: getAPIErrMessage(error, "Unable to refresh token"),
        error: serializeError(error),
      },
      { status }
    );
  }
}
