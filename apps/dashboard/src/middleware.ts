import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isMfaPage = req.nextUrl.pathname.startsWith("/verify-mfa");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    let callbackUrl = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.nextUrl)
    );
  }

  // MFA Enforcement
  const mfaEnabled = (req.auth?.user as any)?.mfaEnabled;
  const mfaVerified = (req.auth?.user as any)?.mfaVerified;

  if (mfaEnabled && !mfaVerified && !isMfaPage) {
    return NextResponse.redirect(new URL("/verify-mfa", req.nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
