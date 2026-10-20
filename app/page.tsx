import { listManga, getTags, type Manga } from "@/lib/md";
import { PD } from "@/lib/pd";
import { mdCard, pdCard } from "@/lib/cards";
import Hero from "@/components/Hero";
import { Grid, Shelf, Empty } from "@/components/Card";
import GenreTabs from "@/components/GenreTabs";
import Link from "next/link";
export const revalidate = 1800;
const GENRES = ["Action", "Romance", "Comedy", "Fantasy", "Slice of Life"];
const safe = <T,>(p: Promise<T>, d: T) => p.catch(() => d);
const none = { items: [] as Manga[], total: 0 };
export default async function Home() {
  const [pop, trending, latest, tags] = await Promise.all([safe(listManga({ order: "followedCount", limit: 8 }), none), safe(listManga({ order: "rating", limit: 14 }), none), safe(listManga({ order: "latestUploadedChapter", limit: 14 }), none), safe(getTags(), [])]);
  const genres = await Promise.all(GENRES.map(async (name) => { const t = tags.find((x) => x.name === name); return { name, items: t ? (await safe(listManga({ tags: [t.id], limit: 14 }), none)).items.slice(0, 12).map(mdCard) : [] }; }));
  const S = ({ t, sub, href, children }: { t: string; sub?: string; href?: string; children: React.ReactNode }) => (<section><div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="text-[28px] font-bold leading-tight sm:text-[34px]">{t}</h2>{sub && <p className="mt-1 text-[15px] text-zinc-500">{sub}</p>}</div>{href && <Link href={href} className="shrink-0 text-[15px] text-blue-600 hover:underline dark:text-blue-400">See all</Link>}</div>{children}</section>);
  if (!pop.items.length && !trending.items.length) return (<div className="space-y-16"><Empty title="MangaDex is unavailable right now" sub="Try again in a minute. Meanwhile, classic comics are always available." /><S t="Golden Age Classics" href="/classics"><Shelf items={PD.map(pdCard)} /></S></div>);
  return (<div className="space-y-16 sm:space-y-20">
    <Hero items={pop.items.slice(0, 6).map((m) => ({ ...mdCard(m), description: m.description.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") }))} />
    <S t="Trending" sub="Top-rated series readers love right now." href="/browse?order=rating"><Grid items={trending.items.slice(0, 12).map(mdCard)} ranked /></S>
    <S t="Golden Age Classics" sub="Public-domain comics from the 1940s and ’50s, free forever." href="/classics"><Shelf items={PD.map(pdCard)} /></S>
    <S t="Latest Updates" sub="Fresh chapters, just uploaded." href="/browse?order=latestUploadedChapter"><Grid items={latest.items.slice(0, 12).map(mdCard)} /></S>
    <S t="Browse by Genre" href="/browse"><GenreTabs genres={genres} /></S>
  </div>);
}
