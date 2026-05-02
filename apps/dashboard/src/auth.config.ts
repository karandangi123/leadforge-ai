import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),

    {
      id: "demo",
      name: "Demo Mode",
      type: "credentials",
      credentials: {},
      async authorize() {
        return { 
          id: "demo-user", 
          name: "Demo Operator", 
          email: "demo@leadforge.ai",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
        };
      },
    }

  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
