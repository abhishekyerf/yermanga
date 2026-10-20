import { GridSkeleton } from "@/components/Card";
export default function L() { return <div className="space-y-6"><div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" /><GridSkeleton n={18} /></div>; }
