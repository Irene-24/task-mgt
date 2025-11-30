import { API_URL } from "@/lib/constants";
import axios from "axios";

import { cookies } from "next/headers";

import { NextResponse } from "next/server";
import { encode, parseExpiryToSeconds } from "@/lib/helpers/encodeDecode";
import { serializeError } from "serialize-error";
import { getAPIErrMessage } from "@/helpers/errorHelpers";

import { FullAuthResponse } from "@/types/auth.types";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cookieStore = await cookies();

    if (password && email) {
      const url = `${API_URL}/auth/signin`;

      const response = await axios.post<FullAuthResponse>(url, {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Set refresh token cookie (httpOnly, encoded)

      const refreshTokenMaxAge = parseExpiryToSeconds(
        process.env.JWT_REFRESH_EXPIRES_IN || "7d"
      );
      cookieStore.set("refreshToken", encode(refreshToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: refreshTokenMaxAge,
        path: "/",
      });

      return NextResponse.json(
        {
          message: "Login successful",
          data: {
            userId: user.id,
            accessToken,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Missing/Invalid parameters email/password" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    const status = error?.status ?? error?.response?.status ?? 500;

    const message = getAPIErrMessage(error, "Unable to login");

    return NextResponse.json(
      {
        message,
        error: serializeError(error),
      },
      { status }
    );
  }
}
