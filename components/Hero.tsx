"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Manga } from "@/lib/md";
export default function Hero({ items }: { items: Manga[] }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % items.length), 6000); return () => clearInterval(t); }, [items.length]);
  const m = items[i]; if (!m) return null;
  return (
    <section className="relative h-72 overflow-hidden rounded-2xl bg-zinc-900 sm:h-96">
      {m.cover && <img src={m.cover} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl" />}
      <div className="relative flex h-full items-center gap-6 p-6 sm:p-10">
        {m.cover && <img src={m.cover} alt={m.title} className="hidden h-full rounded-xl shadow-2xl sm:block" />}
        <div className="text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Popular #{i + 1}</p>
          <h2 className="mt-2 line-clamp-2 text-2xl font-black sm:text-4xl">{m.title}</h2>
          <p className="mt-3 line-clamp-3 max-w-xl text-sm text-zinc-300">{m.description}</p>
          <Link href={`/series/${m.id}`} className="mt-5 inline-block rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-600">Read now</Link>
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {items.map((_, k) => <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />)}
      </div>
    </section>
  );
}
