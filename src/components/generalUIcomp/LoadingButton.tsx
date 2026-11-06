"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoadingButtonProps = React.ComponentProps<typeof Button> & { loading?: boolean };

/** Button with a loading state that preserves its width (§5.1) */
export const LoadingButton = ({ loading, children, className, disabled, ...props }: LoadingButtonProps) => (
  <Button {...props} disabled={disabled || loading} aria-busy={loading} className={cn("relative", className)}>
    <span className={cn("inline-flex items-center gap-1.5", loading && "invisible")}>{children}</span>
    {loading && <Loader2 className="absolute animate-spin" aria-label="Saving" />}
  </Button>
);

/** Placeholder async submit until the backend is wired. Replace `action` with your API call. */
export function useSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const submit = useCallback(async (action?: () => Promise<void> | void, delay = 700) => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, delay));
      await action?.();
    } finally {
      setSubmitting(false);
    }
  }, []);
  return { submitting, submit };
}
