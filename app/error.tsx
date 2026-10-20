"use client";
export default function E({ reset }: { error: Error; reset: () => void }) {
  return <div className="py-24 text-center"><h1 className="text-3xl font-bold">Something went wrong.</h1><p className="mt-2 text-zinc-500">The content source may be busy. Please try again.</p><button onClick={reset} className="mt-6 rounded-full bg-black px-6 py-2.5 text-[15px] font-semibold text-white dark:bg-white dark:text-black">Try again</button></div>;
}
