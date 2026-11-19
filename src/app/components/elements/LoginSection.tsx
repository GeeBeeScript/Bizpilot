"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BuildingComplex, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { googleSignIn, startEmailPasswordLogin } from "@/actions/auth-actions";
import { PasswordStrength } from "./PasswordStrength";

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v);

const LoginSection = () => {
  const router = useRouter();
  const [values, setValues] = useState({
    first: "",
    last: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors: Record<string, string> = {
    first: !values.first.trim() ? "Required" : "",
    last: !values.last.trim() ? "Required" : "",
    email: !values.email
      ? "Enter your work email"
      : !emailOk(values.email)
        ? "That doesn't look like a valid email"
        : "",
    password: values.password.length < 8 ? "Use at least 8 characters" : "",
    terms: !terms ? "Please accept the terms to continue" : "",
  };
  const show = (k: string) => touched[k] && errors[k];
  const set =
    (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const onSubmit = (e: React.FormEvent) => {
    // e.preventDefault();
    setTouched({
      first: true,
      last: true,
      email: true,
      password: true,
      terms: true,
    });
    // if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    // Replace with your sign-up request
    // setTimeout(
    //   () =>
    //     router.push(
    //       `/signup/verifytoken?email=${encodeURIComponent(values.email)}`,
    //     ),
    //   700,
    // );
  };

  const loginHandler = async (formData: FormData) => {
    console.log("loginhi")
    const login = await startEmailPasswordLogin(formData)
    console.log("login -", login)
    setLoading(prevState => !prevState)
  }

  const onGoogleAuth = async () => {
    notify.info("Redirecting to Google…");
    await googleSignIn();
  };

  const field =
    "flex items-center gap-2 px-2 border border-ring rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring/30";
  const input =
    "w-full py-2 outline-none ring-0 border-0 bg-transparent font-normal";

  return (
    <div className="w-fit max-sm:min-w-[70%] max-sm:max-w-[80%] sm:min-w-[40%] mx-auto py-5 px-3 rounded-lg border border-primary bg-background">
      <form className="w-full" action={loginHandler} onSubmit={onSubmit} noValidate>
        <h1 className="text-2xl sm:text-2xl text-[#444] dark:text-foreground">
          Sign In to Continue
        </h1>

        <div>
          <div className="flex flex-col space-y-4">
            <div className="my-2 flex flex-col space-y-3">
              <label htmlFor="email">Email</label>
              <div className={cn(field, show("email") && "border-danger")}>
                <BuildingComplex
                  className="text-[#222] dark:text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={set("email")}
                  onBlur={blur("email")}
                  aria-invalid={!!show("email")}
                  aria-describedby="email-error"
                  placeholder="you@company.com"
                  className="w-full py-2 outline-none ring-0 border-0 bg-transparent font-normal"
                />
              </div>
              {show("email") && (
                <p className="text-xs font-normal text-danger">
                  {errors.email}
                </p>
              )}
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
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
              {values.password && <PasswordStrength value={values.password} />}
              {show("password") && (
                <p className="text-xs font-normal text-danger">
                  {errors.password}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 font-semibold">
              <Checkbox defaultChecked />
              <span>Remember Me</span>
            </label>

            <div className="w-full">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-blue hover:bg-primary-blue/80 w-full py-6 md:py-7 font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Sending your code…
                  </>
                ) : (
                  "Continue with Email"
                )}
              </Button>
            </div>

            <div className="w-full flex gap-5 justify-between items-center">
              <Button
                type="button"
                className="flex-1 py-5 gap-3"
                onClick={onGoogleAuth}
              >
                <Image
                  src="/icons/google-icon.svg"
                  alt="Google icon"
                  width={20}
                  height={20}
                />
                <span>Google</span>
              </Button>
              <Button
                type="button"
                className="flex-1 py-5 gap-3"
                onClick={() => notify.info("Redirecting to Microsoft…")}
              >
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
              <span className="text-muted-foreground">
                New to BizPilot?{" "}
                <Link
                  href="/signup"
                  className="text-blue-500 underline underline-offset-2"
                >
                  Create an account
                </Link>
              </span>
              <Link
                href="/forgot-password"
                className="text-muted-foreground underline-offset-2 hover:underline"
              >
                Trouble signing in?
              </Link>
            </div>

            <div>
              <Separator />
            </div>

            <div className="w-full font-light">
              <div className="text-sm text-accent-foreground">
                By signing up to BizPilot, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-blue-500 underline underline-offset-2"
                >
                  Terms & conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-blue-500 underline underline-offset-2"
                >
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
