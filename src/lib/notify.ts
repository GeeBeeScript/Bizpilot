import { toast } from "@/app/components/ui/toast";

type NotifyOptions = {
  description?: string;
  /** Shows an Undo action when provided */
  onUndo?: () => void;
  timeout?: number;
};

function add(
  type: "success" | "info" | "warning" | "error",
  title: string,
  opts: NotifyOptions = {},
) {
  const id = toast.add({
    title,
    description: opts.description,
    type,
    timeout: opts.timeout ?? (opts.onUndo ? 6000 : 4000),
    actionProps: opts.onUndo
      ? {
          children: "Undo",
          onClick: () => {
            opts.onUndo?.();
            toast.close(id);
          },
        }
      : undefined,
  });
  return id;
}

/** Lightweight confirmations for completed actions (spec §5.7, §38) */
export const notify = {
  success: (title: string, opts?: NotifyOptions) => add("success", title, opts),
  info: (title: string, opts?: NotifyOptions) => add("info", title, opts),
  warning: (title: string, opts?: NotifyOptions) => add("warning", title, opts),
  error: (title: string, opts?: NotifyOptions) => add("error", title, opts),
};
