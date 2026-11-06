"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
  Decorative "git tree" for the public site:
  1. Coloured routes that enter from the page edges and wrap around the hero copy.
  2. A blue trunk that starts at the hero window and is drawn downward as you scroll,
     with one coloured branch per feature section, each with a moving head dot.
  Purely visual (aria-hidden). Disabled below 800px; scroll parts hidden 800–1200px.
*/

type Pt = [number, number];
type Route = { colour: string; d: string; station?: Pt };
type Branch = { id: string; colour: string; connector: string; line: string; x: number; startY: number; featureY: number; grad: { x1: number; y1: number; x2: number; y2: number } };
type Geometry = {
  width: number;
  height: number;
  routes: Route[];
  trunk: { x: number; top: number; end: number };
  branches: Branch[];
  ring: (y: number) => string;
};

const BLUE = "#006bff";
const BRANCH_COLOURS = ["#00b978", "#d94d55", "#555b65", "#006bff", "#00a86b", "#cf4850"];

/** Turn a polyline into right-angle steps, alternating which axis moves first */
function toOrthogonal(points: Pt[], horizontalFirst: boolean): Pt[] {
  const out: Pt[] = [points[0]];
  let h = horizontalFirst;
  for (const [x, y] of points.slice(1)) {
    const [px, py] = out[out.length - 1];
    if (px !== x && py !== y) {
      out.push(h ? [x, py] : [px, y]);
      h = !h;
    }
    out.push([x, y]);
  }
  return out;
}

/** Polyline → SVG path with rounded corners */
function roundedPath(points: Pt[], radius = 22): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const [cx, cy] = points[i + 1];
    const lin = Math.hypot(bx - ax, by - ay);
    const lout = Math.hypot(cx - bx, cy - by);
    if (!lin || !lout) continue;
    const r = Math.min(radius, lin / 2, lout / 2);
    const p1x = bx - ((bx - ax) / lin) * r;
    const p1y = by - ((by - ay) / lin) * r;
    const p2x = bx + ((cx - bx) / lout) * r;
    const p2y = by + ((cy - by) / lout) * r;
    d += ` L ${p1x} ${p1y} Q ${bx} ${by} ${p2x} ${p2y}`;
  }
  const [lx, ly] = points[points.length - 1];
  return `${d} L ${lx} ${ly}`;
}

const isTransparent = (c: string) => /rgba\([^)]*,\s*0\)$/.test(c.replace(/\s/g, "")) || c === "transparent";

export const GitTree = () => {
  const root = useRef<HTMLDivElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const trunkHead = useRef<HTMLSpanElement>(null);
  const branchHeads = useRef<(HTMLSpanElement | null)[]>([]);
  const featureDots = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);

  const measure = useCallback(() => {
    const host = root.current?.parentElement;
    if (!host) return;
    const base = host.getBoundingClientRect();
    const width = host.clientWidth;
    const height = host.scrollHeight;
    const rel = (el: Element | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left - base.left, right: r.right - base.left, top: r.top - base.top, bottom: r.bottom - base.top, height: r.height };
    };
    const q = (sel: string) => host.querySelector(sel);
    const win = rel(q("[data-tree='window']"));
    const h1 = rel(q("[data-tree='h1']"));
    const lede = rel(q("[data-tree='lede']"));
    const cta = rel(q("[data-tree='cta']"));
    const micro = rel(q("[data-tree='micro']"));
    const heroBox = rel(q("[data-tree='hero-container']"));
    const logo = document.querySelector("[data-tree='logo']")?.getBoundingClientRect();
    const end = rel(q("[data-tree-end]"));
    if (!win || !h1 || !lede || !cta || !micro || !end) return;

    // Section backgrounds, so dots get a ring in the colour of whatever they sit on
    const pageBg = getComputedStyle(host).backgroundColor || "#fff";
    const bands = Array.from(host.querySelectorAll(":scope > section")).map((s) => {
      const r = rel(s)!;
      const bg = getComputedStyle(s).backgroundColor;
      return { top: r.top, bottom: r.bottom, colour: isTransparent(bg) ? pageBg : bg };
    });
    const ring = (y: number) => bands.find((b) => y >= b.top && y < b.bottom)?.colour ?? pageBg;

    // Trunk sits just left of the hero window
    const trunkX = Math.max(24, Math.min(win.left - 48, (heroBox?.left ?? win.left) - 54));
    const trunkTop = win.top + 56;
    const trunkEnd = Math.min(height - 120, end.top + end.height * 0.23);

    // Hero route guides
    const v = Math.max(trunkX + 64, Math.min(h1.left, lede.left, micro.left) - 32);
    const e = Math.min(width - 64, Math.max(h1.right, lede.right, micro.right) + 32);
    const H = Math.max(32, v - 150);
    const C = Math.min(width - 32, e + 150);
    const logoX = Math.max(20, (logo ? logo.left - base.left : H) - 20);
    const yTop = h1.top - 32;
    const yMid = (h1.bottom + lede.top) / 2;
    const yCta = (cta.top + cta.bottom) / 2;
    const yLow = micro.bottom + 28;
    const above = -base.top - window.scrollY - 32;

    const defs: { colour: string; pts: Pt[]; station?: boolean }[] = [
      { colour: "#006bff", pts: [[width + 32, yTop], [C, yTop], [C, yCta], [v, yCta]] },
      { colour: "#006bff", pts: [[v, yCta], [v, yLow], [trunkX + 148, yLow], [trunkX + 148, trunkTop], [trunkX, trunkTop]] },
      { colour: "#00b978", pts: [[-32, yMid], [H, yMid], [H, yCta], [v, yCta]], station: true },
      { colour: "#9b5de5", pts: [[logoX, above], [logoX, yTop], [v, yTop], [v, yMid]], station: true },
      { colour: "#555b65", pts: [[C + 40, above], [C + 40, yTop], [e, yTop], [e, yMid]], station: true },
      { colour: "#d94d55", pts: [[width + 32, yLow], [C, yLow], [C, yCta], [e, yCta]], station: true },
      { colour: "#f59e0b", pts: [[C + 90, above], [C + 90, yMid], [e, yMid]], station: true },
      { colour: "#ec4899", pts: [[e + 72, above], [e + 72, yCta], [e, yCta]], station: true },
      { colour: "#00a6a6", pts: [[-32, yLow], [H, yLow], [H, yCta], [v, yCta]], station: true },
    ];
    const routes: Route[] = defs.map((r, i) => ({
      colour: r.colour,
      d: roundedPath(toOrthogonal(r.pts, i % 2 === 0)),
      station: r.station ? r.pts[r.pts.length - 1] : undefined,
    }));

    // One branch per feature section, stepping 18px further left each time
    const features = Array.from(host.querySelectorAll("[data-tree-feature]")).map((el) => rel(el)!);
    const branches: Branch[] = features.map((f, i) => {
      const y = f.top + Math.min(176, f.height * 0.2);
      const x = trunkX - (i + 1) * 18;
      const bend = Math.min(12, Math.max(7, (trunkX - x) * 0.45));
      return {
        id: `mk-branch-${i}`,
        colour: BRANCH_COLOURS[i % BRANCH_COLOURS.length],
        connector: `M ${trunkX} ${y} H ${x + bend} Q ${x} ${y} ${x} ${y + bend} V ${y + 20}`,
        line: `M ${x} ${y + 20} L ${x} ${trunkEnd}`,
        x,
        startY: y + 20,
        featureY: y,
        grad: { x1: trunkX, y1: y, x2: x, y2: y + 20 },
      };
    });

    setGeo({ width, height, routes, trunk: { x: trunkX, top: trunkTop, end: trunkEnd }, branches, ring });
  }, []);

  // Reveal driven by scroll: everything above "scroll + trunkTop" is drawn
  const update = useCallback(() => {
    if (!geo) return;
    const reveal = Math.max(geo.trunk.top, window.scrollY + geo.trunk.top);
    const finished = reveal >= geo.trunk.end;
    clip.current?.setAttribute("height", String(Math.min(reveal, geo.trunk.end) + 2));
    root.current?.toggleAttribute("data-finished", finished);
    const headY = Math.min(reveal, geo.trunk.end);
    const ringColour = geo.ring(headY);
    if (trunkHead.current) {
      trunkHead.current.style.top = `${headY}px`;
      trunkHead.current.style.setProperty("--ring-bg", ringColour);
      trunkHead.current.classList.toggle("is-visible", !finished);
    }
    geo.branches.forEach((b, i) => {
      const head = branchHeads.current[i];
      if (head) {
        head.style.top = `${headY}px`;
        head.style.setProperty("--ring-bg", ringColour);
        head.classList.toggle("is-visible", !finished && reveal >= b.startY);
      }
      featureDots.current[i]?.classList.toggle("is-visible", b.featureY <= reveal + 1);
    });
  }, [geo]);

  useLayoutEffect(() => {
    measure();
    const host = root.current?.parentElement;
    if (!host) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(host);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    update();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [update]);

  return (
    <div ref={root} className="mk-tree" aria-hidden>
      {geo && (
        <>
          <svg width={geo.width} height={geo.height} viewBox={`0 0 ${geo.width} ${geo.height}`}>
            <defs>
              <clipPath id="mk-tree-reveal">
                <rect ref={clip} x={0} y={0} width={geo.width} height={geo.trunk.top} />
              </clipPath>
              {geo.branches.map((b) => (
                <linearGradient key={b.id} id={b.id} gradientUnits="userSpaceOnUse" {...b.grad}>
                  <stop offset="0%" stopColor={BLUE} />
                  <stop offset="100%" stopColor={b.colour} />
                </linearGradient>
              ))}
            </defs>
            {geo.routes.map((r, i) => <path key={i} d={r.d} stroke={r.colour} />)}
            <g clipPath="url(#mk-tree-reveal)" className="is-scroll-only">
              {geo.branches.map((b) => (
                <g key={b.id}>
                  <path d={b.connector} stroke={`url(#${b.id})`} />
                  <path d={b.line} stroke={b.colour} />
                </g>
              ))}
              <path d={`M ${geo.trunk.x} ${geo.trunk.top} V ${geo.trunk.end}`} stroke={BLUE} />
            </g>
          </svg>

          {/* Junction stations on the hero routes */}
          {geo.routes.map((r, i) =>
            r.station ? (
              <span key={i} className="mk-tree-dot" style={{ left: r.station[0], top: r.station[1], ["--c" as string]: r.colour, ["--ring-bg" as string]: geo.ring(r.station[1]) }} />
            ) : null,
          )}
          {/* Trunk start, feature joints and end markers */}
          <span className="mk-tree-dot" style={{ left: geo.trunk.x, top: geo.trunk.top, ["--ring-bg" as string]: geo.ring(geo.trunk.top) }} />
          <span className="mk-tree-dot mk-tree-end is-scroll-only" style={{ left: geo.trunk.x, top: geo.trunk.end, ["--ring-bg" as string]: geo.ring(geo.trunk.end) }} />
          {geo.branches.map((b, i) => (
            <span key={`f${b.id}`}>
              <span
                ref={(el) => { featureDots.current[i] = el; }}
                className="mk-tree-dot is-feature is-scroll-only"
                style={{ left: geo.trunk.x, top: b.featureY, ["--ring-bg" as string]: geo.ring(b.featureY) }}
              />
              <span className="mk-tree-dot mk-tree-end is-scroll-only" style={{ left: b.x, top: geo.trunk.end, ["--c" as string]: b.colour, ["--ring-bg" as string]: geo.ring(geo.trunk.end) }} />
              <span
                ref={(el) => { branchHeads.current[i] = el; }}
                className="mk-tree-dot mk-tree-head is-scroll-only"
                style={{ left: b.x, top: geo.trunk.top, ["--c" as string]: b.colour }}
              />
            </span>
          ))}
          <span ref={trunkHead} className="mk-tree-dot mk-tree-head is-visible is-scroll-only" style={{ left: geo.trunk.x, top: geo.trunk.top }} />
        </>
      )}
    </div>
  );
};
