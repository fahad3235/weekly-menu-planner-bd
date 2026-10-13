// Headless-Chrome smoke tests for weekly-menu-planner-bd (raw CDP, file:// + ?asof=).
// Pure ASCII sources; Bengali literals are \uXXXX escapes (generated).
import { launchChrome, waitPort, newPage, CDP, sleep } from "./cdp.mjs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const SAT_BN = "\u09b6\u09a8\u09bf\u09ac\u09be\u09b0";
const TEN_BN = "\u09e7\u09e6";
const ALU_BHORTA = "\u0986\u09b2\u09c1 \u09ad\u09b0\u09cd\u09a4\u09be";
const HILSA = "\u0987\u09b2\u09bf\u09b6 \u09ae\u09be\u099b \u09ad\u09be\u099c\u09bf";
const DIM_BHAJI = "\u09a1\u09bf\u09ae \u09ad\u09be\u099c\u09bf";
const ALU = "\u0986\u09b2\u09c1";
const MACH = "\u09ae\u09be\u099b";
const DIM = "\u09a1\u09bf\u09ae";

const DIR = path.resolve(process.argv[2] || ".");
const PAGE_URL = pathToFileURL(path.join(DIR, "index.html")).href + "?asof=2026-10-13";
const PORT = 9341 + (process.pid % 400);

let pass = 0, fail = 0;
const failures = [];
function check(c, msg, extra) {
  if (c) { pass++; }
  else { fail++; failures.push(msg + (extra !== undefined ? " | got: " + JSON.stringify(extra) : "")); }
}

const proc = launchChrome(PORT);
const errors = { console: [], page: [] };
const netReqs = [];
let cdp;
try {
  await waitPort(PORT);
  const page = await newPage(PORT, PAGE_URL);
  cdp = new CDP(page.webSocketDebuggerUrl);
  await cdp.connect();
  cdp.on("Runtime.consoleAPICalled", p => {
    if (p.type === "error") errors.console.push(JSON.stringify(p.args).slice(0, 300));
  });
  cdp.on("Log.entryAdded", p => {
    if (p.entry.level === "error") errors.console.push(p.entry.text.slice(0, 300));
  });
  cdp.on("Runtime.exceptionThrown", p => {
    errors.page.push((p.exceptionDetails.text || "exception").slice(0, 300));
  });
  cdp.on("Network.requestWillBeSent", p => { netReqs.push(p.request.url); });
  await cdp.send("Runtime.enable"); await cdp.send("Page.enable");
  await cdp.send("Network.enable"); await cdp.send("Log.enable");

  const ev = (js) => cdp.eval(js);
  async function waitFor(js, tries = 50) {
    for (let i = 0; i < tries; i++) {
      try { if (await ev(js)) return true; } catch (e) {}
      await sleep(150);
    }
    return false;
  }
  async function reload() {
    await cdp.send("Page.navigate", { url: PAGE_URL });
    await waitFor("!!window.__wmp && !document.getElementById('app').hidden");
  }
  const setInput = (sel, val) => ev(
    `(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.value = ${JSON.stringify(val)}; e.dispatchEvent(new Event('change', {bubbles:true})); return true; })()`);
  const click = (sel) => ev(
    `(() => { document.querySelector(${JSON.stringify(sel)}).click(); return true; })()`);

  check(await waitFor("!!window.__wmp && !document.getElementById('app').hidden"), "app booted");

  // 1. grid: 7 days x 3 meals, dates under day names (asof 2026-10-13 -> Sat 10 .. Fri 16 Oct 2026)
  check(await ev("document.querySelectorAll('.day-card').length") === 7, "7 day cards");
  check(await ev("document.querySelectorAll('.dish-input').length") === 21, "21 dish inputs (7x3)");
  const dates = await ev("[...document.querySelectorAll('.day-date')].map(e=>e.textContent)");
  check(JSON.stringify(dates) === JSON.stringify(["10 Oct 2026","11 Oct 2026","12 Oct 2026","13 Oct 2026","14 Oct 2026","15 Oct 2026","16 Oct 2026"]),
    "day dates Sat 10 .. Fri 16 Oct 2026", dates);
  check(await ev("document.querySelectorAll('#dishList option').length") === 24, "24 datalist suggestions");
  check(await ev("document.getElementById('weekLabel').textContent") === "10 - 16 Oct 2026", "week label", await ev("document.getElementById('weekLabel').textContent"));
  check(await ev("!!document.querySelector('.day-card.today')"), "today card highlighted");

  // 2. add dish persists across reload
  await setInput(".day-card:nth-child(1) .meal:nth-child(2) .dish-input", ALU_BHORTA);
  await sleep(200);
  await reload();
  check(await ev("document.querySelector('.day-card:nth-child(1) .meal:nth-child(2) .dish-input').value") === ALU_BHORTA,
    "dish persists across reload");

  // 3. grocery: plan 3 dishes, generate, exact items
  await setInput(".day-card:nth-child(1) .meal:nth-child(3) .dish-input", HILSA);
  await setInput(".day-card:nth-child(1) .meal:nth-child(4) .dish-input", DIM_BHAJI);
  await sleep(200);
  await click("#genBtn");
  await sleep(200);
  const gnames = await ev("[...document.querySelectorAll('#groceryList .g-name')].map(e=>e.textContent)");
  check(JSON.stringify(gnames) === JSON.stringify([ALU, MACH, DIM]), "grocery generated exact dedupe", gnames);

  // 4. tick-off persists across reload
  await ev(`(() => { const cb = document.querySelector('#groceryList .g-check'); cb.checked = true; cb.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
  await sleep(200);
  await reload();
  check(await ev("document.querySelector('#groceryList .g-check').checked") === true, "tick persists across reload");
  check((await ev("document.querySelector('#groceryList .g-item').className")).includes("done"), "ticked item struck through");

  // 5. manual add + validation
  await setInput("#addItemInput", "  ");
  await click("#addItemBtn");
  await sleep(200);
  check(await ev("document.querySelectorAll('#groceryList .g-item').length") === 3, "empty manual add rejected");
  await ev(`(() => { const e = document.getElementById('addItemInput'); e.value = 'TestItem9'; document.getElementById('addItemBtn').click(); return true; })()`);
  await sleep(200);
  check(await ev("document.querySelectorAll('#groceryList .g-item').length") === 4, "manual add works");

  // 6. duplicate last week into next week
  await click("#nextWeek");
  await sleep(300);
  check(await ev("document.querySelector('.day-card:nth-child(1) .meal:nth-child(2) .dish-input').value") === "", "next week starts empty");
  await click("#dupBtn");
  await sleep(300);
  check(await ev("document.querySelector('.day-card:nth-child(1) .meal:nth-child(2) .dish-input').value") === ALU_BHORTA,
    "duplicate copies last week dishes");

  // 7. clear week with typed DELETE
  await ev(`(() => { document.getElementById('clearInput').value = 'delete'; document.getElementById('clearBtn').click(); return true; })()`);
  await sleep(300);
  check(await ev("document.querySelector('.day-card:nth-child(1) .meal:nth-child(2) .dish-input').value") === ALU_BHORTA,
    "wrong-case DELETE does not clear");
  await ev(`(() => { document.getElementById('clearInput').value = 'DELETE'; document.getElementById('clearBtn').click(); return true; })()`);
  await sleep(300);
  const clearedVals = await ev("[...document.querySelectorAll('.dish-input')].map(e=>e.value).filter(v=>v!=='')");
  check(clearedVals.length === 0, "typed-DELETE clears week", clearedVals.length);
  await click("#prevWeek"); // back to the original week
  await sleep(300);

  // 8. export -> wipe -> import round-trip
  await setInput(".day-card:nth-child(2) .meal:nth-child(2) .dish-input", DIM_BHAJI);
  await sleep(200);
  await click("#exportBtn");
  await sleep(300);
  const exported = await ev("document.getElementById('exportArea').value");
  check(exported.includes("weekly-menu-planner-bd") && exported.includes(DIM_BHAJI), "export contains app id + dish");
  await ev(`(() => { document.getElementById('clearInput').value = 'DELETE'; document.getElementById('clearBtn').click(); return true; })()`);
  await sleep(300);
  check(await ev("document.querySelector('.day-card:nth-child(2) .meal:nth-child(2) .dish-input').value") === "", "week wiped before import");
  await ev("document.getElementById('importArea').value = " + JSON.stringify(exported));
  await click("#importBtn");
  await sleep(300);
  check(await ev("document.querySelector('.day-card:nth-child(2) .meal:nth-child(2) .dish-input').value") === DIM_BHAJI,
    "import round-trip restores dish");

  // 9. malformed import rejected, data intact
  await ev(`(() => { document.getElementById('importArea').value = '{bad json'; document.getElementById('importBtn').click(); return true; })()`);
  await sleep(300);
  check(await ev("!document.getElementById('importErr').hidden"), "malformed import shows error");
  check(await ev("document.querySelector('.day-card:nth-child(2) .meal:nth-child(2) .dish-input').value") === DIM_BHAJI,
    "data intact after rejected import");

  // 10. BN toggle: Bengali day name + Bengali digits, persists across reload
  await click("#langBtn");
  await sleep(300);
  check(await ev("document.querySelector('.day-card:nth-child(1) .day-name').textContent") === SAT_BN, "BN day name", await ev("document.querySelector('.day-card:nth-child(1) .day-name').textContent"));
  const bnDate = await ev("document.querySelector('.day-card:nth-child(1) .day-date').textContent");
  check(bnDate.includes(TEN_BN), "BN digits in date", bnDate);
  await reload();
  check(await ev("document.documentElement.lang") === "bn", "BN lang persists across reload");
  check(await ev("document.querySelector('.day-card:nth-child(1) .day-name').textContent") === SAT_BN, "BN UI persists across reload");
  await click("#langBtn"); // back to EN
  await sleep(300);

  // 11. 390px mobile: no horizontal overflow
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(400);
  const sw = await ev("document.documentElement.scrollWidth");
  check(sw <= 390, "390px no horizontal overflow", sw);
  await cdp.send("Emulation.clearDeviceMetricsOverride");

  // 12. zero errors, zero network requests
  check(errors.console.length === 0, "zero console errors", errors.console.slice(0, 3));
  check(errors.page.length === 0, "zero page errors", errors.page.slice(0, 3));
  const ext = netReqs.filter(u => !u.startsWith("file://") && !u.startsWith("about:") && !u.startsWith("data:"));
  check(ext.length === 0, "zero network requests", ext.slice(0, 3));

  console.log("\n" + pass + " passed, " + fail + " failed");
  if (failures.length) { console.log("FAILURES:"); failures.forEach(f => console.log(" - " + f)); }
  await cdp.close();
  proc.kill();
  process.exit(fail ? 1 : 0);
} catch (e) {
  console.log("SMOKE FATAL: " + (e && e.stack || e));
  try { await cdp.close(); } catch (_) {}
  proc.kill();
  process.exit(1);
}
