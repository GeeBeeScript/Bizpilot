"use client";

import { useState } from "react";
import Link from "next/link";
import { BuildingComplex, CircleCheck, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { PasswordStrength } from "./PasswordStrength";

const card = "w-fit max-sm:min-w-[70%] max-sm:max-w-[80%] sm:min-w-[40%] sm:max-w-md mx-auto py-5 px-3 rounded-lg border border-primary bg-background";
const field = "flex items-center gap-2 px-2 border border-ring rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring/30";
const input = "w-full py-2 outline-none ring-0 border-0 bg-transparent font-normal";

/** Password reset — request state (§10.4). Same card language as sign in / sign up. */
export const ForgotPasswordSection = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<"form" | "sending" | "sent">("form");
  const error = !/^\S+@\S+\.\S+$/.test(email) ? "Enter the email you signed up with" : "";

  if (state === "sent")
    return (
      <div className={card}>
        <div className="flex flex-col items-start gap-3">
          <MailCheck className="size-8 text-primary-blue dark:text-info" aria-hidden />
          <h1 className="text-2xl text-[#444] dark:text-foreground">Check your inbox</h1>
          <p className="text-sm font-normal text-muted-foreground">
            If an account exists for <span className="font-semibold text-foreground">{email}</span>, we&apos;ve sent a link to reset your password. It expires in 30 minutes.
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-normal">
            <button type="button" onClick={() => notify.success("Reset link resent", { description: email })} className="text-blue-500 underline underline-offset-2">Resend link</button>
            <Link href="/reset-password" className="text-muted-foreground underline underline-offset-2">Open reset page (demo)</Link>
            <Link href="/login" className="text-muted-foreground underline underline-offset-2">Back to sign in</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className={card}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (error) return;
          setState("sending");
          setTimeout(() => setState("sent"), 800);
        }}
        className="flex flex-col space-y-4"
      >
        <h1 className="text-2xl text-[#444] dark:text-foreground">Reset your password</h1>
        <p className="text-sm font-normal text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
        <div className="flex flex-col space-y-3">
          <label htmlFor="reset-email">Email</label>
          <div className={cn(field, touched && error && "border-danger")}>
            <BuildingComplex className="text-[#222] dark:text-muted-foreground" aria-hidden />
            <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && !!error} className={input} />
          </div>
          {touched && error && <p className="text-xs font-normal text-danger">{error}</p>}
        </div>
        <Button type="submit" disabled={state === "sending"} className="bg-primary-blue hover:bg-primary-blue/80 w-full py-6 font-bold">
          {state === "sending" ? <><Loader2 className="animate-spin" /> Sending…</> : "Send reset link"}
        </Button>
        <Link href="/login" className="text-sm font-normal text-muted-foreground underline-offset-2 hover:underline">Back to sign in</Link>
      </form>
    </div>
  );
};

/** Password reset — change state (§10.4) */
export const ResetPasswordSection = () => {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<"form" | "saving" | "done">("form");
  const errors = { pw: pw.length < 8 ? "Use at least 8 characters" : "", confirm: confirm !== pw ? "Passwords don't match" : "" };

  if (state === "done")
    return (
      <div className={card}>
        <div className="flex flex-col items-start gap-3">
          <CircleCheck className="size-8 text-success" aria-hidden />
          <h1 className="text-2xl text-[#444] dark:text-foreground">Password updated</h1>
          <p className="text-sm font-normal text-muted-foreground">You can now sign in with your new password. Other sessions were signed out for your security.</p>
          <Button render={<Link href="/login" />} className="bg-primary-blue hover:bg-primary-blue/80 w-full py-6 font-bold">Sign in</Button>
        </div>
      </div>
    );

  return (
    <div className={card}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (errors.pw || errors.confirm) return;
          setState("saving");
          setTimeout(() => setState("done"), 800);
        }}
        className="flex flex-col space-y-4"
      >
        <h1 className="text-2xl text-[#444] dark:text-foreground">Choose a new password</h1>
        <div className="flex flex-col space-y-3">
          <label htmlFor="new-pw">New password</label>
          <div className={cn(field, touched && errors.pw && "border-danger")}>
            <input id="new-pw" type={show ? "text" : "password"} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} aria-invalid={touched && !!errors.pw} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="text-muted-foreground hover:text-foreground">{show ? <Eye /> : <EyeOff />}</button>
          </div>
          {pw && <PasswordStrength value={pw} />}
          {touched && errors.pw && <p className="text-xs font-normal text-danger">{errors.pw}</p>}
        </div>
        <div className="flex flex-col space-y-3">
          <label htmlFor="confirm-pw">Confirm password</label>
          <div className={cn(field, touched && errors.confirm && "border-danger")}>
            <input id="confirm-pw" type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} aria-invalid={touched && !!errors.confirm} />
          </div>
          {touched && errors.confirm && <p className="text-xs font-normal text-danger">{errors.confirm}</p>}
        </div>
        <Button type="submit" disabled={state === "saving"} className="bg-primary-blue hover:bg-primary-blue/80 w-full py-6 font-bold">
          {state === "saving" ? <><Loader2 className="animate-spin" /> Updating…</> : "Update password"}
        </Button>
      </form>
    </div>
  );
};
