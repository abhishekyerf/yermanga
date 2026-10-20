import { getManga, getChapters } from "@/lib/md";
import { FavButton, ContinueReading } from "@/components/Library";
import { Badge, Empty } from "@/components/Card";
import Link from "next/link";
import ChapterLink from "@/components/ChapterLink";
import { notFound } from "next/navigation";
export const revalidate = 900;
export async function generateMetadata({ params }: { params: { id: string } }) { const m = await getManga(params.id).catch(() => null); return { title: m?.title ?? "Series" }; }
export default async function Series({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const m = await getManga(params.id).catch(() => null); if (!m || !["safe", "suggestive"].includes(m.rating)) notFound();
  const ch = await getChapters(params.id).catch(() => null);
  return <Detail cover={m.cover} title={m.title} meta={[m.author, m.year, m.status].filter(Boolean).join(" · ")} source="MangaDex" description={m.description.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 1200)} tags={m.tags.map((t) => ({ name: t.name, href: `/browse?tag=${t.id}` }))} firstHref={ch?.[0] ? `/read/${ch[0].id}` : null} id={m.id}>
    <section><h2 className="mb-5 text-[28px] font-bold">Chapters {ch && <span className="text-zinc-400">{ch.length}</span>}</h2>
      {ch === null ? <Empty title="Couldn’t load chapters" sub="MangaDex may be busy. Refresh to try again." /> : ch.length ? <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl bg-zinc-50 dark:divide-white/10 dark:bg-zinc-900/60">{[...ch].reverse().map((c) => <li key={c.id}><ChapterLink href={`/read/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-black/[.03] dark:hover:bg-white/5"><span className="truncate text-[15px] font-medium">{c.chapter ? `Chapter ${c.chapter}` : "Oneshot"}{c.title ? <span className="text-zinc-500"> — {c.title}</span> : ""}</span><span className="shrink-0 text-[13px] text-zinc-500">{new Date(c.publishAt).toLocaleDateString()}</span></ChapterLink></li>)}</ul> : <Empty title="No readable English chapters" sub="This series has no hosted English chapters on MangaDex." />}
    </section>
  </Detail>;
}
export function Detail({ cover, title, meta, source, description, tags, firstHref, id, href, children }: { cover: string | null; title: string; meta: string; source: "MangaDex" | "Public Domain"; description: string; tags: { name: string; href?: string }[]; firstHref: string | null; id: string; href?: string; children: React.ReactNode }) {
  return (<div className="space-y-14">
    <div className="relative -mx-5 -mt-10 overflow-hidden px-5 pb-4 pt-10 sm:rounded-b-[32px]">
      {cover && <img src={cover} alt="" className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-25 blur-3xl dark:opacity-30" />}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end fade-up">
        <div className="w-44 shrink-0 sm:w-60">{cover && <img src={cover} alt={title} className="w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,.3)] ring-1 ring-black/5" />}</div>
        <div className="space-y-4 text-center sm:text-left">
          <Badge source={source} />
          <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl">{title}</h1>
          <p className="text-[15px] text-zinc-500">{meta}</p>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            {firstHref && <ChapterLink href={firstHref} className="rounded-full bg-blue-600 px-6 py-2.5 text-[15px] font-semibold text-white transition hover:bg-blue-500 active:scale-95">Read from start</ChapterLink>}
            <ContinueReading mangaId={id} /><FavButton m={{ id, title, cover, href }} />
          </div>
        </div>
      </div>
    </div>
    <div className="grid gap-10 md:grid-cols-[1fr_260px]">
      <p className="whitespace-pre-line text-[17px] leading-relaxed text-zinc-700 dark:text-zinc-300">{description || "No description available."}</p>
      <div className="flex flex-wrap content-start gap-2">{tags.map((t) => t.href ? <Link key={t.name} href={t.href} className="rounded-full bg-black/5 px-3 py-1 text-[13px] transition hover:bg-black/10 dark:bg-white/10">{t.name}</Link> : <span key={t.name} className="rounded-full bg-black/5 px-3 py-1 text-[13px] dark:bg-white/10">{t.name}</span>)}</div>
    </div>
    {children}
  </div>);
}
