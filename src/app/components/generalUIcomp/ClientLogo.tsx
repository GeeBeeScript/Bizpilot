import { cn } from "@/lib/utils";
import type { Client } from "@/types";

const tones: Record<Client["tone"], string> = {
  blue: "bg-primary-blue/14 text-primary-blue dark:text-info",
  gold: "bg-primary-gold/20 text-[#8a6a2c] dark:text-ai",
  emerald: "bg-success/14 text-success",
  sapphire: "bg-deep-sapphire/14 text-deep-sapphire dark:bg-info/15 dark:text-info",
  amber: "bg-warning/16 text-warning",
  crimson: "bg-danger/12 text-danger",
};

export const ClientLogo = ({
  client,
  size = "md",
  className,
}: {
  client: Pick<Client, "initials" | "tone" | "name">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) => (
  <span
    aria-hidden
    className={cn(
      "grid shrink-0 place-items-center rounded-md font-heading font-bold tracking-tight",
      tones[client.tone],
      size === "sm" && "size-6 text-[0.6rem]",
      size === "md" && "size-8 text-xs",
      size === "lg" && "size-14 text-lg rounded-lg",
      className,
    )}
  >
    {client.initials}
  </span>
);
