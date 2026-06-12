import { NextResponse } from "next/server";
import { configuredAdminIdentity, isConfiguredAdminCredential } from "@/lib/admin-access";
import { cookieName, createSessionToken, sessionMaxAgeSeconds } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const redirectBase = request.headers.get("origin") || request.url;
  const isSecureRequest = redirectBase.startsWith("https://");

  if (!isConfiguredAdminCredential(password)) {
    return NextResponse.redirect(new URL("/private-admin/login?error=1", redirectBase), 303);
  }

  const response = NextResponse.redirect(new URL("/private-admin", redirectBase), 303);
  response.cookies.set(cookieName, createSessionToken(configuredAdminIdentity), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest,
    maxAge: sessionMaxAgeSeconds,
    path: "/"
  });
  return response;
}
