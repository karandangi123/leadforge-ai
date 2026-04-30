import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createGoogleOAuthState, createGoogleOAuthUrl, hasGoogleOAuthCredentials } from "@leadforge/integrations";
import { hasDatabaseUrl } from "@leadforge/db";
import { DEFAULT_WORKSPACE_SLUG } from "@/lib/workspace";

const GOOGLE_OAUTH_COOKIE = "leadforge-google-oauth";

export async function GET(request: NextRequest) {
  if (!hasDatabaseUrl() || !hasGoogleOAuthCredentials()) {
    return NextResponse.redirect(new URL("/?view=setup&run=gmail-oauth-unavailable", request.url));
  }

  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/?view=setup";
  const state = createGoogleOAuthState();
  const redirectUri = getRedirectUri(request);
  const authUrl = createGoogleOAuthUrl({
    redirectUri,
    state,
  });

  const cookieStore = await cookies();
  cookieStore.set(
    GOOGLE_OAUTH_COOKIE,
    JSON.stringify({
      state,
      returnTo,
      workspaceSlug: DEFAULT_WORKSPACE_SLUG,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 10,
    },
  );

  return NextResponse.redirect(authUrl);
}

function getRedirectUri(request: NextRequest) {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI ?? new URL("/api/integrations/google/callback", request.url).toString();
}
