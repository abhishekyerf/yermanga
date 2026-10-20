import { getChapterMeta, getChapters, getPages, getManga } from "@/lib/md";
import Reader from "@/components/Reader";
import { TrackHistory } from "@/components/Library";
import { notFound } from "next/navigation";
export const revalidate = 600;
export default async function Read({ params }: { params: { id: string } }) {
  const meta = await getChapterMeta(params.id).catch(() => null); if (!meta) notFound();
  const [pages, chapters, manga] = await Promise.all([getPages(params.id), getChapters(meta.mangaId).catch(() => []), getManga(meta.mangaId)]);
  if (!["safe", "suggestive"].includes(manga.rating)) notFound();
  const i = chapters.findIndex((c) => c.id === params.id || (meta.chapter && c.chapter === meta.chapter));
  const prev = i > 0 ? chapters[i - 1].id : null, next = i >= 0 && i < chapters.length - 1 ? chapters[i + 1].id : null;
  const label = `${manga.title} · ${meta.chapter ? `Ch. ${meta.chapter}` : "Oneshot"}${meta.title ? ` — ${meta.title}` : ""}`;
  return (<><TrackHistory mangaId={manga.id} title={manga.title} cover={manga.cover} chapterId={params.id} chapter={meta.chapter} /><Reader pages={pages} prev={prev} next={next} mangaId={manga.id} label={label} /></>);
}
