export default function L() { return <div className="mx-auto max-w-3xl space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-[70vh] animate-pulse bg-zinc-200 dark:bg-zinc-800" />)}</div>; }
