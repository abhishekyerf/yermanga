import { chromium } from "playwright";
const base = process.env.BASE || "http://localhost:3000";
const urls = [process.argv[2] || "/classics/atomic-war-01/read", process.argv[3]].filter(Boolean);
const b = await chromium.launch(); let fail = 0;
for (const [vw, name] of [[{ width: 1280, height: 900 }, "desktop"], [{ width: 390, height: 844 }, "mobile"]]) for (const u of urls) {
  const p = await b.newPage({ viewport: vw }); const errs = [];
  p.on("pageerror", (e) => errs.push("pageerror " + e.message)); p.on("console", (m) => m.type() === "error" && errs.push("console " + m.text()));
  await p.goto(base + u, { waitUntil: "networkidle", timeout: 90000 });
  await p.evaluate(() => localStorage.removeItem("ym-mode"));
  await p.waitForSelector(".stf__parent", { timeout: 30000 });
  const c0 = await p.textContent('[data-testid="counter"]');
  await p.keyboard.press("ArrowRight"); await p.waitForTimeout(1200);
  const c1 = await p.textContent('[data-testid="counter"]');
  await p.click('[aria-label="Next page"]'); await p.waitForTimeout(1200);
  const c2 = await p.textContent('[data-testid="counter"]');
  await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(1200);
  const c3 = await p.textContent('[data-testid="counter"]');
  const loaded = await p.evaluate(() => [...document.querySelectorAll(".book-page img")].filter((i) => i.complete && i.naturalWidth > 0).length);
  await p.reload({ waitUntil: "networkidle" }); await p.waitForSelector(".stf__parent"); await p.waitForTimeout(800);
  const cR = await p.textContent('[data-testid="counter"]');
  await p.click("text=Scroll"); await p.waitForTimeout(1500);
  const scrollImgs = await p.locator("[data-scroll-page]").count();
  await p.screenshot({ path: `/tmp/smoke-${name}-${urls.indexOf(u)}.png` });
  const turned = c0 !== c1 && c1 !== c2 && c3 === c1 && cR === c1;
  console.log(name, u, { c0, c1, c2, c3, afterReload: cR, loadedImgs: loaded, scrollImgs, errs });
  if (!turned || errs.length || !loaded) fail++;
  await p.close();
}
await b.close(); console.log(fail ? `FAIL ${fail}` : "PASS"); process.exit(fail ? 1 : 0);
