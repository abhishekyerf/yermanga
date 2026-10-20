import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
export const metadata: Metadata = { title: "YerManga — read manga free", description: "A clean manga & webtoon reader powered by MangaDex." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className="dark" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('ym-theme')==='light')document.documentElement.classList.remove('dark')}catch(e){}` }} /></head>
    <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mt-16 border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        <p className="font-black text-zinc-800 dark:text-zinc-200"><span className="text-emerald-500">Yer</span>Manga</p>
        <p className="mt-1">All manga data, covers and chapters provided by <a className="underline" href="https://mangadex.org" target="_blank" rel="noreferrer">MangaDex</a>. YerManga hosts no content. Support the original creators.</p>
      </footer>
    </body></html>);
}
