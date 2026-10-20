import { listManga, getTags } from "@/lib/md";
import Hero from "@/components/Hero";
import { Grid } from "@/components/Card";
import GenreTabs from "@/components/GenreTabs";
import Link from "next/link";
export const revalidate = 1800;
const GENRES = ["Action", "Romance", "Comedy", "Fantasy", "Drama", "Slice of Life"];
export default async function Home() {
  const [pop, trending, latest, tags] = await Promise.all([
    listManga({ order: "followedCount", limit: 6 }), listManga({ order: "rating", limit: 12 }), listManga({ order: "latestUploadedChapter", limit: 12 }), getTags(),
  ]);
  const genres = await Promise.all(GENRES.map(async (name) => { const t = tags.find((x) => x.name === name); return { name, items: t ? (await listManga({ tags: [t.id], limit: 12 })).items : [] }; }));
  const H = ({ t, href }: { t: string; href: string }) => <div className="mb-4 flex items-end justify-between"><h2 className="text-xl font-bold">{t}</h2><Link href={href} className="text-sm text-emerald-500">See all →</Link></div>;
  return (<div className="space-y-12">
    <Hero items={pop.items} />
    <section><H t="Trending" href="/browse?order=rating" /><Grid items={trending.items} ranked /></section>
    <section><H t="Latest Updates" href="/browse?order=latestUploadedChapter" /><Grid items={latest.items} /></section>
    <section><H t="Genres" href="/browse" /><GenreTabs genres={genres} /></section>
  </div>);
}
