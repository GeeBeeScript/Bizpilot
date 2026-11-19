"use server";

import z from "zod";
import { auth, signIn, signOut } from "../../auth";
import prisma from "@/lib/prisma";
import { generateOTP, hashOTP, hashPassword, verifyOTP, verifyToken } from "@/lib/password";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appPaths, authPaths, paths } from "@/app/paths";
import { randomInt } from "node:crypto";
import { onboardPayload } from "@/app/components/pagecomponents/OnboardingComp";
import { getInitials } from "@/lib/utilitymethods";
import { Prisma } from "@/app/generated/prisma/client";

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

export const otpVerification = async (otp: string) => {
  const cookieStore = await cookies();
  const otpHash = cookieStore.get("otp-hash")?.value;
  if (!otpHash) {
    return { error: "OTP was not sent" };
  }

  const otpIsValid = verifyOTP(otp, otpHash);
  if (!otpIsValid) {
    return { error: "Wrong code" };
  }

  try {
    const otpObj = await prisma.otpObject.findFirst({
      where: {
        otp: otpHash,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!otpObj) {
      return { error: "OTP is expired" };
    }
    return otpObj
  } catch (error) {
    console.log(error);
    return { error: "There was an error during verification" };
  }
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
    const user = await prisma.user.create({
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
    const session = await prisma.session.create({
      data: {
        sessionToken: randomInt(100000000, 999999999).toString(),
        userId: user.id,
        lastActive: new Date().toISOString(),
        expires: new Date(Date.now() + 60 * 60 * 24 * 10 * 1000),
      },
    });

    const deleteOTPObject = await prisma.otpObject.delete({
      where: { id: id }
    })
  } catch (error) {
    console.log(error);
    return { error: "There was an error with your request" };
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

  console.log("login successful!")

  if (!logIn.isOnboardCompleted) {
    redirect(paths.app.onboardingPage())
  }
  redirect(paths.product.productPage())
}

export const addOTPandSetCookie = async (email: string, name?: string, hashedPassword?: string) => {
  const otp = generateOTP()
  console.log("otp--- ", otp)
  const hashedOTP = hashOTP(otp)
  console.log("-- ", email)
  try {
    const addOTP = await prisma.otpObject.upsert({
    where: { email: email },
    update: {
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      attempts: {
        increment: 1
      },
    },
    create: {
      name: name ?? "",
      email: email,
      password: hashedPassword ?? "",
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000)
    },
  })
  console.log("addOTP -", addOTP)
  const cookieStore = await cookies()
  cookieStore.set("otp-hash", hashedOTP, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 2,
  })


  return addOTP
  } catch (error) {
    console.error("otpcookie ", error)
    return { error: error }
  }
}

export async function checkCookies() {
  const cookieStore = await cookies();
  const authVal = await auth();

  const allCookies = cookieStore.getAll();

  console.log(allCookies.map((cookie) => cookie.name));
  console.log("Current auth.js session, ", authVal?.user);
}

export async function onboard({ name, type, size, website, invitedMembers, invitedClient }: onboardPayload) {
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

  try {
    const org = await prisma.organization.create({
      data: {
        name: name,
        initials: getInitials(name),
        members: {
          connect: [
            { id: user.id }
          ]
        },
        owner: {
          connect: {id: user.id} 
        },
        businessType: type,
        businessSize: size,
        website: website ?? "",
        invitedMembers: invitedMembers as Prisma.InputJsonValue[],
        invitedClient: invitedClient ? invitedClient as Prisma.InputJsonValue : Prisma.JsonNull,
      }
    })
    console.log("ret")

    if (!org) {
      return { error: "There was an error in creating your organization" }
    }

    const updateIsOnboarded = await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnboardCompleted: true,
      }
    })

    return org
  } catch(error) {
    console.log(error)
    return { error: "There was an error creating your Organization" }
  }

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
  await signOut({ redirectTo: "/login" });
};
