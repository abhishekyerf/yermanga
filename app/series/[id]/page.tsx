import { getManga, getChapters } from "@/lib/md";
import { FavButton, ContinueReading } from "@/components/Library";
import Link from "next/link";
import { notFound } from "next/navigation";
export const revalidate = 900;
export default async function Series({ params }: { params: { id: string } }) {
  const m = await getManga(params.id).catch(() => null); if (!m || !["safe", "suggestive"].includes(m.rating)) notFound();
  const ch = await getChapters(params.id).catch(() => []);
  return (<div className="space-y-8">
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="mx-auto w-48 shrink-0 sm:mx-0 sm:w-56">{m.cover && <img src={m.cover} alt={m.title} className="w-full rounded-xl shadow-lg" />}</div>
      <div className="space-y-3">
        <h1 className="text-3xl font-black">{m.title}</h1>
        <p className="text-sm text-zinc-500">{[m.author, m.year, m.status].filter(Boolean).join(" · ")}</p>
        <div className="flex flex-wrap gap-1.5">{m.tags.map((t) => <Link key={t.id} href={`/browse?tag=${t.id}`} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs dark:bg-zinc-800">{t.name}</Link>)}</div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{m.description.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 1200)}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {ch[0] && <Link href={`/read/${ch[0].id}`} className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white">Read first chapter</Link>}
          <ContinueReading mangaId={m.id} /><FavButton m={{ id: m.id, title: m.title, cover: m.cover }} />
        </div>
      </div>
    </div>
    <section><h2 className="mb-3 text-xl font-bold">Chapters <span className="text-zinc-500">({ch.length})</span></h2>
      {ch.length ? <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">{[...ch].reverse().map((c) => <li key={c.id}><Link href={`/read/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"><span className="text-sm font-medium">{c.chapter ? `Chapter ${c.chapter}` : "Oneshot"}{c.title ? ` — ${c.title}` : ""}</span><span className="text-xs text-zinc-500">{new Date(c.publishAt).toLocaleDateString()}</span></Link></li>)}</ul>
        : <p className="text-zinc-500">No readable English chapters on MangaDex for this series.</p>}
    </section>
  </div>);
}
