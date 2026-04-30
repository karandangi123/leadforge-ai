import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@leadforge/db";
import { exchangeGoogleOAuthCode, getGoogleAccountProfile } from "@leadforge/integrations";
import { getOrCreateDefaultWorkspace, GOOGLE_PROVIDER } from "@/lib/workspace";

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
    const workspace = await getOrCreateDefaultWorkspace();
    const existingConnection = await prisma.workspaceIntegrationConnection.findUnique({
      where: {
        workspaceId_provider: {
          workspaceId: workspace.id,
          provider: GOOGLE_PROVIDER,
        },
      },
    });

    if (!profile.email || !profile.verifiedEmail) {
      cookieStore.delete(GOOGLE_OAUTH_COOKIE);
      return NextResponse.redirect(new URL("/?view=setup&run=gmail-oauth-invalid", request.url));
    }

    await prisma.workspaceIntegrationConnection.upsert({
      where: {
        workspaceId_provider: {
          workspaceId: workspace.id,
          provider: GOOGLE_PROVIDER,
        },
      },
      update: {
        status: "CONNECTED",
        externalAccountId: profile.id,
        externalAccountEmail: profile.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? existingConnection?.refreshToken ?? null,
        tokenType: tokens.tokenType,
        scope: tokens.scope,
        expiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null,
        lastSyncedAt: new Date(),
        lastError: null,
      },
      create: {
        workspaceId: workspace.id,
        provider: GOOGLE_PROVIDER,
        status: "CONNECTED",
        externalAccountId: profile.id,
        externalAccountEmail: profile.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? existingConnection?.refreshToken ?? null,
        tokenType: tokens.tokenType,
        scope: tokens.scope,
        expiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null,
        lastSyncedAt: new Date(),
        lastError: null,
      },
    });

    cookieStore.delete(GOOGLE_OAUTH_COOKIE);
    return NextResponse.redirect(new URL(withRun(parsedState.returnTo, "gmail-oauth-connected"), request.url));
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
