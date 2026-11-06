import { cn } from "@/lib/utils";

const score = (v: string) =>
  [v.length >= 8, /[A-Z]/.test(v) && /[a-z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v) || v.length >= 14].filter(Boolean).length;

const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const tones = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"];

/** Subtle 4-segment password strength hint */
export const PasswordStrength = ({ value }: { value: string }) => {
  const s = score(value);
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-200", i < s ? tones[s] : "bg-muted")} />
        ))}
      </div>
      <span className="w-16 text-right text-xs font-normal text-muted-foreground">{labels[s]}</span>
    </div>
  );
};
