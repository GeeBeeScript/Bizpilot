import bcrypt from "bcryptjs";
import { createHmac, randomInt, timingSafeEqual } from "crypto";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyToken(
  password: string,
  hashedPassword: string | null,
) {
  if (!hashedPassword) return null;
  return bcrypt.compare(password, hashedPassword);
}

export function generateOTP() {
  return randomInt(100000, 999999).toString();
}

export function hashOTP(otp: string) {
  return createHmac("sha256", process.env.OTP_SECRET!)
    .update(otp)
    .digest("hex");
}

export function verifyOTP(otp: string, storedHash: string) {
  const inputHash = Buffer.from(hashOTP(otp), "hex");
  const savedHash = Buffer.from(storedHash, "hex");

  return (
    inputHash.length === savedHash.length &&
    timingSafeEqual(inputHash, savedHash)
  );
}
