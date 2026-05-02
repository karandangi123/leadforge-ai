import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@leadforge/db";
import { exchangeGoogleOAuthCode, getGoogleAccountProfile } from "@leadforge/integrations";
import { auth } from "@/auth";
import { syncWorkspaceGmailData } from "@/lib/gmail-workspace-sync";
import { syncGoogleAccountToWorkspace } from "@/lib/google-workspace";
import { getActiveWorkspace } from "@/lib/workspace";

const GOOGLE_OAUTH_COOKIE = "leadforge-google-oauth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(GOOGLE_OAUTH_COOKIE)?.value;

  if (!code || !state || !rawCookie) {
    return NextResponse.redirect(new URL("/?view=setup&run=gmail-oauth-invalid", request.url));
  }

  const parsedState = readStateCookie(rawCookie);
  if (!parsedState || parsedState.state !== state) {
    cookieStore.delete(GOOGLE_OAUTH_COOKIE);
    return NextResponse.redirect(new URL("/?view=setup&run=gmail-oauth-invalid", request.url));
  }

  try {
    const redirectUri = getRedirectUri(request);
    const tokens = await exchangeGoogleOAuthCode({
      code,
      redirectUri,
    });
    const profile = await getGoogleAccountProfile({
      redirectUri,
      tokens,
    });

    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();
    const session = await auth();

    if (!profile.email || !profile.verifiedEmail) {
      cookieStore.delete(GOOGLE_OAUTH_COOKIE);
      return NextResponse.redirect(new URL("/?view=setup&run=gmail-oauth-invalid", request.url));
    }

    await syncGoogleAccountToWorkspace(prisma, {
      workspaceId: workspace.id,
      userId: session?.user?.id ?? null,
      externalAccountId: profile.id,
      externalAccountEmail: profile.email,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        scope: tokens.scope,
        expiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null,
      },
      source: "google_reauth_flow",
    });

    let run = "gmail-oauth-connected";

    try {
      await syncWorkspaceGmailData(prisma, {
        workspaceId: workspace.id,
        userId: session?.user?.id ?? null,
        trigger: "google_reauth_flow",
      });
    } catch {
      run = "gmail-sync-partial";
    }

    cookieStore.delete(GOOGLE_OAUTH_COOKIE);
    return NextResponse.redirect(new URL(withRun(parsedState.returnTo, run), request.url));
  } catch {
    cookieStore.delete(GOOGLE_OAUTH_COOKIE);
    return NextResponse.redirect(new URL("/?view=setup&run=gmail-oauth-failed", request.url));
  }
}

function readStateCookie(value: string): { state: string; returnTo: string; workspaceSlug: string } | null {
  try {
    return JSON.parse(value) as { state: string; returnTo: string; workspaceSlug: string };
  } catch {
    return null;
  }
}

function withRun(returnTo: string, run: string) {
  const url = new URL(returnTo, "http://leadforge.local");
  url.searchParams.set("run", run);
  return `${url.pathname}${url.search}${url.hash}`;
}

function getRedirectUri(request: NextRequest) {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI ?? new URL("/api/integrations/google/callback", request.url).toString();
}
