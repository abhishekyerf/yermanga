import { listManga, getTags } from "@/lib/md";
import { Grid, Empty } from "@/components/Card";
import { mdCard, pdCard } from "@/lib/cards";
import { PD } from "@/lib/pd";
import Link from "next/link";
export const revalidate = 1800;
type SP = { q?: string; tag?: string; order?: string; page?: string };
const ORDERS: Record<string, string> = { followedCount: "Popular", rating: "Top rated", latestUploadedChapter: "Latest", createdAt: "Newest" };
export default async function Browse({ searchParams: sp }: { searchParams: SP }) {
  const tagIds = sp.tag ? sp.tag.split(",").filter(Boolean) : [];
  const order = ORDERS[sp.order ?? ""] ? sp.order! : sp.q ? "relevance" : "followedCount";
  const page = Math.max(1, Number(sp.page) || 1);
  const [tags, res] = await Promise.all([getTags().catch(() => []), listManga({ title: sp.q, tags: tagIds, order, limit: 30, offset: (page - 1) * 30 }).catch(() => null)]);
  const pd = sp.q && page === 1 ? PD.filter((c) => c.title.toLowerCase().includes(sp.q!.toLowerCase())) : [];
  const href = (o: Partial<SP>) => { const s = new URLSearchParams(Object.entries({ q: sp.q, tag: sp.tag, order: sp.order, ...o }).filter(([, v]) => v) as any); return `/browse?${s}`; };
  const toggle = (id: string) => (tagIds.includes(id) ? tagIds.filter((x) => x !== id) : [...tagIds, id]).join(",");
  return (<div className="space-y-8">
    <h1 className="text-[34px] font-bold leading-tight sm:text-5xl">{sp.q ? `Results for “${sp.q}”` : "Browse"}</h1>
    <div className="flex flex-wrap gap-2">{Object.entries(ORDERS).map(([k, v]) => <Link key={k} href={href({ order: k, page: undefined })} className={`rounded-full px-3 py-1 text-sm ${order === k ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/5 dark:bg-white/10"}`}>{v}</Link>)}</div>
    <details className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/60" open={tagIds.length > 0}><summary className="cursor-pointer text-sm font-semibold">Genres & themes {tagIds.length > 0 && `(${tagIds.length})`}</summary>
      <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((t) => <Link key={t.id} href={href({ tag: toggle(t.id), page: undefined })} className={`rounded-full px-2.5 py-1 text-xs ${tagIds.includes(t.id) ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-800"}`}>{t.name}</Link>)}</div></details>
    {pd.length > 0 && <section><h2 className="mb-4 text-xl font-bold">Public-domain classics</h2><Grid items={pd.map(pdCard)} /></section>}
    {!res ? <Empty title="Couldn’t reach MangaDex" sub="Please try again shortly." /> : res.items.length ? <section className="space-y-4">{sp.q && <h2 className="text-xl font-bold">MangaDex</h2>}<Grid items={res.items.map(mdCard)} /></section> : <Empty title="No series found" sub="Try a different search or fewer filters." />}
    <div className="flex justify-center gap-3">{page > 1 && <Link href={href({ page: String(page - 1) })} className="rounded-full bg-black/5 px-5 py-2 text-[15px] dark:bg-white/10">← Prev</Link>}{res && page * 30 < Math.min(res.total, 9990) && <Link href={href({ page: String(page + 1) })} className="rounded-full bg-black/5 px-5 py-2 text-[15px] dark:bg-white/10">Next →</Link>}</div>
  </div>);
}
