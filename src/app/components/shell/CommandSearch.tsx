"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  CornerDownLeft,
  FileText,
  FolderOpen,
  History,
  ListClock,
  NotebookPen,
  Search,
  SearchX,
  UserGroup,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  recentSearches,
  searchAll,
  type SearchGroup,
  type SearchResult,
} from "@/lib/mock/search";
import { Kbd } from "@/app/components/generalUIcomp/Kbd";
import { Chip } from "@/app/components/generalUIcomp/Chips";

const groupIcon: Record<SearchGroup, LucideIcon> = {
  Clients: UserGroup,
  People: UserRound,
  Projects: FolderOpen,
  Tasks: ClipboardCheck,
  Documents: FileText,
  Notes: NotebookPen,
  Activity: ListClock,
};
const groupOrder: SearchGroup[] = [
  "Clients",
  "People",
  "Projects",
  "Tasks",
  "Documents",
  "Notes",
  "Activity",
];

const quickLinks: SearchResult[] = [
  {
    id: "q-ai",
    group: "Activity",
    title: "Ask BizPilot AI",
    parent: "Open the AI Assistant",
    href: "/u/ai",
  },
  {
    id: "q-cl",
    group: "Clients",
    title: "Go to Clients",
    parent: "Navigation",
    href: "/u/clients",
  },
  {
    id: "q-pr",
    group: "Projects",
    title: "Go to Projects",
    parent: "Navigation",
    href: "/u/projects",
  },
];

const Highlight = ({ text, query }: { text: string; query: string }) => {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-primary-gold/30 text-inherit">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
};

/** Global search command surface (§28). Ctrl/⌘+K anywhere. */
export const CommandSearch = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const results = useMemo(() => searchAll(query), [query]);
  const grouped = useMemo(
    () =>
      groupOrder
        .map((g) => ({ group: g, items: results.filter((r) => r.group === g) }))
        .filter((g) => g.items.length),
    [results],
  );
  const flat = query ? grouped.flatMap((g) => g.items) : quickLinks;

  const go = (r: SearchResult) => {
    onOpenChange(false);
    setQuery("");
    router.push(r.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active]);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const Row = ({ r, index }: { r: SearchResult; index: number }) => {
    const Icon = r.id === "q-ai" ? Brain : groupIcon[r.group];
    return (
      <button
        data-index={index}
        role="option"
        aria-selected={active === index}
        onMouseMove={() => setActive(index)}
        onClick={() => go(r)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors duration-100",
          active === index ? "bg-primary/10" : "hover:bg-muted/60",
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-heading">
            <Highlight text={r.title} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {r.parent}
            {r.meta && <span className="text-subtle"> · {r.meta}</span>}
          </span>
        </span>
        {r.status && (
          <Chip className="capitalize">{r.status.replace("-", " ")}</Chip>
        )}
        {active === index && (
          <ArrowRight className="size-3.5 text-primary" aria-hidden />
        )}
      </button>
    );
  };

  let idx = -1;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setQuery("");
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-midnight-navy/20 backdrop-blur-[2px] duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className="glass-strong elev-4 fixed top-[12vh] left-1/2 z-50 flex max-h-[70vh] w-[min(40rem,calc(100%-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-xl font-sans outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]"
          onKeyDown={onKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">
            Search
          </DialogPrimitive.Title>
          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4.5 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder="Search clients, projects, tasks, documents…"
              className="h-13 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-muted-foreground"
              role="combobox"
              aria-expanded
              aria-controls="search-results"
              aria-label="Search"
            />
            <Kbd className="max-sm:hidden">Esc</Kbd>
            <DialogPrimitive.Close
              className="rounded-md p-1 text-muted-foreground hover:bg-muted sm:hidden"
              aria-label="Close search"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div
            ref={listRef}
            id="search-results"
            role="listbox"
            className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-thin"
          >
            {!query && (
              <>
                <p className="px-2.5 pt-1 pb-1.5 text-[0.68rem] font-semibold tracking-wider text-subtle uppercase">
                  Recent searches
                </p>
                <div className="flex flex-wrap gap-1.5 px-2.5 pb-3">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-foreground hover:bg-accent"
                    >
                      <History
                        className="size-3 text-muted-foreground"
                        aria-hidden
                      />{" "}
                      {s}
                    </button>
                  ))}
                </div>
                <p className="px-2.5 pt-1 pb-1.5 text-[0.68rem] font-semibold tracking-wider text-subtle uppercase">
                  Quick links
                </p>
                {quickLinks.map((r, i) => (
                  <Row key={r.id} r={r} index={i} />
                ))}
              </>
            )}

            {query && grouped.length === 0 && (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <span className="mb-3 grid size-10 place-items-center rounded-lg bg-muted">
                  <SearchX
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                </span>
                <p className="text-sm text-heading">No results for “{query}”</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a client name, project, task key (BP-101) or file name.
                </p>
              </div>
            )}

            {query &&
              grouped.map((g) => (
                <div
                  key={g.group}
                  className="mb-1"
                  role="group"
                  aria-label={g.group}
                >
                  <p className="px-2.5 pt-2 pb-1 text-[0.68rem] font-semibold tracking-wider text-subtle uppercase">
                    {g.group}
                  </p>
                  {g.items.map((r) => {
                    idx += 1;
                    return <Row key={r.id} r={r} index={idx} />;
                  })}
                </div>
              ))}
          </div>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[0.7rem] text-muted-foreground max-sm:hidden">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>
                <CornerDownLeft className="size-3" />
              </Kbd>{" "}
              open
            </span>
            <span className="ml-auto">Searching The Cornucopia</span>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
