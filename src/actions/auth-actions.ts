"use server";

import z, { string } from "zod";
import { auth, signIn, signOut, unstable_update } from "../../auth";
import prisma from "@/lib/prisma";
import { generateOTP, hashOTP, hashPassword, inviteTokens, verifyOTP, verifyToken } from "@/lib/password";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appPaths, authPaths, paths } from "@/app/paths";
import { randomInt } from "node:crypto";
import { onboardPayload } from "@/app/components/pagecomponents/OnboardingComp";
import { getInitials } from "@/lib/utilitymethods";
import { InvitationStatus, InvitationType, Kind, MembershipStatus, Prisma, Roles } from "@/app/generated/prisma/client";
import { addOTPandSetCookie, otpVerification } from "@/server/auth/otp";

const signupSchema = z.object({
  first: z.string().min(2),
  last: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

const otpSchema = z.object({
  otp: z.number().min(5),
});

const onboardPayloadSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().max(50),
  size: z.string().max(20),
  website: z.string().max(100).optional(),
  invitedMembers: z.array(
    z.object({
      email: z.email().max(100),
      role: z.enum(["admin", "manager", "member"]),
    })
  ).max(20).optional(),
  invitedClient: z.object({
    companyName: z.string().min(2).max(100),
    contactName: z.string().min(2).max(100),
    contactEmail: z.email().max(100),
    acctManager: z.string().max(100).min(2)
  }).optional()
})


export const googleSignIn = async () => {
  await signIn("google", {
    redirectTo: "/u/dashboard",
  });
};

export const startEmailPasswordSignup = async (formData: FormData) => {
  const parsed = signupSchema.safeParse({
    first: formData.get("first"),
    last: formData.get("last"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid signup data. Kindly verify your credentials" };
  }

  const { first, last, email: inputEmail, password } = parsed.data;
  const name = `${first} ${last}`
  const email = inputEmail.trim().toLowerCase();

  const isExistingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (isExistingUser) {
    return { error: "User already exists" };
  }

  const passwordHash = await hashPassword(password);
  const setOTP = await addOTPandSetCookie(email, name, passwordHash)
  if (!setOTP || "error" in setOTP) {
    return !setOTP.error && { error: "OTP was not sent" }
  }
  redirect(authPaths.signupVerifyToken());
};


export const completeSignup = async (otpValue: number) => {
  const parsedSchema = otpSchema.safeParse({
    otp: otpValue,
  });
  if (!parsedSchema.success) {
    return { error: "Invalid OTP" };
  }

  const { otp } = parsedSchema.data;
  const otpObj = await otpVerification(otp.toString());
  console.log('OtpObj--- ', otpObj)
  if (!otpObj || "error" in otpObj) {
    return otpObj;
  }
  const { name, email, password, id } = otpObj;

  try {
    const signupActions = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password,
          isOnboardCompleted: false,
        },
      });
      
      if (!user) {
        return { error: "Error creating user" };
      }
      // const deleteOTPObject = await tx.otpObject.delete({
      //   where: { id: id }
      // })
      })
    
  } catch (error) {
    console.log(error);
    return { error: "There was an error with your request" };
  }
  const login = await signIn("credentials", {
    otp: otp,
    redirect: false,
  })

  if (!login) {
    return { error: "Something went wrong!" }
  }

  redirect(paths.app.onboardingPage())
};

export const startEmailPasswordLogin = async (formData: FormData) => {
  const parsedCredentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  })

  if (!parsedCredentials.success) {
    return { error: "Invalid credentials" }
  }
  console.log("credentials parsed")
  const { email, password } = parsedCredentials.data
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return { error: "User does not exist" }
  }

  const verifyPassword = await verifyToken(password, user.password)
  console.log("password verified")
  if (!verifyPassword) {
    return { error: "Invalid credentials" }
  }
  const setOTP = await addOTPandSetCookie(email)
  console.log("otp set -", setOTP)
  if (!setOTP || "error" in setOTP) {
    return !setOTP.error && { error: "OTP was not sent" }
  }
  console.log("awaiting redirect")
  redirect(authPaths.loginVerifyToken())
}

export const completeLogin = async (otpValue: string) => {
  const parsedSchema = otpSchema.safeParse({
    otp: +otpValue,
  });
  if (!parsedSchema.success) {
    return { error: "Invalid OTP" };
  }
  const { otp } = parsedSchema.data

  const logIn = await signIn("credentials", {
    otp: otp,
    redirect: false
  })

  if (!logIn) {
    return { error: "Something went wrong!" }
  }

  if (!logIn.isOnboardCompleted) {
    redirect(paths.app.onboardingPage())
  }
  redirect(paths.product.productPage())
}

export async function checkCookies() {
  const cookieStore = await cookies();
  const authVal = await auth();

  const allCookies = cookieStore.getAll();

  console.log(allCookies.map((cookie) => cookie.name));
  console.log("Current auth.js session, ", authVal?.user);
}

export async function onboard(payload: onboardPayload) {
  const parsedPayload = onboardPayloadSchema.safeParse(payload)
  
  if (!parsedPayload.success) {
    return { error: "Kindly verify your input" }
  }

  const { name, type, size, website, invitedMembers, invitedClient } = parsedPayload.data

  const session = await auth()
  if (!session?.user) {
    return redirect(authPaths.loginPage())
  }
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id }
  })
  if (!user) {
    redirect(authPaths.signupPage())
  }
  if (user?.isOnboardCompleted) {
    redirect(paths.product.productPage())
  }

  let result

  try {
    result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
      data: {
        name: name,
        initials: getInitials(name),
        businessType: type,
        businessSize: size,
        website: website ?? "",
      }
    })
    const createMembership = await tx.membership.create({
      data: {
        user: {
          connect: { id: user.id }
        },
        org: {
          connect: { id: org.id }
        },
        role: Roles.owner,
        status: MembershipStatus.active,
        kind: Kind.internal,
      } 
    })
    if (invitedMembers?.length) {
      const sevenDaysFromCurrent = new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))
      const membersArr = invitedMembers.map((member) => ({ inviterId: user.id, orgId: org.id, email: member.email, kind: Kind.internal, roles: Roles.member, invitationType: InvitationType.team_member, ...inviteTokens(), status: InvitationStatus.pending, expiresAt: sevenDaysFromCurrent }))
      const membersArrTokensRemoved = membersArr.map(({ token, ...rest }) => rest)
      const memberInvite = await tx.invitation.createMany({
        data: membersArrTokensRemoved
      })
    }
    if (invitedClient) {
      const { acctManager, companyName, contactName, contactEmail } = invitedClient
      const sevenDaysFromCurrent = new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))
      const { token, tokenHash } = inviteTokens()
      const clientInvite = await tx.invitation.create({
        data: {
          inviter: {
            connect: { id: user.id }
          },
          org: {
            connect: { id: org.id }
          },
          email: contactEmail,
          manager: {
            connect: { id: user.id }
          },
          clientPayload: [companyName, contactName],
          kind: Kind.client,
          roles: Roles.manager,
          tokenHash,
          status: InvitationStatus.pending,
          expiresAt: sevenDaysFromCurrent,
        }
      })
    }
    const updateIsOnboarded = await tx.user.update({
      where: { id: user.id },
      data: {
        isOnboardCompleted: true,
      }
    })
    

    return { orgId: org.id, userId: user.id,  }
    })
  
  } catch(error) {
    console.log(error)
    return { error: "There was an error creating your Organization" }
  }

  await unstable_update({ user: { activeOrgId: result.orgId } })
  redirect(paths.product.productPage())
}

export const validateOnboardNavigation = async () => {
  const session = await auth()
  const verifyOnboardStatus = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
        isOnboardCompleted: true
      }
    })
  if (!verifyOnboardStatus) {
    return 
  }
  redirect(paths.product.productPage())
}

export const signOutHandler = async () => {
  console.log("Logged out")
  await signOut({ redirectTo: "/login" });
};
