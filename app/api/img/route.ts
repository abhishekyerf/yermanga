import { UA } from "@/lib/md";
export const runtime = "nodejs";
export const maxDuration = 30;
const allowed = (h: string) => h === "uploads.mangadex.org" || h.endsWith(".mangadex.network") || h === "iiif.archive.org" || h === "archive.org" || h.endsWith(".us.archive.org");
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u) return new Response("missing", { status: 400 });
  let url: URL; try { url = new URL(u); } catch { return new Response("bad", { status: 400 }); }
  if (url.protocol !== "https:" || !allowed(url.hostname)) return new Response("forbidden host", { status: 403 });
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
    const ct = r.headers.get("content-type") ?? "";
    if (!r.ok || !ct.startsWith("image/")) return new Response("upstream " + r.status, { status: 502, headers: { "x-upstream-url": r.url } });
    return new Response(r.body, { headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } });
  } catch { return new Response("upstream timeout", { status: 504 }); }
}
