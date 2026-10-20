import Link from "next/link";
import type { Manga } from "@/lib/md";
export default function Card({ m, rank }: { m: Manga; rank?: number }) {
  return (
    <Link href={`/series/${m.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
        {m.cover && <img src={m.cover} alt={m.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />}
        {rank && <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-sm font-bold text-white">{rank}</span>}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-tight">{m.title}</p>
      <p className="text-xs text-zinc-500">{m.tags.find((t) => t.group === "genre")?.name ?? m.status}</p>
    </Link>
  );
}
export function Grid({ items, ranked }: { items: Manga[]; ranked?: boolean }) {
  return <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{items.map((m, i) => <Card key={m.id} m={m} rank={ranked ? i + 1 : undefined} />)}</div>;
}
export function GridSkeleton({ n = 12 }: { n?: number }) {
  return <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{Array.from({ length: n }).map((_, i) => <div key={i}><div className="aspect-[3/4] animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" /><div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" /></div>)}</div>;
}
