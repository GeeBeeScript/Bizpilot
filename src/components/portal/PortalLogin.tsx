"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/elements/Logo";
import { ClientLogo } from "@/components/generalUIcomp/ClientLogo";
import { UserAvatar } from "@/components/generalUIcomp/UserAvatar";
import { cn } from "@/lib/utils";
import type { Client, Person } from "@/types";

/** Client portal sign in (§25.1) — same card language as the main sign-in, plus invitation context */
const PortalLogin = ({ inviter, client, provider, project, email: defaultEmail }: { inviter: Person; client: Pick<Client, "name" | "initials" | "tone">; provider: string; project: string; email: string }) => {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"password" | "link" | "link-sent">("password");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const emailErr = !/^\S+@\S+\.\S+$/.test(email) ? "Enter the email your invitation was sent to" : "";
  const pwErr = mode === "password" && !password ? "Enter your password" : "";
  const field = "flex items-center gap-2 px-2 border border-ring rounded-md focus-within:ring-2 focus-within:ring-ring/30";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailErr || pwErr) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "link") setMode("link-sent");
      else router.push("/portal");
    }, 700);
  };

  return (
    <section className="flex min-h-screen flex-col">
      <nav className="w-full border-b border-b-ring">
        <div className="mx-auto flex max-w-300 items-center justify-between px-4 py-2">
          <Logo className="text-2xl rounded-md px-3 py-2 bg-gray-100 dark:bg-muted" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" /> Client portal</span>
        </div>
      </nav>
      <div className="flex-1 content-center bg-amber/5 py-6 font-noto">
        <div className="mx-auto w-fit rounded-lg border border-primary bg-background px-3 py-5 max-sm:max-w-[85%] max-sm:min-w-[75%] sm:max-w-md sm:min-w-[40%]">
          {/* Invitation context */}
          <div className="mb-5 flex items-center gap-3 rounded-md bg-muted/60 p-3">
            <ClientLogo client={client} />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-heading">{client.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><UserAvatar person={inviter} className="size-4" /> {inviter.name} from {provider} invited you to <span className="font-medium text-foreground">{project}</span></p>
            </div>
          </div>

          {mode === "link-sent" ? (
            <div className="space-y-3">
              <MailCheck className="size-8 text-primary-blue dark:text-info" />
              <h1 className="text-2xl font-bold text-[#444] dark:text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">We sent a secure sign-in link to <span className="font-semibold text-foreground">{email}</span>. It expires in 15 minutes.</p>
              <button onClick={() => setMode("password")} className="text-sm text-blue-500 underline underline-offset-2">Use a password instead</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col space-y-4">
              <h1 className="text-2xl font-bold text-[#444] dark:text-foreground">Sign in to your client portal</h1>
              <div className="flex flex-col space-y-2">
                <label htmlFor="p-email" className="font-bold">Email</label>
                <div className={cn(field, touched && emailErr && "border-danger")}>
                  <input id="p-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-0 bg-transparent py-2 outline-none" />
                </div>
                {touched && emailErr && <p className="text-xs text-danger">{emailErr}</p>}
              </div>
              {mode === "password" && (
                <div className="flex flex-col space-y-2">
                  <label htmlFor="p-pw" className="font-bold">Password</label>
                  <div className={cn(field, touched && pwErr && "border-danger")}>
                    <input id="p-pw" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-0 bg-transparent py-2 outline-none" />
                    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="text-muted-foreground">{show ? <Eye /> : <EyeOff />}</button>
                  </div>
                  {touched && pwErr && <p className="text-xs text-danger">{pwErr}</p>}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-primary-blue py-6 font-bold hover:bg-primary-blue/80">
                {loading ? <><Loader2 className="animate-spin" /> Signing in…</> : mode === "link" ? "Email me a sign-in link" : "Sign in"}
              </Button>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <button type="button" onClick={() => setMode(mode === "password" ? "link" : "password")} className="text-blue-500 underline underline-offset-2">
                  {mode === "password" ? "Email me a sign-in link instead" : "Use a password instead"}
                </button>
                <Link href="/forgot-password" className="text-muted-foreground hover:underline">Forgot password?</Link>
              </div>
              <p className="text-xs text-muted-foreground">You&apos;ll only see what {provider} shares with {client.name}.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default PortalLogin;
