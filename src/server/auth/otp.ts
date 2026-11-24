import { hashOTP, verifyOTP, generateOTP } from "@/lib/password";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import "server-only"

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
