import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

/** BizPilot AI mark — gold spark on the logo gradient. `pulsing` while AI is working. */
export const AIMark = ({
  className,
  size = "sm",
  pulsing,
}: {
  className?: string;
  size?: "xs" | "sm" | "md";
  pulsing?: boolean;
}) => (
  <span
    className={cn(
      "relative grid shrink-0 place-items-center rounded-full bg-linear-to-br from-primary-blue to-deep-sapphire text-primary-gold shadow-[0_0_0_1px_rgb(201_164_92/0.25)]",
      size === "xs" && "size-5 [&_svg]:size-3",
      size === "sm" && "size-6 [&_svg]:size-3.5",
      size === "md" && "size-8 [&_svg]:size-4",
      className,
    )}
    role="img"
    aria-label="BizPilot AI"
  >
    {pulsing && <span className="absolute inset-0 animate-ping rounded-full bg-primary-gold/25 [animation-duration:2s]" aria-hidden />}
    <Sparkles className={cn(pulsing && "animate-ai-pulse")} aria-hidden />
  </span>
);

/** "AI-generated" label so generated text is never confused with record content */
export const AIGeneratedLabel = ({ className, children = "AI-generated" }: { className?: string; children?: React.ReactNode }) => (
  <span className={cn("inline-flex items-center gap-1 text-[0.7rem] font-medium text-ai", className)}>
    <Sparkles className="size-3" aria-hidden /> {children}
  </span>
);
