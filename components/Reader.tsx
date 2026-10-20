"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Reader({ pages, prev, next, mangaId, label }: { pages: string[]; prev: string | null; next: string | null; mangaId: string; label: string }) {
  const [mode, setMode] = useState<"scroll" | "page">("scroll"); const [p, setP] = useState(0); const r = useRouter();
  useEffect(() => { const m = localStorage.getItem("ym-mode"); if (m === "page") setMode("page"); }, []);
  useEffect(() => { setP(0); }, [pages]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (mode === "page") {
        if (e.key === "ArrowRight" || e.key === "d") { if (p < pages.length - 1) { setP(p + 1); scrollTo(0, 0); } else if (next) r.push(`/read/${next}`); }
        if (e.key === "ArrowLeft" || e.key === "a") { if (p > 0) setP(p - 1); else if (prev) r.push(`/read/${prev}`); }
      } else {
        if (e.key === "ArrowRight" && next) r.push(`/read/${next}`);
        if (e.key === "ArrowLeft" && prev) r.push(`/read/${prev}`);
      }
    };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, [mode, p, pages.length, next, prev, r]);
  const sw = (m: "scroll" | "page") => { setMode(m); localStorage.setItem("ym-mode", m); };
  const Nav = () => (<div className="flex items-center justify-between gap-2 py-4">
    {prev ? <Link href={`/read/${prev}`} className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold dark:bg-zinc-800">← Prev</Link> : <span />}
    <Link href={`/series/${mangaId}`} className="text-sm text-zinc-500">All chapters</Link>
    {next ? <Link href={`/read/${next}`} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Next →</Link> : <span />}
  </div>);
  return (<div className="mx-auto max-w-3xl">
    <div className="sticky top-[57px] z-30 flex items-center justify-between bg-white/90 px-2 py-2 text-sm backdrop-blur dark:bg-zinc-950/90">
      <span className="truncate font-semibold">{label}</span>
      <div className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
        {(["scroll", "page"] as const).map((m) => <button key={m} onClick={() => sw(m)} className={`rounded-full px-3 py-1 ${mode === m ? "bg-white shadow dark:bg-zinc-950" : ""}`}>{m === "scroll" ? "Vertical" : "Paged"}</button>)}
      </div>
    </div>
    <Nav />
    {mode === "scroll" ? <div className="flex flex-col">{pages.map((s, i) => <img key={s} src={s} alt={`Page ${i + 1}`} loading={i < 3 ? "eager" : "lazy"} className="w-full min-h-[200px] bg-zinc-100 dark:bg-zinc-900" />)}</div>
      : <div><button className="block w-full" onClick={() => { if (p < pages.length - 1) setP(p + 1); else if (next) r.push(`/read/${next}`); }}><img src={pages[p]} alt={`Page ${p + 1}`} className="mx-auto max-h-[85vh] w-auto" /></button>
        <p className="mt-2 text-center text-sm text-zinc-500">Page {p + 1} / {pages.length} · use ← → keys</p></div>}
    <Nav />
  </div>);
}
