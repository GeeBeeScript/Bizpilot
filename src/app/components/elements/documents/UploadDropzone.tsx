"use client";

import { useRef, useState } from "react";
import { CloudUpload } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg";
const MAX_MB = 50;

/** Drag-and-drop upload zone (§17.2, §31) with valid/invalid drag states */
export const UploadDropzone = ({
  onFiles,
  compact,
}: {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState<"idle" | "valid" | "invalid">("idle");

  const check = (items: DataTransferItemList) =>
    Array.from(items).every((i) => i.kind === "file") ? "valid" : "invalid";

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setDrag(check(e.dataTransfer.items));
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag("idle");
      }}
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setDrag("idle");
        if (files.length) onFiles(files);
      }}
      className={cn(
        "dot-grid relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed text-center transition-all duration-150",
        compact ? "px-4 py-6" : "px-6 py-10",
        drag === "idle" && "border-border bg-muted/30",
        drag === "valid" && "scale-[1.01] border-primary bg-primary/6",
        drag === "invalid" && "border-danger/60 bg-danger/5",
      )}
    >
      <span
        className={cn(
          "grid size-11 place-items-center rounded-full transition-colors",
          drag === "valid"
            ? "bg-primary text-primary-foreground"
            : "glass text-primary-blue dark:text-info",
        )}
      >
        <CloudUpload className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-medium text-heading">
          {drag === "valid"
            ? "Drop to upload"
            : drag === "invalid"
              ? "Only files can be uploaded"
              : "Drag files here"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          PDF, Word, Excel, PowerPoint, text or images · up to {MAX_MB} MB each
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => input.current?.click()}
      >
        Browse files
      </Button>
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
};
