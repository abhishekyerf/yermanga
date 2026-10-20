import Link from "next/link";
export type CardItem = { href: string; title: string; cover: string | null; sub?: string; source: "MangaDex" | "Public Domain" };
export function Badge({ source }: { source: CardItem["source"] }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${source === "MangaDex" ? "bg-orange-500/85 text-white" : "bg-sky-600/85 text-white"}`}>{source === "MangaDex" ? "MangaDex" : "Public Domain"}</span>;
}
export default function Card({ c, rank }: { c: CardItem; rank?: number }) {
  return (
    <Link href={c.href} className="group block fade-up">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,.08)] ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,.18)] dark:bg-zinc-900 dark:ring-white/10">
        {c.cover && <img src={c.cover} alt={c.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />}
        <div className="absolute left-2 top-2"><Badge source={c.source} /></div>
        {rank && <span className="absolute bottom-2 left-2 text-3xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]">{rank}</span>}
      </div>
      <p className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug">{c.title}</p>
      {c.sub && <p className="mt-0.5 text-[13px] text-zinc-500">{c.sub}</p>}
    </Link>
  );
}
export function Grid({ items, ranked }: { items: CardItem[]; ranked?: boolean }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-7 min-[420px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{items.map((c, i) => <Card key={c.href} c={c} rank={ranked ? i + 1 : undefined} />)}</div>;
}
export function Shelf({ items }: { items: CardItem[] }) {
  return <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2">{items.map((c) => <div key={c.href} className="w-36 shrink-0 snap-start sm:w-44"><Card c={c} /></div>)}</div>;
}
export function GridSkeleton({ n = 12 }: { n?: number }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-7 min-[420px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{Array.from({ length: n }).map((_, i) => <div key={i}><div className="shimmer aspect-[2/3] rounded-2xl" /><div className="shimmer mt-2.5 h-3.5 w-3/4 rounded" /></div>)}</div>;
}
export function Empty({ title, sub }: { title: string; sub?: string }) {
  return <div className="rounded-3xl bg-zinc-50 px-6 py-16 text-center dark:bg-zinc-900/60"><p className="text-lg font-semibold">{title}</p>{sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}</div>;
}
