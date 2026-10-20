import { UA } from "@/lib/md";
export const runtime = "edge";
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u) return new Response("missing", { status: 400 });
  let url: URL; try { url = new URL(u); } catch { return new Response("bad", { status: 400 }); }
  const ok = url.protocol === "https:" && (url.hostname === "uploads.mangadex.org" || url.hostname.endsWith(".mangadex.network"));
  if (!ok) return new Response("forbidden host", { status: 403 });
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return new Response("upstream " + r.status, { status: 502 });
  return new Response(r.body, { headers: { "Content-Type": r.headers.get("content-type") ?? "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } });
}
