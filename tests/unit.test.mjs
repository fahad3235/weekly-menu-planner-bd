// Node unit tests for weekly-menu-planner-bd app.js. Pure ASCII sources.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../app.js");

let pass = 0, fail = 0;
const failures = [];
function eq(a, b, msg) {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa === sb) { pass++; }
  else { fail++; failures.push(msg + " | got " + sa + " want " + sb); }
}
function ok(c, msg) {
  if (c) { pass++; } else { fail++; failures.push(msg); }
}

// localStorage stub (node has none)
global.localStorage = {
  _s: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._s, k) ? this._s[k] : null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; },
  clear() { this._s = {}; }
};

/* Bengali literals below are \uXXXX escapes (generated, pure ASCII). */
const ALU = "\u0986\u09b2\u09c1";
const ALU_BHORTA = "\u0986\u09b2\u09c1 \u09ad\u09b0\u09cd\u09a4\u09be";
const HILSA = "\u0987\u09b2\u09bf\u09b6 \u09ae\u09be\u099b \u09ad\u09be\u099c\u09bf";
const MACH = "\u09ae\u09be\u099b";
const DIM_BHAJI = "\u09a1\u09bf\u09ae \u09ad\u09be\u099c\u09bf";
const DIM = "\u09a1\u09bf\u09ae";
const PAYESH = "\u09aa\u09be\u09af\u09bc\u09c7\u09b6";
const DUDH = "\u09a6\u09c1\u09a7";
const CHINI = "\u099a\u09bf\u09a8\u09bf";
const BHAT = "\u09ad\u09be\u09a4";
const CHAL = "\u099a\u09be\u09b2";
const MURGI_ROAST = "\u09ae\u09c1\u09b0\u0997\u09bf\u09b0 \u09b0\u09cb\u09b8\u09cd\u099f";
const MURGI = "\u09ae\u09c1\u09b0\u0997\u09bf";

/* ---------- week-date computation (Bangladesh week = Saturday..Friday) ---------- */
eq(M.weekStartISO("2026-10-13"), "2026-10-10", "Tue 2026-10-13 -> Sat 2026-10-10");
eq(M.weekStartISO("2026-10-10"), "2026-10-10", "Sat stays Sat");
eq(M.weekStartISO("2026-10-11"), "2026-10-10", "Sun -> Sat");
eq(M.weekStartISO("2026-10-16"), "2026-10-10", "Fri -> Sat");
eq(M.weekStartISO("2026-10-12"), "2026-10-10", "Mon -> Sat");
eq(M.weekDates("2026-10-10"),
  ["2026-10-10","2026-10-11","2026-10-12","2026-10-13","2026-10-14","2026-10-15","2026-10-16"],
  "weekDates exact 7 days, Fri=2026-10-16");
eq(M.weekStartISO("2026-11-01"), "2026-10-31", "month boundary: Sun Nov 1 -> Sat Oct 31");
eq(M.weekStartISO("2026-01-01"), "2025-12-27", "year boundary: Thu Jan 1 -> Sat Dec 27");
eq(M.weekStartISO("2027-01-01"), "2026-12-26", "Fri Jan 1 2027 -> Sat Dec 26 2026");
eq(M.addDaysISO("2024-02-28", 1), "2024-02-29", "leap day");
eq(M.addDaysISO("2026-10-01", -1), "2026-09-30", "addDays month boundary");
eq(M.addDaysISO("2026-01-01", -1), "2025-12-31", "addDays year boundary");
eq(M.addDaysISO("2026-10-10", 6), "2026-10-16", "addDays +6 = Friday");
ok(M.isValidISODate("2026-10-13"), "valid ISO");
ok(!M.isValidISODate("2023-02-29"), "non-leap Feb29 invalid");
ok(!M.isValidISODate("2026-13-01"), "month 13 invalid");
ok(!M.isValidISODate("abc"), "garbage invalid");
ok(!M.isValidISODate("2026-1-5"), "non-padded invalid");

/* ---------- grocery generation: ASCII custom mapping (logic exactness) ---------- */
const MAP = [
  { k: "rice", items: ["chawal", "salt"] },
  { k: "egg", items: ["eggs"] },
  { k: "milk", items: ["milk", "sugar"] }
];
function menu(pairs) {
  const d = M.blankWeekDays();
  pairs.forEach(([day, meal, name]) => { d[day][meal] = name; });
  return d;
}
eq(M.generateGrocery(menu([["sat","breakfast","rice bowl"],["sat","lunch","fried egg"],["sat","dinner","milk tea"]]), MAP),
  ["chawal","salt","eggs","milk","sugar"], "grocery exact first-seen order");
eq(M.generateGrocery(menu([["sat","breakfast","  "],["sat","lunch",""],["sat","dinner","plain water"]]), MAP),
  [], "empty + no-match dishes -> empty list");
eq(M.generateGrocery(menu([["sat","breakfast","rice"],["sun","breakfast","rice porridge"],["mon","dinner","egg rice"]]), MAP),
  ["chawal","salt","eggs"], "cross-day dedupe exact");
eq(M.generateGrocery(menu([["sat","breakfast","RICE"]]), MAP),
  [], "keyword match is case-sensitive (documented)");
eq(M.generateGrocery(M.blankWeekDays(), MAP), [], "blank week -> empty");

/* ---------- grocery generation: real Bengali data, exact dedupe ---------- */
const REALMAP = M.DEFAULT_MAPPING;
const m2 = menu([
  ["sat","breakfast",ALU_BHORTA],  // keyword ALU -> ALU
  ["sat","lunch",HILSA],           // keywords HILSA-part + MACH -> MACH (deduped)
  ["sat","dinner",DIM_BHAJI],      // -> DIM
  ["sun","breakfast",PAYESH],      // -> DUDH, CHINI
  ["sun","lunch",""],
  ["sun","dinner",BHAT],           // -> CHAL
  ["mon","breakfast",MURGI_ROAST]  // -> MURGI
]);
eq(M.generateGrocery(m2, REALMAP),
  [ALU, MACH, DIM, DUDH, CHINI, CHAL, MURGI],
  "real Bengali mapping: exact order + dedupe");
eq(M.DISHES.length, 24, "24 dish suggestions");
eq(M.DEFAULT_MAPPING.length, 24, "24 mapping rules");
ok(M.DISHES.includes(ALU_BHORTA), "datalist contains ALU_BHORTA");

/* ---------- Bengali digits ---------- */
eq(M.toBnDigits("2026-10-13"), "\u09e8\u09e6\u09e8\u09ec-\u09e7\u09e6-\u09e7\u09e9", "toBnDigits exact");
eq(M.fmtNum(123, "bn"), M.toBnDigits("123"), "fmtNum bn");
eq(M.fmtNum(123, "en"), "123", "fmtNum en");

/* ---------- import validation ---------- */
function goodPayload() {
  const st = M.blankState();
  const sat = "2026-10-10";
  st.weeks[sat] = { days: M.blankWeekDays(), grocery: [{ name: "x", checked: false, auto: true }] };
  st.weeks[sat].days.sat.breakfast = BHAT;
  return JSON.stringify(st);
}
(function () {
  const r = M.validateImport(goodPayload());
  ok(r.ok, "valid payload accepted");
  eq(r.data.weeks["2026-10-10"].days.sat.breakfast, BHAT, "valid payload dish intact");
})();
eq(M.validateImport("{oops").error, "bad_json", "malformed JSON -> bad_json");
eq(M.validateImport(JSON.stringify({app:"other",version:1,weeks:{},mapping:[]})).error, "bad_app", "wrong app -> bad_app");
eq(M.validateImport(JSON.stringify({app:"weekly-menu-planner-bd",version:2,weeks:{},mapping:[]})).error, "bad_version", "wrong version -> bad_version");
eq(M.validateImport(JSON.stringify({app:"weekly-menu-planner-bd",version:1,weeks:{"2026-10-13":{days:M.blankWeekDays(),grocery:[]}},mapping:[]})).error,
  "bad_week_key", "non-Saturday week key rejected");
(function () {
  const st = M.blankState();
  st.weeks["2026-10-10"] = { days: M.blankWeekDays(), grocery: [] };
  st.weeks["2026-10-10"].days.sat.lunch = 42;
  eq(M.validateImport(JSON.stringify(st)).error, "bad_shape", "non-string meal rejected");
})();
(function () {
  const st = M.blankState();
  st.weeks["2026-10-10"] = { days: M.blankWeekDays(), grocery: [{ name: "x", checked: "yes" }] };
  eq(M.validateImport(JSON.stringify(st)).error, "bad_shape", "non-boolean checked rejected");
})();
eq(M.validateImport(JSON.stringify({app:"weekly-menu-planner-bd",version:1,weeks:{},mapping:[{k:"",items:["x"]}]})).error,
  "bad_shape", "empty keyword rejected");
eq(M.validateImport(JSON.stringify({app:"weekly-menu-planner-bd",version:1,weeks:{},mapping:[{k:"k",items:[]}]})).error,
  "bad_shape", "empty items rejected");
eq(M.validateImport(JSON.stringify({app:"weekly-menu-planner-bd",version:1,weeks:{},mapping:[{k:"k",items:["x"]}],lang:"bn"})).data.lang,
  "bn", "bn lang preserved");
eq(M.validateImport(JSON.stringify({app:"weekly-menu-planner-bd",version:1,weeks:{},mapping:[{k:"k",items:["x"]}],lang:"xx"})).data.lang,
  "en", "unknown lang falls back to en");

/* ---------- state load/save ---------- */
(function () {
  localStorage.clear();
  let r = M.loadState();
  ok(!r.corrupt && r.state.lang === "en", "empty storage -> blank state");
  const st = M.blankState();
  st.lang = "bn";
  st.weeks["2026-10-10"] = { days: M.blankWeekDays(), grocery: [{ name: ALU, checked: true, auto: false }] };
  ok(M.saveState(st), "saveState ok");
  r = M.loadState();
  ok(!r.corrupt, "saved state loads clean");
  eq(r.state.lang, "bn", "lang persists");
  eq(r.state.weeks["2026-10-10"].grocery[0], { name: ALU, checked: true, auto: false }, "grocery persists");
  localStorage.setItem(M.STORAGE_KEY, "{corrupt");
  r = M.loadState();
  ok(r.corrupt, "corrupt storage flagged");
  localStorage.clear();
})();

/* ---------- week helpers ---------- */
(function () {
  const st = M.blankState();
  const w = M.getWeek(st, "2026-10-10");
  ok(M.isWeekEmpty(w), "fresh week empty");
  w.days.sat.dinner = BHAT;
  ok(!M.isWeekEmpty(w), "week with dish not empty");
  const g = M.getWeek(st, "2026-10-17");
  eq(Object.keys(st.weeks).sort(), ["2026-10-10","2026-10-17"], "getWeek creates weeks");
  ok(M.isWeekEmpty(g), "new week empty");
})();

console.log("\\n" + pass + " passed, " + fail + " failed");
if (failures.length) {
  console.log("FAILURES:");
  failures.forEach(f => console.log(" - " + f));
  process.exit(1);
}
