import { Brain, ChartColumnIncreasing, FileSearch, FolderKanban, UserGroup, Workflow, type LucideIcon } from "lucide-react";

/** Icons for marketing capability entries (plain module so server and client components can share it) */
export const capabilityIcons: Record<string, LucideIcon> = { UserGroup, FolderKanban, Brain, FileSearch, Workflow, ChartColumnIncreasing };
