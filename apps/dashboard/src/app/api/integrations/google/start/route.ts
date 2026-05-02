import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createGoogleOAuthState, createGoogleOAuthUrl, hasGoogleOAuthCredentials } from "@leadforge/integrations";
import { hasDatabaseUrl } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";
import { hasGoogleOAuthConfig } from "@/lib/integration-connections";

const GOOGLE_OAUTH_COOKIE = "leadforge-google-oauth";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/?view=setup";
  const state = createGoogleOAuthState();
  const cookieStore = await cookies();

  if (!hasDatabaseUrl() || !hasGoogleOAuthCredentials() || !hasGoogleOAuthConfig()) {
    return NextResponse.redirect(new URL(withRun(returnTo, "gmail-oauth-unavailable"), request.url));
  }

  const workspace = await getActiveWorkspace();

  const redirectUri = getRedirectUri(request);
  const authUrl = createGoogleOAuthUrl({
    redirectUri,
    state,
  });

  cookieStore.set(
    GOOGLE_OAUTH_COOKIE,
    JSON.stringify({
      state,
      returnTo,
      workspaceSlug: workspace.slug,
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

function withRun(returnTo: string, run: string) {
  const url = new URL(returnTo, "http://leadforge.local");
  url.searchParams.set("run", run);
  return `${url.pathname}${url.search}${url.hash}`;
}

function getRedirectUri(request: NextRequest) {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI ?? new URL("/api/integrations/google/callback", request.url).toString();
}
