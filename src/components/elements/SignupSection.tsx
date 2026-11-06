"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuildingComplex, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { PasswordStrength } from "./PasswordStrength";

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v);

const SignupSection = () => {
  const router = useRouter();
  const [values, setValues] = useState({ first: "", last: "", email: "", password: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams()


  const errors: Record<string, string> = {
    first: !values.first.trim() ? "Required" : "",
    last: !values.last.trim() ? "Required" : "",
    email: !values.email ? "Enter your work email" : !emailOk(values.email) ? "That doesn't look like a valid email" : "",
    password: values.password.length < 8 ? "Use at least 8 characters" : "",
    terms: !terms ? "Please accept the terms to continue" : "",
  };
  const show = (k: string) => touched[k] && errors[k];
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const params = searchParams.get("status")
  console.log("p ", params)
  const urlParamsStatus = params === "from-signin" ? true : params === null ? false : undefined

  useEffect(() => {
    if (urlParamsStatus === undefined) {
      router.replace("/error")
    }
  }, [urlParamsStatus])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ first: true, last: true, email: true, password: true, terms: true });
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    // Replace with your sign-up request
    setTimeout(() => router.push(`/signup/verifytoken?email=${encodeURIComponent(values.email)}`), 700);
  };

  const field = "flex items-center gap-2 px-2 border border-ring rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring/30";
  const input = "w-full py-2 outline-none ring-0 border-0 bg-transparent font-normal";

  return (
    <div className="w-fit max-sm:min-w-[70%] max-sm:max-w-[80%] sm:min-w-[40%] mx-auto py-5 px-3 rounded-lg border border-primary bg-background">
      <form className="w-full" onSubmit={onSubmit} noValidate>
        <h1 className="mb-4 text-2xl sm:text-2xl text-[#444] dark:text-foreground">
          {!urlParamsStatus && "Sign Up"}
          {urlParamsStatus === true && "You aren't a user yet, Sign Up" }
        </h1>
        <p className="my-2 font-semibold font-geist-sans">AI-powered Business Operations Organization</p>

        <div>
          <div className="flex flex-col space-y-4">
            <div className="my-2 grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-3">
                <label htmlFor="first">First name</label>
                <div className={cn(field, show("first") && "border-danger")}>
                  <input id="first" autoComplete="given-name" value={values.first} onChange={set("first")} onBlur={blur("first")} aria-invalid={!!show("first")} className={input} />
                </div>
                {show("first") && <p className="text-xs font-normal text-danger">{errors.first}</p>}
              </div>
              <div className="flex flex-col space-y-3">
                <label htmlFor="last">Last name</label>
                <div className={cn(field, show("last") && "border-danger")}>
                  <input id="last" autoComplete="family-name" value={values.last} onChange={set("last")} onBlur={blur("last")} aria-invalid={!!show("last")} className={input} />
                </div>
                {show("last") && <p className="text-xs font-normal text-danger">{errors.last}</p>}
              </div>
            </div>

            <div className="my-2 flex flex-col space-y-3">
              <label htmlFor="email">Email</label>
              <div className={cn(field, show("email") && "border-danger")}>
                <BuildingComplex className="text-[#222] dark:text-muted-foreground" aria-hidden />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={set("email")}
                  onBlur={blur("email")}
                  aria-invalid={!!show("email")}
                  className={input}
                  placeholder="Enter your work email"
                />
              </div>
              {show("email") && <p className="text-xs font-normal text-danger">{errors.email}</p>}
            </div>

            <div className="my-2 flex flex-col space-y-3">
              <label htmlFor="password">Password</label>
              <div className={cn(field, show("password") && "border-danger")}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={set("password")}
                  onBlur={blur("password")}
                  aria-invalid={!!show("password")}
                  className={input}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="text-muted-foreground hover:text-foreground">
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
              {values.password && <PasswordStrength value={values.password} />}
              {show("password") && <p className="text-xs font-normal text-danger">{errors.password}</p>}
            </div>

            <label className="flex items-center gap-2 font-semibold">
              <Checkbox defaultChecked />
              <span>Remember Me</span>
            </label>

            <div className="w-full">
              <Button type="submit" disabled={loading} className="bg-primary-blue hover:bg-primary-blue/80 w-full py-6 md:py-7 font-bold">
                {loading ? <><Loader2 className="animate-spin" /> Creating your account…</> : "Continue with Email"}
              </Button>
            </div>

            <div className="w-full flex gap-5 justify-between items-center">
              <Button type="button" className="flex-1 py-5 gap-3" onClick={() => notify.info("Redirecting to Google…")}>
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

            <p className="text-sm font-normal text-muted-foreground">
              Already have an account? <Link href="/login" className="text-blue-500 underline underline-offset-2">Sign in</Link>
            </p>

            <div>
              <Separator />
            </div>

            <div className="w-full font-light">
              <label className="flex items-start gap-2 text-sm text-accent-foreground">
                <Checkbox
                  checked={terms}
                  onCheckedChange={(v) => { setTerms(!!v); setTouched((t) => ({ ...t, terms: true })); }}
                  aria-invalid={!!show("terms")}
                  className="mt-0.5"
                />
                <span>
                  By signing up to BizPilot, you agree to our{" "}
                  <Link href="/terms" className="text-blue-500 underline underline-offset-2">
                    Terms & conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-500 underline underline-offset-2">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {show("terms") && <p className="mt-1 pl-6 text-xs font-normal text-danger">{errors.terms}</p>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignupSection;
