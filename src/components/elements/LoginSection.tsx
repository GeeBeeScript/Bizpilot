"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BuildingComplex, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { googleSignIn } from "@/actions/auth-actions";

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v);

const LoginSection = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const error = !email ? "Enter your email address" : !emailOk(email) ? "That doesn't look like a valid email" : "";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    setLoading(true);
    // Replace with your "send sign-in code" request
    setTimeout(() => router.push(`/login/verifytoken?email=${encodeURIComponent(email)}`), 700);
  };

  const onGoogleAuth = async () => {
    notify.info("Redirecting to Google…")
    await googleSignIn()
  }

  return (
    <div className="w-fit max-sm:min-w-[70%] max-sm:max-w-[80%] sm:min-w-[40%] mx-auto py-5 px-3 rounded-lg border border-primary bg-background">
      <form className="w-full" onSubmit={onSubmit} noValidate>
        <h1 className="text-2xl sm:text-2xl text-[#444] dark:text-foreground">
          Sign In to Continue
        </h1>

        <div>
          <div className="flex flex-col space-y-4">
            <div className="my-2 flex flex-col space-y-3">
              <label htmlFor="email">Email</label>
              <div className={cn("flex items-center gap-2 px-2 border border-ring rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring/30", touched && error && "border-danger")}>
                <BuildingComplex className="text-[#222] dark:text-muted-foreground" aria-hidden />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  aria-invalid={touched && !!error}
                  aria-describedby="email-error"
                  placeholder="you@company.com"
                  className="w-full py-2 outline-none ring-0 border-0 bg-transparent font-normal"
                />
              </div>
              {touched && error && <p id="email-error" className="text-xs font-normal text-danger">{error}</p>}
            </div>

            <label className="flex items-center gap-2 font-semibold">
              <Checkbox defaultChecked />
              <span>Remember Me</span>
            </label>

            <div className="w-full">
              <Button type="submit" disabled={loading} className="bg-primary-blue hover:bg-primary-blue/80 w-full py-6 md:py-7 font-bold">
                {loading ? <><Loader2 className="animate-spin" /> Sending your code…</> : "Continue with Email"}
              </Button>
            </div>

            <div className="w-full flex gap-5 justify-between items-center">
              <Button type="button" className="flex-1 py-5 gap-3" onClick={onGoogleAuth}>
                <Image
                  src="/icons/google-icon.svg"
                  alt="Google icon"
                  width={20}
                  height={20}
                />
                <span>Google</span>
              </Button>
              <Button type="button" className="flex-1 py-5 gap-3" onClick={() => notify.info("Redirecting to Microsoft…")}>
                <Image
                  src="/icons/microsoft-svg.svg"
                  alt="Microsoft icons"
                  width={20}
                  height={20}
                />
                <span>Microsoft</span>
              </Button>
            </div>

            <div className="flex flex-wrap justify-between gap-2 text-sm font-normal">
              <span className="text-muted-foreground">New to BizPilot? <Link href="/signup" className="text-blue-500 underline underline-offset-2">Create an account</Link></span>
              <Link href="/forgot-password" className="text-muted-foreground underline-offset-2 hover:underline">Trouble signing in?</Link>
            </div>

            <div>
              <Separator />
            </div>

            <div className="w-full font-light">
              <div className="text-sm text-accent-foreground">
                By signing up to BizPilot, you agree to our{" "}
                <Link href="/terms" className="text-blue-500 underline underline-offset-2">
                  Terms & conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-500 underline underline-offset-2">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginSection;
