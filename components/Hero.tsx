"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CardItem } from "./Card";
export default function Hero({ items }: { items: (CardItem & { description: string })[] }) {
  const [i, setI] = useState(0);
  useEffect(() => { if (items.length < 2) return; const t = setInterval(() => setI((x) => (x + 1) % items.length), 7000); return () => clearInterval(t); }, [items.length]);
  if (!items.length) return null;
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-zinc-950 text-white shadow-2xl">
      {items.map((m, k) => (
        <div key={m.href} className={`transition-opacity duration-1000 ${k === i ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`} aria-hidden={k !== i}>
          {m.cover && <img src={m.cover} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-3xl" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="relative flex min-h-[340px] items-center gap-10 px-7 py-10 sm:min-h-[440px] sm:px-14">
            <div className="max-w-xl">
              <p className="text-[13px] font-semibold uppercase tracking-[.18em] text-white/60">Most popular</p>
              <h2 className="mt-3 line-clamp-2 text-4xl font-bold leading-[1.05] sm:text-6xl">{m.title}</h2>
              <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-white/75 sm:text-[17px]">{m.description}</p>
              <Link href={m.href} className="mt-7 inline-block rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold text-black transition hover:scale-[1.03] active:scale-95">Start reading</Link>
            </div>
            {m.cover && <img src={m.cover} alt={m.title} className="ml-auto hidden h-80 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,.5)] md:block" />}
          </div>
        </div>
      ))}
      <div className="absolute bottom-5 left-7 flex gap-1.5 sm:left-14">{items.map((_, k) => <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? "w-7 bg-white" : "w-1.5 bg-white/40"}`} />)}</div>
    </section>
  );
}
