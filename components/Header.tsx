"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const NAV = [["/browse", "Browse"], ["/classics", "Classics"], ["/library", "Library"]];
export default function Header() {
  const [dark, setDark] = useState(true); const [q, setQ] = useState(""); const r = useRouter(); const path = usePathname();
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => { const d = !dark; setDark(d); document.documentElement.classList.toggle("dark", d); localStorage.setItem("ym-theme", d ? "dark" : "light"); };
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-black/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5">
        <Link href="/" className="text-[19px] font-bold tracking-tight">Yer<span className="text-zinc-400">Manga</span></Link>
        <nav className="hidden gap-6 text-[13px] text-zinc-600 dark:text-zinc-300 sm:flex">{NAV.map(([h, l]) => <Link key={h} href={h} className={`transition hover:text-black dark:hover:text-white ${path.startsWith(h) ? "text-black dark:text-white" : ""}`}>{l}</Link>)}</nav>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) r.push(`/browse?q=${encodeURIComponent(q.trim())}`); }} className="ml-auto w-full max-w-[220px]">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" className="w-full rounded-full bg-black/5 px-4 py-1.5 text-[13px] outline-none transition focus:bg-black/10 dark:bg-white/10 dark:focus:bg-white/15" />
        </form>
        <button onClick={toggle} aria-label="Toggle theme" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm transition hover:bg-black/5 dark:hover:bg-white/10">{dark ? "☀︎" : "☾"}</button>
      </div>
      <nav className="no-scrollbar flex gap-5 overflow-x-auto px-5 pb-2 text-[13px] text-zinc-600 dark:text-zinc-300 sm:hidden">{NAV.map(([h, l]) => <Link key={h} href={h} className={path.startsWith(h) ? "font-semibold text-black dark:text-white" : ""}>{l}</Link>)}</nav>
    </header>
  );
}
