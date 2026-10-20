import Link from "next/link";
export default function NF() { return <div className="py-24 text-center"><h1 className="text-4xl font-bold">Not found.</h1><p className="mt-2 text-zinc-500">This title or chapter isn’t available.</p><Link href="/" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-[15px] font-semibold text-white dark:bg-white dark:text-black">Go home</Link></div>; }
