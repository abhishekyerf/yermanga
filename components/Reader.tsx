"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = { pages: string[]; prevHref: string | null; nextHref: string | null; backHref: string; label: string; storageKey: string };
const PRELOAD = 6;

export default function Reader({ pages, prevHref, nextHref, backHref, label, storageKey }: Props) {
  const [mode, setMode] = useState<"book" | "scroll" | null>(null);
  const [page, setPage] = useState(0);
  const [ready, setReady] = useState(false);
  const wrap = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null), flip = useRef<any>(null), imgs = useRef<HTMLImageElement[]>([]);
  const r = useRouter(); const total = pages.length; const posKey = `ym-pos-${storageKey}`;

  useEffect(() => { setMode(localStorage.getItem("ym-mode") === "scroll" ? "scroll" : "book"); }, []);
  const loadAround = useCallback((p: number) => { for (let k = Math.max(0, p - 2); k <= Math.min(total - 1, p + PRELOAD); k++) { const im = imgs.current[k]; if (im && !im.src) im.src = pages[k]; } }, [pages, total]);

  // Book mode: StPageFlip, built imperatively because PageFlip.destroy() removes its own root node.
  useEffect(() => {
    if (mode !== "book" || !host.current || !total) return;
    let pf: any, cancelled = false; setReady(false);
    const root = document.createElement("div"); host.current.appendChild(root);
    imgs.current = pages.map((_, k) => { const d = document.createElement("div"); d.className = "book-page"; const im = document.createElement("img"); im.alt = `Page ${k + 1}`; im.decoding = "async"; d.appendChild(im); root.appendChild(d); return im; });
    const start = Math.min(Number(localStorage.getItem(posKey)) || 0, total - 1);
    loadAround(start);
    import("page-flip").then(({ PageFlip }) => {
      if (cancelled) return;
      pf = new PageFlip(root, { width: 560, height: 820, size: "stretch", minWidth: 260, maxWidth: 900, minHeight: 380, maxHeight: 1320, maxShadowOpacity: 0.45, showCover: false, usePortrait: true, mobileScrollSupport: false, flippingTime: 650, startPage: start, autoSize: true, swipeDistance: 25 });
      pf.loadFromHTML(Array.from(root.children));
      pf.on("flip", (e: any) => { setPage(e.data); loadAround(e.data); localStorage.setItem(posKey, String(e.data)); });
      flip.current = pf; setPage(start); setReady(true);
    });
    return () => { cancelled = true; flip.current = null; try { pf?.destroy(); } catch {} root.remove(); };
  }, [mode, pages]);

  // Scroll mode: remember last page via IntersectionObserver.
  useEffect(() => {
    if (mode !== "scroll") return;
    const els = Array.from(document.querySelectorAll<HTMLImageElement>("[data-scroll-page]"));
    const start = Number(localStorage.getItem(posKey)) || 0;
    if (start > 0) els[Math.min(start, els.length - 1)]?.scrollIntoView();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const k = Number((e.target as HTMLElement).dataset.scrollPage); setPage(k); localStorage.setItem(posKey, String(k)); } }), { rootMargin: "-45% 0px -45% 0px" });
    els.forEach((el) => io.observe(el)); return () => io.disconnect();
  }, [mode, pages]);

  const next = useCallback(() => { const pf = flip.current; if (mode === "book" && pf) { const last = pf.getCurrentPageIndex() + (pf.getOrientation() === "landscape" ? 2 : 1) >= total; if (!last) return pf.flipNext(); } if (nextHref) r.push(nextHref); }, [mode, total, nextHref, r]);
  const prev = useCallback(() => { const pf = flip.current; if (mode === "book" && pf && pf.getCurrentPageIndex() > 0) return pf.flipPrev(); if (prevHref) r.push(prevHref); }, [mode, prevHref, r]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (mode === "book") { if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); } else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); } }
      else if (e.key === "ArrowRight" && nextHref) r.push(nextHref); else if (e.key === "ArrowLeft" && prevHref) r.push(prevHref);
      if (e.key === "f") fullscreen();
    };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, [mode, next, prev, nextHref, prevHref, r]);

  const fullscreen = () => { if (document.fullscreenElement) document.exitFullscreen(); else wrap.current?.requestFullscreen?.().catch(() => {}); };
  const sw = (m: "book" | "scroll") => { localStorage.setItem("ym-mode", m); setMode(m); };
  const pct = total ? Math.round(((page + 1) / total) * 100) : 0;

  if (!total) return <div className="py-24 text-center"><p className="text-lg font-semibold">This chapter has no pages.</p><Link href={backHref} className="mt-3 inline-block text-sm text-blue-500">Back to series</Link></div>;

  const ChapterNav = () => (<div className="flex items-center justify-between gap-3 py-5">
    {prevHref ? <Link href={prevHref} className="rounded-full bg-black/5 px-5 py-2 text-[14px] font-medium dark:bg-white/10">← Previous</Link> : <span />}
    <Link href={backHref} className="text-[13px] text-zinc-500 hover:underline">All chapters</Link>
    {nextHref ? <Link href={nextHref} className="rounded-full bg-black px-5 py-2 text-[14px] font-medium text-white dark:bg-white dark:text-black">Next →</Link> : <span />}
  </div>);

  return (
    <div ref={wrap} className="-mx-5 bg-zinc-50 px-5 [&:fullscreen]:overflow-auto [&:fullscreen]:bg-zinc-900 dark:bg-black">
      <div className="sticky top-14 z-30 -mx-5 border-b border-black/5 bg-white/70 px-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 py-2.5 text-[13px]">
          <Link href={backHref} className="truncate font-semibold">{label}</Link>
          <span className="ml-auto shrink-0 tabular-nums text-zinc-500" data-testid="counter">{page + 1} / {total}</span>
          <div className="flex shrink-0 rounded-full bg-black/5 p-0.5 dark:bg-white/10">{(["book", "scroll"] as const).map((m) => <button key={m} onClick={() => sw(m)} className={`rounded-full px-3 py-1 transition ${mode === m ? "bg-white shadow-sm dark:bg-zinc-700" : "text-zinc-500"}`}>{m === "book" ? "Book" : "Scroll"}</button>)}</div>
          <button onClick={fullscreen} aria-label="Fullscreen" className="hidden shrink-0 rounded-full px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 sm:block">⤢</button>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-transparent"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="mx-auto max-w-5xl">
        {mode === "book" && (<div className="relative py-6">
          {!ready && <div className="shimmer mx-auto aspect-[2/3] max-h-[80vh] rounded-lg" />}
          <div ref={host} data-testid="book" className={`mx-auto select-none transition-opacity duration-500 ${ready ? "opacity-100" : "h-0 opacity-0"}`} />
          {ready && <><button aria-label="Previous page" onClick={prev} className="absolute inset-y-6 left-0 z-10 w-[12%] cursor-w-resize" /><button aria-label="Next page" onClick={next} className="absolute inset-y-6 right-0 z-10 w-[12%] cursor-e-resize" /></>}
          <p className="mt-4 text-center text-[12px] text-zinc-500">Swipe, tap the edges, or use ← → · F for fullscreen</p>
        </div>)}
        {mode === "scroll" && <div className="mx-auto flex max-w-3xl flex-col">{pages.map((s, k) => <img key={s} data-scroll-page={k} src={s} alt={`Page ${k + 1}`} loading={k < 3 ? "eager" : "lazy"} decoding="async" className="min-h-[240px] w-full bg-zinc-100 dark:bg-zinc-900" />)}</div>}
        <ChapterNav />
      </div>
    </div>
  );
}
