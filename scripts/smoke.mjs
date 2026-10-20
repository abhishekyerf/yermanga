// Desktop book-reader regression test (mobile is covered by smoke-mobile.mjs).
import { chromium, devices } from "playwright";
const base = process.env.BASE || "http://localhost:3000";
const urls = [process.argv[2] || "/classics/atomic-war-01/read", process.argv[3]].filter(Boolean);
const b = await chromium.launch(); let fail = 0;
for (const [ctxOpts, name] of [[{ viewport: { width: 1280, height: 900 } }, "desktop"]].concat(process.env.LEGACY_MOBILE ? [ [devices["iPhone 13"], "mobile"], [{ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, userAgent: devices["Pixel 5"].userAgent }, "android"]] : [])) for (const u of urls) {
  const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage(); const errs = []; const mob = name !== "desktop";
  p.on("pageerror", (e) => errs.push("pageerror " + e.message)); p.on("console", (m) => m.type() === "error" && errs.push("console " + m.text()));
  await p.goto(base + u, { waitUntil: "networkidle", timeout: 90000 });
  await p.evaluate(() => localStorage.removeItem("ym-mode"));
  await p.waitForSelector(".stf__parent", { timeout: 30000 });
  let imm = null;
  if (mob) {
    const box = await p.locator('[data-testid="immersive"]').boundingBox();
    const navCovered = await p.evaluate(() => !!document.elementFromPoint(20, 20)?.closest('[data-testid="immersive"]'));
    const book = await p.locator(".stf__parent").boundingBox();
    const vp = p.viewportSize();
    await p.mouse.click(vp.width / 2, vp.height / 2); await p.waitForTimeout(400);
    const op1 = await p.evaluate(() => getComputedStyle(document.querySelector('[data-testid="immersive"] > div.z-20')).opacity);
    await p.waitForTimeout(3000);
    const pageInfo = await p.evaluate(() => { const vh = innerHeight; const items = [...document.querySelectorAll(".book-page.imm")].filter((d) => d.getBoundingClientRect().width > 0 && getComputedStyle(d).display !== "none"); const d = items[0]; const im = d?.querySelector("img:not(.bg)"); const r = d?.getBoundingClientRect(); const ar = im ? im.naturalWidth / im.naturalHeight : 0;
      // rendered image content height inside the page box (object-fit aware)
      const fit = d?.dataset.fit; const contentH = fit === "contain" ? Math.min(r.height, r.width / ar) : r.height;
      const bar = document.querySelector('[data-testid="immersive"] > div.z-20 > div'); const bs = bar && getComputedStyle(bar);
      return { pageH: r && Math.round(r.height), vh, fillPct: r ? Math.round((contentH / vh) * 100) : 0, aspect: +ar.toFixed(2), fit, fits: [...document.querySelectorAll(".book-page.imm")].reduce((a, x) => (x.dataset.fit && (a[x.dataset.fit] = (a[x.dataset.fit] || 0) + 1), a), {}), overlayAbs: getComputedStyle(bar.parentElement).position === "absolute", blur: bs?.backdropFilter, hiddenByDefault: getComputedStyle(bar.parentElement).opacity === "0" }; });
    imm = { pageInfo, full: box && box.height >= vp.height - 1 && box.width >= vp.width - 1, navCovered, bookFits: book && book.height <= vp.height + 1 && book.width <= vp.width + 1, toggledOpacity: op1 };
    await p.screenshot({ path: `/workspace/yermanga-${name}-${urls.indexOf(u)}.png` });
  }
  const c0 = await p.textContent('[data-testid="counter"]');
  await p.keyboard.press("ArrowRight"); await p.waitForTimeout(1200);
  const c1 = await p.textContent('[data-testid="counter"]');
  await p.click('[aria-label="Next page"]', { force: true }); await p.waitForTimeout(1200);
  const c2 = await p.textContent('[data-testid="counter"]');
  await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(1200);
  const c3 = await p.textContent('[data-testid="counter"]');
  const loaded = await p.evaluate(() => [...document.querySelectorAll(".book-page img")].filter((i) => i.complete && i.naturalWidth > 0).length);
  await p.reload({ waitUntil: "networkidle" }); await p.waitForSelector(".stf__parent"); await p.waitForTimeout(800);
  const cR = await p.textContent('[data-testid="counter"]');
  await p.click("button:has-text('Scroll')", { force: true }); await p.waitForTimeout(1500);
  const scrollImgs = await p.locator("[data-scroll-page]").count();
  await p.screenshot({ path: `/tmp/smoke-${name}-${urls.indexOf(u)}.png` });
  const turned = c0 !== c1 && c1 !== c2 && c3 === c1 && cR === c1;
  console.log(name, u, { imm, c0, c1, c2, c3, afterReload: cR, loadedImgs: loaded, scrollImgs, errs });
  if (!turned || errs.length || !loaded || (mob && !(imm.full && imm.navCovered && imm.bookFits && imm.pageInfo.overlayAbs && imm.pageInfo.hiddenByDefault))) fail++;
  if (mob) { await p.click("text=Book"); await p.waitForSelector('[aria-label="Close reader"]'); await p.click('[aria-label="Close reader"]', { force: true }); await p.waitForURL((x) => !/read/.test(x.pathname), { timeout: 20000 }); }
  await ctx.close();
}
await b.close(); console.log(fail ? `FAIL ${fail}` : "PASS"); process.exit(fail ? 1 : 0);
