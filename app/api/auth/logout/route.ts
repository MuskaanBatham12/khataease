import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
