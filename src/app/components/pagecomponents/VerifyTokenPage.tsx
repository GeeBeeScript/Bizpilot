"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2, OctagonX } from "lucide-react";
import AuthNavigation from "../elements/AuthNav";
import { notify } from "@/lib/notify";
import { completeLogin, completeSignup, otpVerification } from "@/actions/auth-actions";

const CODE_TTL = 2 * 60;
const RESEND_AFTER = 30;
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

type Status = "idle" | "verifying" | "invalid" | "verified" | "expired";

/** One-time code verification (§10.3). Demo: "000000" is rejected; any other 6 digits verify. */
const VerifyTokenPageComp = ({ email, flow }: { email?: string; flow: "login" | "signup" }) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(CODE_TTL);
  const [sentAgo, setSentAgo] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((l) => Math.max(0, l - 1));
      setSentAgo((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const verify = async (value: string) => {
    setStatus("verifying");
    // Replace with your verify-code request
    // setTimeout(() => {
    //   if (value === "000000") return setStatus("invalid");
    //   setStatus("verified");
    //   setTimeout(() => router.push(flow === "signup" ? "/onboarding" : "/u/dashboard"), 900);
    // }, 900);
   if (flow === "login") {
    const loginRes = await completeLogin(value)
    console.log("login -", loginRes)
    if (!loginRes || "error" in loginRes) {
      return Object.values(loginRes).some((value) => typeof value === "string" && value.includes("expired") ? setStatus("expired") : setStatus("invalid"))
    }
    setStatus("verified")
    return 
   }
    const res = await completeSignup(Number(value))
    if (!res || "error" in res) {
      return Object.values(res).some((value) => typeof value === "string" && value.includes("expired") ) ? setStatus("expired") : setStatus("invalid")
    }
    setStatus("verified")
    console.log("signup -", res)
  };


  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(v);
    if (status === "invalid" || status === "expired") setStatus("idle");
    if (v.length === 6) verify(v);
  };

  const resend = () => {
    setLeft(CODE_TTL);
    setSentAgo(0);
    setCode("");
    setStatus("idle");
    notify.success("A new code is on its way", { description: email });
  };

  const expired = left === 0;

  return (
    <section className="w-screen h-screen font-geist-mono text-[#444] dark:text-foreground flex flex-col">
      <AuthNavigation />
      <div className="flex-1 w-full content-center">
       <div className="w-fit flex flex-col items-start px-4 py-6 gap-3 max-sm:min-w-[70%] max-sm:max-w-[90%] sm:min-w-[40%] mx-auto bg-gray-200/70 dark:bg-muted/60">
         <h1 className="font-bold text-xl">One-time Password</h1>
        <p className="text-sm w-[80%]">A token was sent to, <span className="font-semibold">{email || "your email"}</span></p>
        <form className="flex justify-between items-center w-[70%]" onSubmit={(e) => { e.preventDefault(); if (code.length === 6) verify(code); }}>
          <label htmlFor="otp" className="sr-only">6-digit code</label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={onChange}
            // disabled={expired || status === "verifying" || status === "verified"}
            aria-invalid={status === "invalid"}
            aria-describedby="otp-status"
            placeholder="e.g, 123456"
            className={`py-3 px-2 border-b w-full outline-none ring-0 bg-transparent tracking-[0.3em] ${status === "invalid" ? "border-danger" : "border-primary-blue"}`}
          />
        </form>
        <div id="otp-status" aria-live="polite" className="min-h-5 text-sm">
          {status === "verifying" && <span className="flex items-center gap-1.5"><Loader2 className="size-4 animate-spin" /> Verifying…</span>}
          {status === "invalid" && <span className="flex items-center gap-1.5 text-danger"><OctagonX className="size-4" /> That code didn&apos;t match. Check it and try again.</span>}
          {status === "verified" && <span className="flex items-center gap-1.5 text-success"><CircleCheck className="size-4" /> Verified — taking you {flow === "signup" ? "to setup" : "to your dashboard"}…</span>}
          {status === "expired" && <span className="flex items-center gap-1.5 text-danger"><OctagonX className="size-4" /> OTP is no longer valid</span>}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="text-sm">
              {expired ? <span className="text-danger">Code expired</span> : <><span>Expires in</span> <span className="tabular-nums">{fmt(left)}</span></>}
            </div>
            <div className="flex items-center gap-4 text-sm">
              {sentAgo < RESEND_AFTER && !expired ? (
                <span className="text-muted-foreground">Resend in {RESEND_AFTER - sentAgo}s</span>
              ) : (
                <button type="button" onClick={resend} className="text-primary-blue underline underline-offset-2 dark:text-info">Resend code</button>
              )}
              <Link href={flow === "signup" ? "/signup" : "/login"} className="underline underline-offset-2">Change email</Link>
            </div>
        </div>
       </div>
      </div>
    </section>
  );
};

export default VerifyTokenPageComp;
