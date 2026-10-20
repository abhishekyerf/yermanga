"use client";
import { useState } from "react";
import type { Manga } from "@/lib/md";
import { Grid } from "./Card";
export default function GenreTabs({ genres }: { genres: { name: string; items: Manga[] }[] }) {
  const [i, setI] = useState(0);
  return (<div>
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{genres.map((g, k) => <button key={g.name} onClick={() => setI(k)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${k === i ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-900"}`}>{g.name}</button>)}</div>
    <Grid items={genres[i]?.items ?? []} />
  </div>);
}
