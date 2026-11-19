"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { buttonVariants } from "@/app/components/ui/button";
import {
  SegmentedList,
  SegmentedTrigger,
  Tabs,
} from "@/app/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Chip } from "@/app/components/generalUIcomp/Chips";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";
import type { PlanCell } from "@/lib/mock/marketing";

const Cell = ({ v }: { v: PlanCell }) =>
  v === true ? (
    <Check className="mx-auto size-4 text-success" aria-label="Included" />
  ) : v === false ? (
    <Minus className="mx-auto size-4 text-subtle" aria-label="Not included" />
  ) : (
    <span>{v}</span>
  );

/** Pricing (§9): billing toggle, plan cards with a clear selected state, comparison table, FAQ */
export const Pricing = ({
  plans,
  rows,
  faqs,
}: {
  plans: Plan[];
  rows: { feature: string; values: [PlanCell, PlanCell, PlanCell] }[];
  faqs: { q: string; a: string }[];
}) => {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [selected, setSelected] = useState<Plan["id"]>("growth");

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center md:px-6">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-heading md:text-5xl">
          Simple pricing that grows with you
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Every plan includes BizPilot AI, client management and projects. Start
          with a 14-day trial — no card required.
        </p>
        <div className="mt-6 flex justify-center">
          <Tabs
            value={cycle}
            onValueChange={(v) => setCycle(v as "monthly" | "annual")}
          >
            <SegmentedList aria-label="Billing cycle">
              <SegmentedTrigger value="monthly">Monthly</SegmentedTrigger>
              <SegmentedTrigger value="annual">
                Annual <span className="text-success">save 17%</span>
              </SegmentedTrigger>
            </SegmentedList>
          </Tabs>
        </div>
      </section>

      <section
        aria-label="Plans"
        className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3 md:px-6"
      >
        {plans.map((p) => {
          const isSel = p.id === selected;
          const popular = p.id === "growth";
          return (
            <article
              key={p.id}
              onClick={() => setSelected(p.id)}
              aria-current={isSel ? "true" : undefined}
              className={cn(
                "flex cursor-pointer flex-col gap-4 rounded-xl p-6 transition-all duration-200",
                popular ? "glass-ai" : "surface",
                isSel ? "ring-2 ring-primary elev-2" : "hover:lift",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-heading">
                  {p.name}
                </h2>
                {popular && <Chip tone="ai">Most popular</Chip>}
              </div>
              <p className="text-sm text-muted-foreground">{p.summary}</p>
              <p className="tabular">
                <span className="text-4xl font-semibold text-heading">
                  ${cycle === "monthly" ? p.monthly : p.annual}
                </span>
                <span className="text-sm text-muted-foreground">
                  {" "}
                  / month{cycle === "annual" && ", billed annually"}
                </span>
              </p>
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/signup?plan=${p.id}&cycle=${cycle}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  buttonVariants({
                    variant: isSel ? "default" : "outline",
                    size: "lg",
                  }),
                  "mt-auto h-10 w-full",
                )}
              >
                {p.id === "scale" ? "Start trial" : `Start with ${p.name}`}
              </Link>
            </article>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="mb-6 font-heading text-2xl font-semibold text-heading">
          Compare plans
        </h2>
        <div className="surface overflow-x-auto rounded-xl">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Feature
                </th>
                {plans.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      "px-4 py-3 text-center font-heading font-semibold text-heading",
                      p.id === selected && "bg-primary/6",
                    )}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.feature}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3">{r.feature}</td>
                  {r.values.map((v, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-4 py-3 text-center",
                        plans[i].id === selected && "bg-primary/6",
                      )}
                    >
                      <Cell v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-6">
        <h2 className="mb-6 font-heading text-2xl font-semibold text-heading">
          Frequently asked questions
        </h2>
        <Accordion className="surface rounded-xl px-5">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f${i}`}>
              <AccordionTrigger className="py-4 text-[0.95rem] hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
};
