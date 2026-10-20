import { getPd, pdCover, pdPages, PD } from "@/lib/pd";
import Reader from "@/components/Reader";
import { TrackHistory } from "@/components/Library";
import { notFound } from "next/navigation";
export const generateStaticParams = () => PD.map((c) => ({ id: c.id }));
export const dynamicParams = false;
export default function ReadClassic({ params }: { params: { id: string } }) {
  const c = getPd(params.id); if (!c) notFound();
  const i = PD.indexOf(c);
  return (<><TrackHistory mangaId={`pd-${c.id}`} title={c.title} cover={pdCover(c)} chapterId={c.id} chapter={null} href={`/classics/${c.id}/read`} />
    <Reader pages={pdPages(c)} prevHref={i > 0 ? `/classics/${PD[i - 1].id}/read` : null} nextHref={i < PD.length - 1 ? `/classics/${PD[i + 1].id}/read` : null} backHref={`/classics/${c.id}`} label={c.title} storageKey={`pd-${c.id}`} /></>);
}
