import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
export const metadata: Metadata = { title: { default: "YerManga", template: "%s · YerManga" }, description: "A clean manga, webtoon and classic-comics reader powered by MangaDex and the Internet Archive." };
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#000" }, { color: "#fff" }] };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className="dark" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('ym-theme')==='light')document.documentElement.classList.remove('dark')}catch(e){}` }} /></head>
    <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-10">{children}</main>
      <footer className="border-t border-black/5 py-10 text-[12px] text-zinc-500 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-5 sm:flex sm:justify-between sm:gap-8">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">YerManga</p>
          <p className="mt-2 max-w-2xl sm:mt-0">Manga data, covers and chapters are provided by <a className="underline" href="https://mangadex.org" target="_blank" rel="noreferrer">MangaDex</a>. Classic comics are public-domain scans hosted by the <a className="underline" href="https://archive.org" target="_blank" rel="noreferrer">Internet Archive</a>. YerManga hosts no content. Please support the original creators.</p>
        </div>
      </footer>
    </body></html>);
}
