import { getChapterMeta, getChapters, getPages, getManga } from "@/lib/md";
import Reader from "@/components/Reader";
import { TrackHistory } from "@/components/Library";
import { notFound } from "next/navigation";
export const revalidate = 600;
export default async function Read({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const meta = await getChapterMeta(params.id).catch(() => null); if (!meta) notFound();
  const [pages, chapters, manga] = await Promise.all([getPages(params.id), getChapters(meta.mangaId).catch(() => []), getManga(meta.mangaId)]);
  if (!["safe", "suggestive"].includes(manga.rating)) notFound();
  let i = chapters.findIndex((c) => c.id === params.id); if (i < 0 && meta.chapter) i = chapters.findIndex((c) => c.chapter === meta.chapter);
  const prev = i > 0 ? `/read/${chapters[i - 1].id}` : null, next = i >= 0 && i < chapters.length - 1 ? `/read/${chapters[i + 1].id}` : null;
  const label = `${manga.title} · ${meta.chapter ? `Ch. ${meta.chapter}` : "Oneshot"}`;
  return (<><TrackHistory mangaId={manga.id} title={manga.title} cover={manga.cover} chapterId={params.id} chapter={meta.chapter} /><Reader longStrip={manga.tags.some((t) => t.name === "Long Strip")} pages={pages} prevHref={prev} nextHref={next} backHref={`/series/${manga.id}`} label={label} storageKey={params.id} /></>);
}
