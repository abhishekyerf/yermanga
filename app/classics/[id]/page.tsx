import { getPd, pdCover, PD } from "@/lib/pd";
import { Detail } from "@/app/series/[id]/page";
import { notFound } from "next/navigation";
export const generateStaticParams = () => PD.map((c) => ({ id: c.id }));
export const dynamicParams = false;
export function generateMetadata({ params }: { params: { id: string } }) { return { title: getPd(params.id)?.title ?? "Classic" }; }
export default function Classic({ params }: { params: { id: string } }) {
  const c = getPd(params.id); if (!c) notFound();
  return <Detail cover={pdCover(c)} title={c.title} meta={[c.creator, c.date, `${c.pages} pages`].filter(Boolean).join(" · ")} source="Public Domain" description={c.description} tags={[{ name: "Golden Age" }, { name: "Public domain" }, { name: "Internet Archive", href: undefined }]} firstHref={`/classics/${c.id}/read`} id={`pd-${c.id}`} href={`/classics/${c.id}`}>
    <p className="text-[13px] text-zinc-500">Source: <a className="underline" href={`https://archive.org/details/${c.id}`} target="_blank" rel="noreferrer">archive.org/details/{c.id}</a></p>
  </Detail>;
}
