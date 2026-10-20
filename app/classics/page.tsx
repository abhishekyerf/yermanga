import { PD } from "@/lib/pd";
import { pdCard } from "@/lib/cards";
import { Grid } from "@/components/Card";
export const metadata = { title: "Golden Age Classics" };
export default function Classics() {
  return (<div className="space-y-10">
    <div className="max-w-2xl"><h1 className="text-[34px] font-bold leading-tight sm:text-5xl">Golden Age Classics.</h1><p className="mt-3 text-[17px] text-zinc-500">Public-domain comics from the 1940s and ’50s, scanned and preserved by the Internet Archive. Free to read, forever.</p></div>
    <Grid items={PD.map(pdCard)} />
  </div>);
}
