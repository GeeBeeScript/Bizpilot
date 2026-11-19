"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export type ProfileActionResult = { error?: string } | void;

/** Name capture for people who signed up with an OAuth provider (Google/Microsoft don't always share a usable name).
 *  `action` receives FormData with `first` and `last`; without one it continues to onboarding (UI preview). */
const OAuthProfileSection = ({
  email,
  provider = "google",
  defaultFirst = "",
  defaultLast = "",
  avatarUrl,
  action,
}: {
  email?: string;
  provider?: "google" | "microsoft";
  defaultFirst?: string;
  defaultLast?: string;
  avatarUrl?: string;
  action?: (formData: FormData) => Promise<ProfileActionResult>;
}) => {
  const router = useRouter();
  const [values, setValues] = useState({ first: defaultFirst, last: defaultLast });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const errors: Record<string, string> = {
    first: values.first.trim().length < 2 ? "Enter at least 2 characters" : "",
    last: values.last.trim().length < 2 ? "Enter at least 2 characters" : "",
  };
  const show = (k: string) => touched[k] && errors[k];
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const initials = `${values.first.trim()[0] ?? ""}${values.last.trim()[0] ?? ""}`.toUpperCase() || "?";
  const providerLabel = provider === "google" ? "Google" : "Microsoft";
  const providerIcon = provider === "google" ? "/icons/google-icon.svg" : "/icons/microsoft-svg.svg";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ first: true, last: true });
    if (errors.first || errors.last) return;
    setLoading(true);
    setFormError("");
    if (!action) {
      router.push("/onboarding");
      return;
    }
    const res = await action(new FormData(e.currentTarget));
    if (res?.error) {
      setFormError(res.error);
      setLoading(false);
    }
  };

  const field = "flex items-center gap-2 px-2 border border-ring rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring/30";
  const input = "w-full py-2 outline-none ring-0 border-0 bg-transparent font-normal";

  return (
    <div className="w-fit max-sm:min-w-[70%] max-sm:max-w-[85%] sm:min-w-[40%] sm:max-w-md mx-auto py-5 px-3 rounded-lg border border-primary bg-background">
      <form className="w-full" onSubmit={onSubmit} noValidate>
        <h1 className="mb-1 text-2xl text-[#444] dark:text-foreground">What should we call you?</h1>
        <p className="text-sm font-normal text-muted-foreground">
          This is how your name appears to your team and clients. You can change it later in Settings.
        </p>

        {/* Connected account */}
        <div className="my-5 flex items-center gap-3 rounded-md bg-muted/60 p-3">
          <span className="relative shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- provider avatars come from arbitrary hosts
              <img src={avatarUrl} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <span className="grid size-10 place-items-center rounded-full bg-primary-blue text-sm text-white" aria-hidden>
                {initials}
              </span>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-background ring-1 ring-border">
              <Image src={providerIcon} alt="" width={12} height={12} />
            </span>
          </span>
          <div className="min-w-0 text-sm">
            <p className="truncate">
              {values.first || values.last ? `${values.first} ${values.last}`.trim() : "Your name"}
            </p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {email ? <>Signed in with {providerLabel} as {email}</> : <>Signed in with {providerLabel}</>}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col space-y-3">
            <label htmlFor="first">First name</label>
            <div className={cn(field, show("first") && "border-danger")}>
              <input
                id="first"
                name="first"
                autoComplete="given-name"
                autoFocus
                value={values.first}
                onChange={set("first")}
                onBlur={blur("first")}
                aria-invalid={!!show("first")}
                aria-describedby={show("first") ? "first-error" : undefined}
                className={input}
              />
            </div>
            {show("first") && <p id="first-error" className="text-xs font-normal text-danger">{errors.first}</p>}
          </div>
          <div className="flex flex-col space-y-3">
            <label htmlFor="last">Last name</label>
            <div className={cn(field, show("last") && "border-danger")}>
              <input
                id="last"
                name="last"
                autoComplete="family-name"
                value={values.last}
                onChange={set("last")}
                onBlur={blur("last")}
                aria-invalid={!!show("last")}
                aria-describedby={show("last") ? "last-error" : undefined}
                className={input}
              />
            </div>
            {show("last") && <p id="last-error" className="text-xs font-normal text-danger">{errors.last}</p>}
          </div>
        </div>

        {formError && (
          <p role="alert" className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm font-normal text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-6 w-full bg-primary-blue py-6 font-bold hover:bg-primary-blue/80 md:py-7">
          {loading ? <><Loader2 className="animate-spin" /> Saving…</> : "Continue"}
        </Button>

        <p className="mt-4 text-sm font-normal text-muted-foreground">
          Not you?{" "}
          <Link href="/login" className="text-blue-500 underline underline-offset-2">
            Use a different account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default OAuthProfileSection;
