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
    const body = await req.json();
    const { email, password, firstName, lastName, role } = body;
    const cookieStore = await cookies();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const url = `${API_URL}/auth/register`;

    const response = await axios.post<FullAuthResponse>(url, {
      email,
      password,
      firstName,
      lastName,
      role,
    });

    const { user, accessToken, refreshToken } = response.data;

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
        message: "Registration successful",
        body: {
          userId: user.id,
          accessToken,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    const status = error?.status ?? error?.response?.status ?? 500;

    return NextResponse.json(
      {
        message: getAPIErrMessage(error, "Unable to register"),
        error: serializeError(error),
      },
      { status }
    );
  }
}
