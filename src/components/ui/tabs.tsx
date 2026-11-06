"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

/** Underline tab list with an animated indicator */
function TabsList({ className, children, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative z-0 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-border",
        className
      )}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator className="absolute bottom-0 left-0 -z-10 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-full bg-primary transition-all duration-200 ease-out" />
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 rounded-t-md data-active:font-medium data-active:text-heading [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none data-[hidden]:hidden animate-in fade-in-0 duration-200", className)}
      {...props}
    />
  )
}

/** Segmented control variant — used for view switchers */
function SegmentedList({ className, children, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="segmented-list"
      className={cn(
        "relative z-0 inline-flex items-center gap-0.5 rounded-lg bg-muted/80 p-0.5",
        className
      )}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator className="absolute top-0.5 left-0 -z-10 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) rounded-md bg-card shadow-sm ring-1 ring-foreground/5 transition-all duration-200 ease-out" />
    </TabsPrimitive.List>
  )
}

function SegmentedTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="segmented-trigger"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-active:text-heading [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, SegmentedList, SegmentedTrigger }
