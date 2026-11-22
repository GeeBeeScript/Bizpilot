import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { otpVerification } from "@/server/auth/otp";

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            otp: z.string().min(5),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { otp } = parsedCredentials.data;
        const otpObj = await otpVerification(otp);
        if (!otpObj || "error" in otpObj) {
          return null;
        }
        const { email, id } = otpObj;
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          return null;
        }
        const deleteOtpObject = await prisma.otpObject.delete({
          where: { id: id }
        })
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isOnboardCompleted: user.isOnboardCompleted,
        };
      },
    }),
  ],

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
    async jwt({ token, user, trigger, session }) {
      if (user) token.id = user.id;
      const shouldLoad = trigger === "signIn" || trigger === "signUp" || trigger === "update"
      if (shouldLoad && token.id) {
        const requestedOrgId = trigger === "update" ? session?.activeOrgId : undefined
        
        const m = await prisma.membership.findFirst({
          where: {
            userId: token.id,
            status: "active",
            ...(requestedOrgId ? { orgId: requestedOrgId } : {} ),
          },
          orderBy: { createdAt: "asc" },
          select: { orgId: true, role: true, kind: true }
        })

        if (m) {
          token.activeOrgId = m.orgId,
          token.role = m.role,
          token.kind = m.kind
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.activeOrgId = token.activeOrgId
      session.user.role = token.role
      session.user.kind = token.kind
      return session;
    },
  },
});