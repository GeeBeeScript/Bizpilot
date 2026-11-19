"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  Minimize,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { DocumentPage } from "@/types";

const Highlight = ({ text, q }: { text: string; q: string }) => {
  if (!q) return <>{text}</>;
  const parts = text.split(
    new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
  );
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded-sm bg-primary-gold/40 text-inherit">
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
};

/**
 * Document preview (§17.4): page navigation, zoom, in-document search, fullscreen, download.
 * Pages have ids `page-N` so AI citations can deep-link with `#page-N`.
 */
export const DocumentPreview = ({
  pages,
  name,
}: {
  pages: DocumentPage[];
  name: string;
}) => {
  const frame = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const matches = query
    ? pages.reduce(
        (n, p) =>
          n +
          `${p.heading} ${p.paragraphs.join(" ")}`
            .toLowerCase()
            .split(query.toLowerCase()).length -
          1,
        0,
      )
    : 0;

  const goTo = (n: number) => {
    const target = Math.min(pages.length, Math.max(1, n));
    setPage(target);
    scroller.current
      ?.querySelector(`#page-${target}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Track the page in view
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setPage(Number(visible.target.getAttribute("data-page")));
      },
      { root, threshold: [0.4, 0.7] },
    );
    root.querySelectorAll("[data-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages]);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else frame.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={frame}
      className="relative flex h-full min-h-[32rem] flex-col overflow-hidden rounded-lg bg-muted/50 ring-1 ring-border dark:bg-card/40"
    >
      {/* Floating toolbar */}
      <div className="glass-strong elev-2 absolute top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-lg p-1 text-xs">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        <span className="tabular px-1.5 whitespace-nowrap text-muted-foreground">
          Page <span className="font-medium text-heading">{page}</span> of{" "}
          {pages.length}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => goTo(page + 1)}
          disabled={page >= pages.length}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setZoom((z) => Math.max(60, z - 10))}
          aria-label="Zoom out"
        >
          <Minus />
        </Button>
        <span className="tabular w-10 text-center text-muted-foreground">
          {zoom}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setZoom((z) => Math.min(160, z + 10))}
          aria-label="Zoom in"
        >
          <Plus />
        </Button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        {searchOpen ? (
          <label className="flex h-7 items-center gap-1.5 rounded-md bg-card px-2 ring-1 ring-border">
            <Search className="size-3.5 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find in document"
              className="w-32 bg-transparent outline-none"
              aria-label="Find in document"
            />
            {query && (
              <span className="tabular text-muted-foreground">{matches}</span>
            )}
            <button
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
              aria-label="Close search"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          </label>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchOpen(true)}
            aria-label="Search within document"
          >
            <Search />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize /> : <Expand />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            notify.success("Download started", { description: name })
          }
          aria-label="Download"
        >
          <Download />
        </Button>
      </div>

      <div
        ref={scroller}
        className="dot-grid min-h-0 flex-1 overflow-auto px-4 pt-16 pb-8 scrollbar-thin"
      >
        <div
          className="mx-auto space-y-5 transition-[width] duration-200"
          style={{ width: `min(100%, ${(zoom / 100) * 44}rem)` }}
        >
          {pages.map((p) => (
            <article
              key={p.number}
              id={`page-${p.number}`}
              data-page={p.number}
              className={cn(
                "scroll-mt-16 rounded-sm bg-white px-[8%] py-[7%] text-[#1d2733] shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_2px_6px_-2px_rgb(0_0_0/0.16)] target:ring-2 target:ring-primary-gold",
              )}
              style={{
                fontSize: `${(zoom / 100) * 0.85}rem`,
                aspectRatio: "1 / 1.294",
              }}
              aria-label={`Page ${p.number}`}
            >
              <h2 className="mb-4 font-heading text-[1.25em] font-semibold">
                <Highlight text={p.heading} q={query} />
              </h2>
              {p.paragraphs.map((para, i) => (
                <p key={i} className="mb-3 leading-relaxed">
                  <Highlight text={para} q={query} />
                </p>
              ))}
              <p className="tabular mt-8 text-right text-[0.75em] text-[#7a8796]">
                {p.number}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
