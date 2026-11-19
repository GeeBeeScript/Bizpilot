import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyToken } from "@/lib/password";
import { otpVerification } from "@/actions/auth-actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
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

// const parsedCredentials = z.object({
//         email: z.email(),
//         password: z.string().min(8),
//       }).safeParse(credentials)

//       if (!parsedCredentials.success) {
//         return null
//       }

//       const { email, password } = parsedCredentials.data

//       const user = await prisma.user.findUnique({
//         where: {
//           email,
//         }
//       })

//       if (!user) {
//         return null
//       }

//       const isValid = await verifyToken(password, user?.password)

//       if (!isValid) {
//         return null
//       }
