import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isOnboardCompleted: true, role: true },
        });

        if (!dbUser) return "/signup?status=from-signin";

        if (!dbUser.isOnboardCompleted) return "/onboarding";
        if (dbUser.role === "admin") return "/admin";
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
