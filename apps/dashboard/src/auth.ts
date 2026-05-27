import "server-only";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@leadforge/db";
import authConfig from "./auth.config";
import { syncGoogleAccountToWorkspace } from "./lib/google-workspace";
import { syncWorkspaceGmailData } from "./lib/gmail-workspace-sync";
import { ensurePersonalWorkspaceForUser } from "./lib/workspace";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(getPrisma()),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.mfaEnabled = (user as any).twoFactorEnabled;
        token.mfaVerified = false;
      }

      if (trigger === "update" && session?.mfaVerified) {
        token.mfaVerified = true;
      }

      // Note: We don't store raw tokens in the JWT to prevent leakage to the browser.
      // Tokens are stored in the database during the signIn event.
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        (session.user as any).mfaEnabled = token.mfaEnabled;
        (session.user as any).mfaVerified = token.mfaVerified;
        
        const prisma = getPrisma();

        if (token.id === "demo-user") {
          (session.user as any).memberships = [{ workspaceId: "demo", slug: "demo", role: "OWNER" }];
          (session.user as any).mfaEnabled = false;
          (session.user as any).mfaVerified = true;
          return session;
        }

        const memberships = await prisma.membership.findMany({
          where: { userId: token.id as string },
          include: { workspace: true },
        });

        (session.user as any).memberships = memberships.map((m) => ({
          workspaceId: m.workspaceId,
          slug: m.workspace.slug,
          role: m.role,
        }));
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        const isLeadForgeAdmin = user.email === "leod.f0rge.ai@gmail.com";
        const prisma = getPrisma();
        
        // Update user name/image for LeadForgeAI account
        if (isLeadForgeAdmin) {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              name: "LeadForgeAI",
              image: "/leadforge-pfp.png",
            }
          });
        }

        const { membership, created } = await ensurePersonalWorkspaceForUser(
          {
            id: user.id,
            name: isLeadForgeAdmin ? "LeadForgeAI" : user.name,
            email: user.email,
          },
          prisma,
        );

        if (created) {
          await prisma.auditLog.create({
            data: {
              workspaceId: membership.workspaceId,
              userId: user.id,
              action: "WORKSPACE_AUTO_PROVISIONED",
              entityType: "WORKSPACE",
              entityId: membership.workspaceId,
              metadata: {
                source: "frictionless_auth_flow",
                slug: membership.workspace.slug,
                email: user.email,
              },
            },
          });
        }

        await syncGoogleAccountToWorkspace(prisma, {
          workspaceId: membership.workspaceId,
          userId: user.id,
          externalAccountId: account.providerAccountId,
          externalAccountEmail: user.email,
          tokens: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenType: account.token_type,
            scope: account.scope,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          },
          source: "frictionless_auth_flow",
        });

        try {
          await syncWorkspaceGmailData(prisma, {
            workspaceId: membership.workspaceId,
            userId: user.id,
            trigger: "frictionless_auth_flow",
          });
        } catch {
          // Keep sign-in non-blocking if Gmail metadata sync fails after a valid auth success.
        }
      }
    },
  },

  ...authConfig,

});
