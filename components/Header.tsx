"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Header() {
  const [dark, setDark] = useState(true); const [q, setQ] = useState(""); const r = useRouter();
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => { const d = !dark; setDark(d); document.documentElement.classList.toggle("dark", d); localStorage.setItem("ym-theme", d ? "dark" : "light"); };
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight"><span className="text-emerald-500">Yer</span>Manga</Link>
        <nav className="hidden gap-4 text-sm font-medium sm:flex"><Link href="/browse">Browse</Link><Link href="/library">Library</Link></nav>
        <form onSubmit={(e) => { e.preventDefault(); r.push(`/browse?q=${encodeURIComponent(q)}`); }} className="ml-auto flex-1 sm:max-w-xs">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search manga…" className="w-full rounded-full bg-zinc-100 px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900" />
        </form>
        <Link href="/library" className="text-sm sm:hidden">♥</Link>
        <button onClick={toggle} aria-label="Toggle theme" className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900">{dark ? "☀️" : "🌙"}</button>
      </div>
    </header>
  );
}
