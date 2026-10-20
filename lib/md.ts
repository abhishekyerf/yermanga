const API = "https://api.mangadex.org";
export const UA = "YerManga/1.0 (+https://vercel.com; contact abhishekkumar.vibe@gmail.com)";
export const RATINGS = ["safe", "suggestive"];

export type Manga = { id: string; title: string; description: string; cover: string | null; tags: { id: string; name: string; group: string }[]; status: string; year: number | null; author: string; rating: string };
export type Chapter = { id: string; chapter: string | null; title: string | null; volume: string | null; pages: number; publishAt: string; group: string };

function qs(p: Record<string, string | number | string[] | undefined>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === "") continue;
    if (Array.isArray(v)) v.forEach((x) => s.append(k, x)); else s.append(k, String(v));
  }
  return s.toString();
}

export async function md<T = any>(path: string, params: Record<string, any> = {}, revalidate = 3600): Promise<T> {
  const r = await fetch(`${API}${path}${Object.keys(params).length ? "?" + qs(params) : ""}`, { headers: { "User-Agent": UA }, next: { revalidate } });
  if (!r.ok) throw new Error(`MangaDex ${r.status} ${path}`);
  return r.json();
}

const pick = (o: Record<string, string> | undefined) => (o ? o.en ?? o["ja-ro"] ?? Object.values(o)[0] ?? "" : "");

export function proxied(url: string) { return `/api/img?u=${encodeURIComponent(url)}`; }

export function toManga(d: any): Manga {
  const a = d.attributes;
  const cover = d.relationships?.find((r: any) => r.type === "cover_art")?.attributes?.fileName;
  const author = d.relationships?.find((r: any) => r.type === "author")?.attributes?.name ?? "";
  const alt = (a.altTitles || []).find((t: any) => t.en)?.en;
  return {
    id: d.id, title: pick(a.title) || alt || "Untitled", description: pick(a.description),
    cover: cover ? proxied(`https://uploads.mangadex.org/covers/${d.id}/${cover}.512.jpg`) : null,
    tags: (a.tags || []).map((t: any) => ({ id: t.id, name: pick(t.attributes.name), group: t.attributes.group })),
    status: a.status, year: a.year, author, rating: a.contentRating,
  };
}

const base = { "contentRating[]": RATINGS, "includes[]": ["cover_art", "author"], "availableTranslatedLanguage[]": ["en"], hasAvailableChapters: "true" };

export async function listManga(opts: { order?: string; limit?: number; offset?: number; title?: string; tags?: string[] } = {}) {
  const { order = "followedCount", limit = 24, offset = 0, title, tags } = opts;
  const j = await md("/manga", { ...base, limit, offset, title, "includedTags[]": tags, [`order[${order}]`]: "desc" }, 1800);
  return { items: (j.data as any[]).map(toManga), total: j.total as number };
}

export async function getManga(id: string) { const j = await md(`/manga/${id}`, { "includes[]": ["cover_art", "author"] }); return toManga(j.data); }

export async function getTags() {
  const j = await md("/manga/tag", {}, 86400);
  return (j.data as any[]).filter((t) => t.attributes.group === "genre" || t.attributes.group === "theme")
    .map((t) => ({ id: t.id, name: pick(t.attributes.name), group: t.attributes.group })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getChapters(id: string): Promise<Chapter[]> {
  const out: Chapter[] = []; const seen = new Set<string>();
  for (let offset = 0; offset < 1500; offset += 500) {
    const j = await md(`/manga/${id}/feed`, { "translatedLanguage[]": ["en"], "contentRating[]": RATINGS, "order[chapter]": "asc", "order[volume]": "asc", limit: 500, offset, includeExternalUrl: 0, includeFuturePublishAt: 0, "includes[]": ["scanlation_group"] }, 900);
    for (const c of j.data as any[]) {
      const key = c.attributes.chapter ?? c.id;
      if (seen.has(key) || !c.attributes.pages) continue; seen.add(key);
      out.push({ id: c.id, chapter: c.attributes.chapter, title: c.attributes.title, volume: c.attributes.volume, pages: c.attributes.pages, publishAt: c.attributes.publishAt, group: c.relationships.find((r: any) => r.type === "scanlation_group")?.attributes?.name ?? "" });
    }
    if (offset + 500 >= j.total) break;
  }
  return out;
}

export async function getChapterMeta(id: string) {
  const j = await md(`/chapter/${id}`, {}, 900);
  const m = j.data.relationships.find((r: any) => r.type === "manga")?.id as string;
  return { mangaId: m, chapter: j.data.attributes.chapter as string | null, title: j.data.attributes.title as string | null };
}

export async function getPages(id: string) {
  const j = await md(`/at-home/server/${id}`, {}, 600);
  return (j.chapter.data as string[]).map((f) => proxied(`${j.baseUrl}/data/${j.chapter.hash}/${f}`));
}
