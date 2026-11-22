import { verifyOTP } from "@/lib/password";
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
