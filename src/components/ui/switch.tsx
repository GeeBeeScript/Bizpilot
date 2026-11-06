"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-input p-0.5 transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-primary data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="size-4 rounded-full bg-white shadow-sm transition-transform duration-150 data-checked:translate-x-4" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
