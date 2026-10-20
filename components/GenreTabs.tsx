"use client";
import { useState } from "react";
import { Grid, type CardItem } from "./Card";
export default function GenreTabs({ genres }: { genres: { name: string; items: CardItem[] }[] }) {
  const gs = genres.filter((g) => g.items.length); const [i, setI] = useState(0);
  if (!gs.length) return null;
  return (<div>
    <div className="no-scrollbar mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-black/5 p-1 dark:bg-white/10">{gs.map((g, k) => <button key={g.name} onClick={() => setI(k)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition ${k === i ? "bg-white text-black shadow-sm dark:bg-zinc-700 dark:text-white" : "text-zinc-600 dark:text-zinc-300"}`}>{g.name}</button>)}</div>
    <Grid key={gs[i].name} items={gs[i].items} />
  </div>);
}
