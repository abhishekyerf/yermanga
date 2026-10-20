import { listManga, getTags } from "@/lib/md";
import { Grid } from "@/components/Card";
import Link from "next/link";
export const revalidate = 1800;
type SP = { q?: string; tag?: string; order?: string; page?: string };
const ORDERS: Record<string, string> = { followedCount: "Popular", rating: "Top rated", latestUploadedChapter: "Latest", createdAt: "Newest" };
export default async function Browse({ searchParams: sp }: { searchParams: SP }) {
  const tagIds = sp.tag ? sp.tag.split(",").filter(Boolean) : [];
  const order = ORDERS[sp.order ?? ""] ? sp.order! : sp.q ? "relevance" : "followedCount";
  const page = Math.max(1, Number(sp.page) || 1);
  const [tags, res] = await Promise.all([getTags(), listManga({ title: sp.q, tags: tagIds, order, limit: 30, offset: (page - 1) * 30 })]);
  const href = (o: Partial<SP>) => { const s = new URLSearchParams(Object.entries({ q: sp.q, tag: sp.tag, order: sp.order, ...o }).filter(([, v]) => v) as any); return `/browse?${s}`; };
  const toggle = (id: string) => (tagIds.includes(id) ? tagIds.filter((x) => x !== id) : [...tagIds, id]).join(",");
  return (<div className="space-y-6">
    <h1 className="text-2xl font-black">{sp.q ? `Results for “${sp.q}”` : "Browse"}</h1>
    <div className="flex flex-wrap gap-2">{Object.entries(ORDERS).map(([k, v]) => <Link key={k} href={href({ order: k, page: undefined })} className={`rounded-full px-3 py-1 text-sm ${order === k ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-900"}`}>{v}</Link>)}</div>
    <details className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900" open={tagIds.length > 0}><summary className="cursor-pointer text-sm font-semibold">Genres & themes {tagIds.length > 0 && `(${tagIds.length})`}</summary>
      <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((t) => <Link key={t.id} href={href({ tag: toggle(t.id), page: undefined })} className={`rounded-full px-2.5 py-1 text-xs ${tagIds.includes(t.id) ? "bg-emerald-500 text-white" : "bg-white dark:bg-zinc-800"}`}>{t.name}</Link>)}</div></details>
    <p className="text-sm text-zinc-500">{res.total.toLocaleString()} series</p>
    {res.items.length ? <Grid items={res.items} /> : <p className="py-20 text-center text-zinc-500">No series found.</p>}
    <div className="flex justify-center gap-3">{page > 1 && <Link href={href({ page: String(page - 1) })} className="rounded-full bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-900">← Prev</Link>}{page * 30 < Math.min(res.total, 9990) && <Link href={href({ page: String(page + 1) })} className="rounded-full bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-900">Next →</Link>}</div>
  </div>);
}
