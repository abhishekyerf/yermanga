import { chromium, devices } from "playwright";
const base = process.env.BASE || "http://localhost:3000";
const [strip, normal, classic] = process.argv.slice(2);
const cases = [[strip, "scroll", "longstrip"], [normal, "book", "manga"], [classic, "book", "classic"]];
const ctxs = [[devices["iPhone 13"], "iphone"], [{ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, userAgent: devices["Pixel 5"].userAgent }, "android"]];
const b = await chromium.launch(); let fail = 0;
for (const [opts, dev] of ctxs) for (const [u, want, kind] of cases) {
  const ctx = await b.newContext(opts); const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(base + u, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector('[data-testid="immersive"]'); await p.waitForTimeout(3500);
  const mode = await p.getAttribute('[data-testid="immersive"]', "data-mode");
  const r = { dev, kind, mode, want };
  if (mode === "book") {
    r.noCrop = await p.evaluate(() => [...document.querySelectorAll(".book-page.imm img:not(.bg)")].every((i) => getComputedStyle(i).objectFit === "contain"));
    r.visible = await p.evaluate(() => { const d = [...document.querySelectorAll(".book-page.imm")].find((x) => x.getBoundingClientRect().width > 0 && x.querySelector("img:not(.bg)")?.naturalWidth); if (!d) return null; const i = d.querySelector("img:not(.bg)"); const R = d.getBoundingClientRect(), ar = i.naturalWidth / i.naturalHeight; const w = Math.min(R.width, R.height * ar), h = w / ar; return { boxW: Math.round(R.width), boxH: Math.round(R.height), drawnW: Math.round(w), drawnH: Math.round(h), fits: w <= R.width + 1 && h <= R.height + 1 }; });
    const c0 = await p.textContent('[data-testid="counter"]'); await p.click('[aria-label="Next page"]', { force: true }); await p.waitForTimeout(1200);
    const c1 = await p.textContent('[data-testid="counter"]'); await p.click('[aria-label="Previous page"]', { force: true }); await p.waitForTimeout(1200);
    r.turns = [c0, c1, await p.textContent('[data-testid="counter"]')];
    r.ok = r.noCrop && r.visible?.fits && c0 !== c1 && r.turns[2] === c0;
  } else {
    r.strip = await p.evaluate(() => { const vw = innerWidth; const im = [...document.querySelectorAll('[data-testid="strip"] img')]; const c = document.querySelector('[data-testid="immersive"]'); return { n: im.length, edgeToEdge: im.slice(0, 3).every((i) => Math.abs(i.getBoundingClientRect().width - vw) < 1 && i.getBoundingClientRect().left === 0), noHScroll: c.scrollWidth <= vw + 1, heightAuto: im.slice(0, 2).every((i) => !i.naturalWidth || Math.abs(i.getBoundingClientRect().height - (vw * i.naturalHeight) / i.naturalWidth) < 2) }; });
    const c0 = await p.textContent('[data-testid="counter"]');
    await p.evaluate(() => { const c = document.querySelector('[data-testid="immersive"]'); c.scrollTop = c.scrollHeight * 0.5; }); await p.waitForTimeout(1500);
    r.scrolled = [c0, await p.textContent('[data-testid="counter"]')];
    r.overlayFixed = await p.evaluate(() => getComputedStyle(document.querySelector('[data-testid="overlay"]')).position === "fixed");
    r.ok = r.strip.edgeToEdge && r.strip.noHScroll && r.strip.heightAuto && r.scrolled[0] !== r.scrolled[1] && r.overlayFixed;
    await p.evaluate(() => { document.querySelector('[data-testid="immersive"]').scrollTop = 0; }); await p.waitForTimeout(800);
  }
  r.ok = r.ok && mode === want && !errs.length; r.errs = errs;
  await p.screenshot({ path: `/workspace/yermanga-${dev}-${kind}.png` });
  console.log(JSON.stringify(r)); if (!r.ok) fail++; await ctx.close();
}
await b.close(); console.log(fail ? `FAIL ${fail}` : "PASS"); process.exit(fail ? 1 : 0);
