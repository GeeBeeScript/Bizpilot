"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  CircleX,
  Plus,
  Trash2,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/components/ui/native-select";
import { Field } from "@/app/components/generalUIcomp/SidePanel";
import {
  LoadingButton,
  useSubmit,
} from "@/app/components/generalUIcomp/LoadingButton";
import Logo from "@/app/components/elements/Logo";
import { cn } from "@/lib/utils";
import { onboard, validateOnboardNavigation } from "@/actions/auth-actions";


const STEPS = ["Organization", "Team", "First client", "Finish"] as const;
const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v);

/** Compact step indicator: 1. Organization → 2. Team → 3. First Client → 4. Finish (§11) */
const StepIndicator = ({ step }: { step: number }) => (
  <ol
    className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm"
    aria-label="Setup progress"
  >
    {STEPS.map((s, i) => (
      <li
        key={s}
        className="flex items-center gap-2"
        aria-current={i === step ? "step" : undefined}
      >
        <span
          className={cn(
            "tabular grid size-6 place-items-center rounded-full text-xs font-semibold transition-colors duration-200",
            i < step
              ? "bg-success text-white"
              : i === step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
          )}
        >
          {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
        </span>
        <span
          className={cn(
            i === step ? "font-medium text-heading" : "text-muted-foreground",
            "max-sm:hidden",
          )}
        >
          {s}
        </span>
        {i < STEPS.length - 1 && (
          <span className="mx-1 h-px w-6 bg-border" aria-hidden />
        )}
      </li>
    ))}
  </ol>
);

type Invite = { email: string; role: string };
export type onboardPayload = { name: string; type: string; size: string; website?: string; invitedMembers: { email: string; role: string }[]; invitedClient?: { companyName: string; contactName: string; contactEmail: string; acctManager: string; } }

const OnboardingComp = ({ firstName }: { firstName?: string }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [touched, setTouched] = useState(false);
  const [submissionErr, setSubmissionErr] = useState("")
  const { submitting, submit } = useSubmit();

  const [org, setOrg] = useState({
    name: "",
    type: "agency",
    website: "",
    size: "11-50",
  });
  const [invites, setInvites] = useState<Invite[]>([
    { email: "", role: "employee" },
  ]);
  const [client, setClient] = useState({
    company: "",
    contact: "",
    email: "",
    manager: "me",
  });

  const stepTwoSubmitHandler = async () => {
    const payload = {
      name: org.name,
      type: org.type,
      size: org.size,
      invitedMembers: invites[0].email ? invites : [],
      ...(client.company && { invitedClient: {
        companyName: client.company,
        contactName: client.contact,
        contactEmail: client.email,
        acctManager: client.manager
      } })
    }

    const res = await onboard(payload)
    if (!res || "error" in res) {
      setSubmissionErr(String(res.error))
      return
    }
    
    go(step + 1)
  }

  const onSubmitHandler = async () => {
    if (step === 2) {
     await stepTwoSubmitHandler()
     return
    }
    await validateOnboardNavigation()
  }

  const errors: Record<number, string[]> = {
    0: [!org.name.trim() ? "name" : ""].filter(Boolean),
    1: invites
      .filter((i) => i.email && !emailOk(i.email))
      .map((_, k) => `invite-${k}`),
    2: [
      client.company || client.contact || client.email
        ? !client.company.trim()
          ? "company"
          : client.email && !emailOk(client.email)
            ? "email"
            : ""
        : "",
    ].filter(Boolean),
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setTouched(false);
    setStep(to);
  };
  const next = () => {
    setTouched(true);
    if (errors[step]?.length) return;
    submit(() => go(step + 1));
  };

  const panel = (
    <motion.div
      key={step}
      custom={dir}
      initial={{ opacity: 0, x: dir * 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir * -24 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {step === 0 && (
        <div className="space-y-4">
          <header className="space-y-1">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary dark:text-info">
              <Building2 className="size-5" />
            </span>
            <h1 className="font-heading text-xl font-semibold text-heading">
              Create your organization
            </h1>
            <p className="text-sm text-muted-foreground">
              This is the business that runs its client work in BizPilot.
            </p>
          </header>
          <Field
            label="Company name *"
            htmlFor="o-name"
            error={
              touched && !org.name.trim()
                ? "Company name is required"
                : undefined
            }
          >
            <Input
              id="o-name"
              autoFocus
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              placeholder="The Cornucopia"
              className="h-10"
              aria-invalid={touched && !org.name.trim()}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Business type" htmlFor="o-type">
              <NativeSelect
                id="o-type"
                value={org.type}
                onChange={(e) => setOrg({ ...org, type: e.target.value })}
                className="h-10"
              >
                <NativeSelectOption value="agency">
                  Digital agency
                </NativeSelectOption>
                <NativeSelectOption value="software">
                  Software agency
                </NativeSelectOption>
                <NativeSelectOption value="consulting">
                  Consultancy
                </NativeSelectOption>
                <NativeSelectOption value="it">IT services</NativeSelectOption>
                <NativeSelectOption value="recruiting">
                  Recruiting firm
                </NativeSelectOption>
                <NativeSelectOption value="other">
                  Other professional services
                </NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Company size" htmlFor="o-size">
              <NativeSelect
                id="o-size"
                value={org.size}
                onChange={(e) => setOrg({ ...org, size: e.target.value })}
                className="h-10"
              >
                {["1–10", "11-50", "51–200", "200+"].map((v) => (
                  <NativeSelectOption key={v} value={v}>
                    {v}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Website" htmlFor="o-web">
            <Input
              id="o-web"
              value={org.website}
              onChange={(e) => setOrg({ ...org, website: e.target.value })}
              placeholder="yourcompany.com"
              className="h-10"
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <header className="space-y-1">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary dark:text-info">
              <UsersRound className="size-5" />
            </span>
            <h1 className="font-heading text-xl font-semibold text-heading">
              Invite your team
            </h1>
            <p className="text-sm text-muted-foreground">
              They&apos;ll get an email invitation. You can do this later from
              Team.
            </p>
          </header>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {invites.map((inv, i) => {
                const bad = touched && inv.email && !emailOk(inv.email);
                return (
                  <motion.li
                    key={i}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="flex-1">
                      <Input
                        value={inv.email}
                        onChange={(e) =>
                          setInvites((l) =>
                            l.map((x, j) =>
                              j === i ? { ...x, email: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="teammate@company.com"
                        type="email"
                        aria-label={`Invite ${i + 1} email`}
                        aria-invalid={!!bad}
                        className="h-10"
                      />
                      {bad && (
                        <p className="mt-1 text-xs text-danger">
                          Enter a valid email
                        </p>
                      )}
                    </div>
                    <NativeSelect
                      value={inv.role}
                      onChange={(e) =>
                        setInvites((l) =>
                          l.map((x, j) =>
                            j === i ? { ...x, role: e.target.value } : x,
                          ),
                        )
                      }
                      aria-label={`Invite ${i + 1} role`}
                      className="h-10 w-32"
                    >
                      <NativeSelectOption value="admin">
                        Admin
                      </NativeSelectOption>
                      <NativeSelectOption value="manager">
                        Manager
                      </NativeSelectOption>
                      <NativeSelectOption value="member">
                        Member
                      </NativeSelectOption>
                    </NativeSelect>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      disabled={invites.length === 1}
                      onClick={() =>
                        setInvites((l) => l.filter((_, j) => j !== i))
                      }
                      aria-label={`Remove invite ${i + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setInvites((l) => [...l, { email: "", role: "employee" }])
            }
          >
            <Plus /> Add another
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <header className="space-y-1">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary dark:text-info">
              <UserRoundPlus className="size-5" />
            </span>
            <h1 className="font-heading text-xl font-semibold text-heading">
              Add your first client
            </h1>
            <p className="text-sm text-muted-foreground">
              Projects, documents and AI context are organized around clients.
            </p>
          </header>
          <Field
            label="Company"
            htmlFor="c-co"
            error={
              touched && errors[2].includes("company")
                ? "Add the client's company name"
                : undefined
            }
          >
            <Input
              id="c-co"
              value={client.company}
              onChange={(e) =>
                setClient({ ...client, company: e.target.value })
              }
              placeholder="Globex Corporation"
              className="h-10"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact name" htmlFor="c-name">
              <Input
                id="c-name"
                value={client.contact}
                onChange={(e) =>
                  setClient({ ...client, contact: e.target.value })
                }
                className="h-10"
              />
            </Field>
            <Field
              label="Contact email"
              htmlFor="c-email"
              error={
                touched && errors[2].includes("email")
                  ? "Enter a valid email"
                  : undefined
              }
            >
              <Input
                id="c-email"
                type="email"
                value={client.email}
                onChange={(e) =>
                  setClient({ ...client, email: e.target.value })
                }
                className="h-10"
              />
            </Field>
          </div>
          <Field label="Account manager" htmlFor="c-am">
            <NativeSelect
              id="c-am"
              value={client.manager}
              onChange={(e) =>
                setClient({ ...client, manager: e.target.value })
              }
              className="h-10"
            >
              <NativeSelectOption value="me">Me</NativeSelectOption>
              {invites
                .filter((i) => emailOk(i.email))
                .map((i) => (
                  <NativeSelectOption key={i.email} value={i.email}>
                    {i.email}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 text-center">
          
          {submissionErr ? (
          <>
            <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-auto grid size-14 place-items-center rounded-full bg-crimson/15 text-red-400"
          >
            <CircleX className="size-7" />
          </motion.span>
          <div>
            <h1 className="font-heading text-xl font-semibold text-crimson">
              {submissionErr}
            </h1>
          </div>
            </>
          ) : (
            <>
              <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success"
          >
            <CircleCheck className="size-7" />
          </motion.span>
          <div>
            <h1 className="font-heading text-xl font-semibold text-heading">
              {org.name || "Your workspace"} is ready
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what we set up.
            </p>
          </div>
            </>
            
          )}
          <ul className="mx-auto max-w-sm space-y-2 text-left text-sm">
            {[
              { done: true, label: `Organization: ${org.name || "created"}` },
              {
                done: invites.some((i) => emailOk(i.email)),
                label: invites.some((i) => emailOk(i.email))
                  ? `${invites.filter((i) => emailOk(i.email)).length} invitation(s) sent`
                  : "Team invitations — skipped",
              },
              {
                done: !!client.company,
                label: client.company
                  ? `First client: ${client.company}`
                  : "First client — skipped",
              },
            ].map((r) => (
              <li
                key={r.label}
                className="flex items-center gap-2.5 rounded-md bg-muted/50 px-3 py-2"
              >
                {r.done ? (
                  <CircleCheck className="size-4 text-success" />
                ) : (
                  <span className="size-4 rounded-full border-2 border-dashed border-muted-foreground/40" />
                )}
                <span
                  className={
                    r.done ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {r.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="app-canvas flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <Logo className="text-xl" />
       
      </header>
      <main className="flex flex-1 flex-col items-center px-4 pt-6 pb-16">
        {firstName && step === 0 && (
          <p className="mb-2 text-sm text-muted-foreground">
            Welcome, {firstName} 👋
          </p>
        )}
        <StepIndicator step={step} />
        <div className="surface mt-6 w-full max-w-lg overflow-hidden rounded-xl p-6 elev-2">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {panel}
          </AnimatePresence>
          <div className="mt-6 flex items-center justify-between gap-2 border-t border-border/70 pt-4">
            {step > 0 && step < 3 ? (
              <Button variant="ghost" onClick={() => go(step - 1)}>
                <ArrowLeft /> Back
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {(step === 1 || step === 2) && (
                <Button variant="ghost" onClick={step < 2 ? next : onSubmitHandler}>
                  Skip
                </Button>
              )}
              {step < 3 ? (
                <LoadingButton loading={submitting} onClick={step < 2 ? next : onSubmitHandler}>
                  Continue <ArrowRight />
                </LoadingButton>
              ) : (
                <Button onClick={onSubmitHandler}>
                  Go to dashboard <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingComp;
