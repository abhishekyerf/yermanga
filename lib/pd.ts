import data from "./pd-data.json";
// Curated public-domain Golden Age comics hosted by the Internet Archive (pages served via BookReader page images).
export type PdComic = { id: string; title: string; date: string; description: string; creator: string; pages: number };
export const PD: PdComic[] = data as PdComic[];
export const pdImg = (id: string, n: number, w = 1000) => `/api/img?u=${encodeURIComponent(`https://archive.org/download/${id}/page/n${n}_w${w}.jpg`)}`;
export const pdPages = (c: PdComic) => Array.from({ length: c.pages }, (_, n) => pdImg(c.id, n));
export const getPd = (id: string) => PD.find((c) => c.id === id) ?? null;
export const pdCover = (c: PdComic) => pdImg(c.id, 0, 500);
