import type { Manga } from "./md";
import type { CardItem } from "@/components/Card";
import { type PdComic, pdCover } from "./pd";
export const mdCard = (m: Manga): CardItem => ({ href: `/series/${m.id}`, title: m.title, cover: m.cover, sub: m.tags.find((t) => t.group === "genre")?.name ?? m.status, source: "MangaDex" });
export const pdCard = (c: PdComic): CardItem => ({ href: `/classics/${c.id}`, title: c.title, cover: pdCover(c), sub: c.date ? `${c.date} · ${c.pages} pages` : `${c.pages} pages`, source: "Public Domain" });
