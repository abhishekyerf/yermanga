"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = { longStrip?: boolean; pages: string[]; prevHref: string | null; nextHref: string | null; backHref: string; label: string; storageKey: string };
const PRELOAD = 6;

export default function Reader({ longStrip = false, pages, prevHref, nextHref, backHref, label, storageKey }: Props) {
  const [mode, setMode] = useState<"book" | "scroll" | null>(null);
  const [page, setPage] = useState(0);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [ui, setUi] = useState(true);
  const [fit, setFit] = useState<{ w: number; h: number } | null>(null);
  const [hint, setHint] = useState(false);
  const hideT = useRef<ReturnType<typeof setTimeout>>();
  const wrap = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null), flip = useRef<any>(null), imgs = useRef<HTMLImageElement[]>([]);
  const r = useRouter(); const total = pages.length; const posKey = `ym-pos-${storageKey}`;

  // Long-strip (webtoon) chapters default to Scroll; the user's choice is remembered separately for strips and normal manga.
  const [strip, setStrip] = useState(longStrip);
  const modeKey = strip ? "ym-mode-strip" : "ym-mode";
  useEffect(() => { const v = localStorage.getItem(modeKey); setMode(v === "scroll" || v === "book" ? v : strip ? "scroll" : "book"); }, [modeKey, strip]);
  useEffect(() => { const mq = matchMedia("(pointer: coarse), (max-width: 640px)"); const f = () => setMobile(mq.matches); f(); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); }, []);
  const immersive = mobile && mode !== null;
  // Immersive: size the book to fit the viewport (100dvh minus safe areas), lock page scroll, auto-hide controls.
  useEffect(() => {
    if (!immersive) { setFit(null); return; }
    // Full viewport book: 100vw x visual viewport height; rebuilt (debounced) on resize/rotate.
    let t: ReturnType<typeof setTimeout>;
    const calc = () => { const vv = window.visualViewport; const w = Math.round(vv?.width ?? innerWidth), h = Math.round(vv?.height ?? innerHeight); setFit((f) => (f && f.w === w && f.h === h ? f : { w, h })); };
    const deb = () => { clearTimeout(t); t = setTimeout(calc, 150); };
    calc(); addEventListener("resize", deb); addEventListener("orientationchange", deb); window.visualViewport?.addEventListener("resize", deb);
    const ov = document.body.style.overflow; document.body.style.overflow = "hidden";
    const ios = /iP(hone|od|ad)/.test(navigator.userAgent) && !(navigator as any).standalone && !matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches;
    if (ios && !localStorage.getItem("ym-a2hs")) setHint(true);
    return () => { clearTimeout(t); removeEventListener("resize", deb); removeEventListener("orientationchange", deb); window.visualViewport?.removeEventListener("resize", deb); document.body.style.overflow = ov; };
  }, [immersive]);
  const poke = useCallback((show = true) => { setUi(show); clearTimeout(hideT.current); if (show) hideT.current = setTimeout(() => setUi(false), 3000); }, []);
  useEffect(() => { if (immersive) { setUi(true); clearTimeout(hideT.current); hideT.current = setTimeout(() => setUi(false), 1500); } else { clearTimeout(hideT.current); setUi(true); } }, [immersive, poke]);
  const tryFs = () => { const d = document.documentElement as any; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen({ navigationUI: "hide" }).catch(() => {}); };
  const loadAround = useCallback((p: number) => { for (let k = Math.max(0, p - 2); k <= Math.min(total - 1, p + PRELOAD); k++) { const im = imgs.current[k]; if (im && !im.src) im.src = pages[k]; } }, [pages, total]);

  // Book mode: StPageFlip, built imperatively because PageFlip.destroy() removes its own root node.
  useEffect(() => {
    if (mode !== "book" || !host.current || !total || (immersive && !fit)) return;
    let pf: any, cancelled = false; setReady(false);
    const root = document.createElement("div"); host.current.appendChild(root);
    const ratios: number[] = [];
    const checkStrip = () => { const v = ratios.filter(Boolean); if (strip || v.length < 3) return; const m = [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]; if (m > 1.8) setStrip(true); };
    imgs.current = pages.map((_, k) => {
      const d = document.createElement("div"); d.className = immersive ? "book-page imm" : "book-page";
      const im = document.createElement("img"); im.alt = `Page ${k + 1}`; im.decoding = "async";
      im.onload = () => {
        ratios[k] = im.naturalHeight / im.naturalWidth; checkStrip();
        // Always show the whole page (contain), centered over a blurred copy of itself. Never crop.
        if (immersive && !d.querySelector(".bg")) { const bg = document.createElement("img"); bg.className = "bg"; bg.alt = ""; bg.src = im.src; d.prepend(bg); }
      };
      d.appendChild(im); root.appendChild(d); return im;
    });
    const start = Math.min(Number(localStorage.getItem(posKey)) || 0, total - 1);
    loadAround(start);
    import("page-flip").then(({ PageFlip }) => {
      if (cancelled) return;
      const sz = immersive && fit ? { width: fit.w, height: fit.h, size: "fixed" } : { width: 560, height: 820, size: "stretch", minWidth: 260, maxWidth: 900, minHeight: 380, maxHeight: 1320 };
      pf = new PageFlip(root, { ...sz, maxShadowOpacity: 0.45, showCover: false, usePortrait: true, mobileScrollSupport: false, flippingTime: 650, startPage: start, autoSize: true, swipeDistance: 25, disableFlipByClick: true });
      pf.loadFromHTML(Array.from(root.children));
      pf.on("flip", (e: any) => { setPage(e.data); loadAround(e.data); localStorage.setItem(posKey, String(e.data)); });
      flip.current = pf; setPage(start); setReady(true);
    });
    return () => { cancelled = true; flip.current = null; try { pf?.destroy(); } catch {} root.remove(); };
  }, [mode, pages, fit, immersive, strip]);

  // Scroll mode: remember last page via IntersectionObserver.
  useEffect(() => {
    if (mode !== "scroll") return;
    const els = Array.from(document.querySelectorAll<HTMLImageElement>("[data-scroll-page]"));
    const start = Number(localStorage.getItem(posKey)) || 0;
    if (start > 0) els[Math.min(start, els.length - 1)]?.scrollIntoView();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const k = Number((e.target as HTMLElement).dataset.scrollPage); setPage(k); localStorage.setItem(posKey, String(k)); } }), { rootMargin: "-45% 0px -45% 0px" });
    els.forEach((el) => io.observe(el)); return () => io.disconnect();
  }, [mode, pages, immersive]);

  const next = useCallback(() => { const pf = flip.current; if (mode === "book" && pf) { const last = pf.getCurrentPageIndex() + (pf.getOrientation() === "landscape" ? 2 : 1) >= total; if (!last) return pf.flipNext(); } if (nextHref) r.push(nextHref); }, [mode, total, nextHref, r]);
  const prev = useCallback(() => { const pf = flip.current; if (mode === "book" && pf && pf.getCurrentPageIndex() > 0) { const i = pf.getCurrentPageIndex(); pf.flipPrev("top"); setTimeout(() => { if (flip.current === pf && pf.getCurrentPageIndex() === i && pf.getState?.() === "read") { pf.turnToPrevPage(); const n = pf.getCurrentPageIndex(); setPage(n); loadAround(n); localStorage.setItem(posKey, String(n)); } }, 120); return; } if (prevHref) r.push(prevHref); }, [mode, prevHref, r, loadAround, posKey]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (mode === "book") { if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); } else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); } }
      else if (e.key === "ArrowRight" && nextHref) r.push(nextHref); else if (e.key === "ArrowLeft" && prevHref) r.push(prevHref);
      if (e.key === "f") fullscreen();
    };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, [mode, next, prev, nextHref, prevHref, r]);

  const fullscreen = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else tryFs(); };
  const close = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); r.push(backHref); };
  const down = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => { down.current = { x: e.clientX, y: e.clientY }; if (immersive) tryFs(); };
  const onUp = (e: React.PointerEvent) => { if ((e.target as HTMLElement).closest("a,button:not([aria-label$='page'])")) return;  const d = down.current; down.current = null; if (!immersive || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return; const x = e.clientX / innerWidth; if (x > 0.3 && x < 0.7) poke(!ui); };
  const sw = (m: "book" | "scroll") => { localStorage.setItem(modeKey, m); setMode(m); };
  const pct = total ? Math.round(((page + 1) / total) * 100) : 0;

  if (!total) return <div className="py-24 text-center"><p className="text-lg font-semibold">This chapter has no pages.</p><Link href={backHref} className="mt-3 inline-block text-sm text-blue-500">Back to series</Link></div>;

  const ChapterNav = () => (<div className="flex items-center justify-between gap-3 py-5">
    {prevHref ? <Link href={prevHref} className="rounded-full bg-black/5 px-5 py-2 text-[14px] font-medium dark:bg-white/10">← Previous</Link> : <span />}
    <Link href={backHref} className="text-[13px] text-zinc-500 hover:underline">All chapters</Link>
    {nextHref ? <Link href={nextHref} className="rounded-full bg-black px-5 py-2 text-[14px] font-medium text-white dark:bg-white dark:text-black">Next →</Link> : <span />}
  </div>);

  if (immersive) return (
    <div ref={wrap} data-testid="immersive" onPointerDown={onDown} onPointerUp={onUp} data-mode={mode} className={`fixed inset-0 z-50 h-[100dvh] w-screen select-none bg-black text-white ${mode === "scroll" ? "overflow-y-auto overscroll-contain" : "touch-none overflow-hidden"}`} style={fit ? { height: fit.h } : undefined}>
      {mode === "book" ? <>
        {!ready && <div className="shimmer absolute inset-0" />}
        <div ref={host} data-testid="book" style={fit ? { width: fit.w, height: fit.h } : undefined} className={`absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`} />
      </> : <div data-testid="strip" className="flex flex-col">{pages.map((src, k) => <img key={src} data-scroll-page={k} src={src} alt={`Page ${k + 1}`} loading={k < 3 ? "eager" : "lazy"} decoding="async" onLoad={(e) => { e.currentTarget.style.minHeight = "0"; }} className="block h-auto min-h-[30vh] w-full bg-zinc-900" />)}
        <div className="flex items-center justify-between gap-3 px-4 py-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 90px)" }}>{prevHref ? <Link href={prevHref} className="rounded-full bg-white/15 px-5 py-2 text-[14px]">← Previous</Link> : <span />}{nextHref ? <Link href={nextHref} className="rounded-full bg-white px-5 py-2 text-[14px] font-semibold text-black">Next chapter →</Link> : <span />}</div></div>}
      {hint && <div className="absolute inset-x-4 z-30 flex items-center gap-3 rounded-2xl bg-black/60 px-4 py-3 text-[13px] backdrop-blur-xl" style={{ bottom: "calc(env(safe-area-inset-bottom) + 84px)" }} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
        <span className="flex-1">For true full screen, tap Share → Add to Home Screen.</span>
        <button aria-label="Dismiss hint" onClick={() => { localStorage.setItem("ym-a2hs", "1"); setHint(false); }} className="shrink-0 rounded-full bg-white/20 px-3 py-1">OK</button></div>}
      {ready && mode === "book" && <><button aria-label="Previous page" onClick={prev} className="absolute inset-y-0 left-0 z-10 w-[30%]" /><button aria-label="Next page" onClick={next} className="absolute inset-y-0 right-0 z-10 w-[30%]" /></>}
      <div data-testid="overlay" className={`pointer-events-none ${mode === "scroll" ? "fixed" : "absolute"} inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${ui ? "opacity-100" : "opacity-0"}`}>
        <div className={`flex items-center gap-3 bg-black/45 px-4 pb-3 backdrop-blur-xl text-[13px] ${ui ? "pointer-events-auto" : ""}`} style={{ paddingTop: "calc(env(safe-area-inset-top) + 10px)" }}>
          <button aria-label="Close reader" onClick={close} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-lg backdrop-blur-md">✕</button>
          <span className="truncate font-semibold">{label}</span>
          <button onClick={() => sw(mode === "book" ? "scroll" : "book")} className="ml-auto shrink-0 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">{mode === "book" ? "Scroll" : "Book"}</button>
        </div>
        <div className={`bg-black/45 px-4 pt-3 backdrop-blur-xl ${ui ? "pointer-events-auto" : ""}`} style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <div className="h-1 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-white transition-all duration-300" style={{ width: `${pct}%` }} /></div>
          <div className="mt-3 flex items-center justify-between text-[13px]">
            {prevHref ? <Link href={prevHref} onClick={tryFs} className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-md">← Prev</Link> : <span />}
            <span className="tabular-nums text-white/80" data-testid="counter">{page + 1} / {total}</span>
            {nextHref ? <Link href={nextHref} onClick={tryFs} className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-md">Next →</Link> : <span />}
          </div>
        </div>
      </div>
    </div>
  );

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
          {ready && mode === "book" && <><button aria-label="Previous page" onClick={prev} className="absolute inset-y-6 left-0 z-10 w-[12%] cursor-w-resize" /><button aria-label="Next page" onClick={next} className="absolute inset-y-6 right-0 z-10 w-[12%] cursor-e-resize" /></>}
          <p className="mt-4 text-center text-[12px] text-zinc-500">Swipe, tap the edges, or use ← → · F for fullscreen</p>
        </div>)}
        {mode === "scroll" && <div className="mx-auto flex max-w-3xl flex-col">{pages.map((s, k) => <img key={s} data-scroll-page={k} src={s} alt={`Page ${k + 1}`} loading={k < 3 ? "eager" : "lazy"} decoding="async" className="min-h-[240px] w-full bg-zinc-100 dark:bg-zinc-900" />)}</div>}
        <ChapterNav />
      </div>
    </div>
  );
}
