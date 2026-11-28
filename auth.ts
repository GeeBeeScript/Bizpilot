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
        console.log("authorize ", user)
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
      const FIVE_MIN = 1000 * 60 * 5
      if (user) token.id = user.id;
      if (!token.id) token

      const requested: string | undefined = trigger === "update" ? session?.user?.activeOrgId : undefined
      const stale = Date.now() - (token.checkedAt ?? 0) > FIVE_MIN
      const shouldLoad = trigger === "signIn" || trigger === "signUp" || trigger === "update" || !token.activeOrgId || stale

      if (!shouldLoad) return token

      const select = { orgId: true, role: true, kind: true } as const
      const findActive = async (orgId: string) => prisma.membership.findFirst({ where: { userId: token.id!, orgId, status: "active" }, select })
      
      let membership = null
      if (requested) {
        membership = await findActive(requested)
        if (!membership) return token
      } else {
        if (token.activeOrgId) membership = await findActive(token.activeOrgId)
        if (!membership) membership = await prisma.membership.findFirst({
          where: { userId: token.id, status: "active" },
          orderBy: [{ kind: "asc"}, { createdAt: "asc" }],
          select
        })
      }

      if (membership) {
        token.activeOrgId = membership.orgId
        token.role = membership.role
        token.kind = membership.kind
      } else {
        delete token.activeOrgId;
        delete token.role;
        delete token.kind;
      }

      token.checkedAt = FIVE_MIN
      return token
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id
      session.user.activeOrgId = token.activeOrgId
      session.user.role = token.role
      session.user.kind = token.kind
      return session;
    },
  },
});