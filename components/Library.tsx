"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export type Fav = { id: string; title: string; cover: string | null };
export type Hist = { mangaId: string; title: string; cover: string | null; chapterId: string; chapter: string | null; at: number };
const get = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch { return d; } };
export const store = {
  favs: () => get<Fav[]>("ym-favs", []),
  setFavs: (f: Fav[]) => localStorage.setItem("ym-favs", JSON.stringify(f)),
  hist: () => get<Hist[]>("ym-hist", []),
  pushHist: (h: Hist) => localStorage.setItem("ym-hist", JSON.stringify([h, ...store.hist().filter((x) => x.mangaId !== h.mangaId)].slice(0, 50))),
};
export function FavButton({ m }: { m: Fav }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(store.favs().some((f) => f.id === m.id)), [m.id]);
  const t = () => { const f = store.favs().filter((x) => x.id !== m.id); if (!on) f.unshift(m); store.setFavs(f); setOn(!on); };
  return <button onClick={t} className={`rounded-full px-5 py-2 text-sm font-bold ${on ? "bg-rose-500 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>{on ? "♥ In library" : "♡ Add to library"}</button>;
}
export function ContinueReading({ mangaId }: { mangaId: string }) {
  const [h, setH] = useState<Hist | null>(null);
  useEffect(() => setH(store.hist().find((x) => x.mangaId === mangaId) ?? null), [mangaId]);
  if (!h) return null;
  return <Link href={`/read/${h.chapterId}`} className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">Continue Ch. {h.chapter ?? "?"}</Link>;
}
export function TrackHistory(h: Omit<Hist, "at">) { useEffect(() => store.pushHist({ ...h, at: Date.now() }), [h.chapterId]); return null; }
export function LibraryView() {
  const [favs, setF] = useState<Fav[]>([]); const [hist, setH] = useState<Hist[]>([]);
  useEffect(() => { setF(store.favs()); setH(store.hist()); }, []);
  const Tile = ({ href, cover, title, sub }: any) => <Link href={href} className="block"><div className="aspect-[3/4] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">{cover && <img src={cover} alt={title} className="h-full w-full object-cover" />}</div><p className="mt-2 line-clamp-2 text-sm font-semibold">{title}</p>{sub && <p className="text-xs text-zinc-500">{sub}</p>}</Link>;
  return (<div className="space-y-10">
    <section><h2 className="mb-4 text-xl font-bold">Favourites</h2>{favs.length ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{favs.map((f) => <Tile key={f.id} href={`/series/${f.id}`} {...f} />)}</div> : <p className="text-zinc-500">Nothing yet — tap “Add to library” on any series.</p>}</section>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Reading history</h2>{hist.length > 0 && <button className="text-sm text-zinc-500" onClick={() => { localStorage.removeItem("ym-hist"); setH([]); }}>Clear</button>}</div>{hist.length ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{hist.map((h) => <Tile key={h.mangaId} href={`/read/${h.chapterId}`} cover={h.cover} title={h.title} sub={`Ch. ${h.chapter ?? "?"} · ${new Date(h.at).toLocaleDateString()}`} />)}</div> : <p className="text-zinc-500">No chapters read yet.</p>}</section>
  </div>);
}
