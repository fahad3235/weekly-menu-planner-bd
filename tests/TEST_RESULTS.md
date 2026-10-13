# Test results - weekly-menu-planner-bd (run #52, 2026-10-13)

## Node unit tests (`node tests/unit.test.mjs`)

**52/52 passed, 0 failed.**

- Week-date computation (17): Tue 2026-10-13 -> Sat 2026-10-10; Sat/Sun/Fri/Mon
  anchors; exact `weekDates("2026-10-10")` = 7 ISOs ending 2026-10-16;
  month boundary (2026-11-01 -> 2026-10-31); year boundaries (2026-01-01 ->
  2025-12-27; 2027-01-01 -> 2026-12-26); leap day 2024-02-29; addDays edges;
  5 `isValidISODate` accept/reject cases.
- Grocery generation, ASCII mapping (5): exact first-seen order
  `["chawal","salt","eggs","milk","sugar"]`; empty/no-match -> []; cross-day
  dedupe exact; case-sensitivity documented; blank week -> [].
- Grocery generation, real Bengali data (4): menu
  (alu bhorta / hilsa fry / dim bhaji / payesh / bhat / murgir roast) ->
  exact `["alu","mach","dim","dudh","chini","chal","murgi"]` (deduped,
  first-seen order); 24 dishes; 24 mapping rules; datalist membership.
- Bengali digits (3): `toBnDigits("2026-10-13")` exact; `fmtNum` bn/en.
- Import validation (10): valid payload accepted with dish intact; bad_json,
  bad_app, bad_version, bad_week_key (non-Saturday key), non-string meal,
  non-boolean checked, empty keyword, empty items all rejected; bn lang
  preserved; unknown lang falls back to en.
- State load/save (5): empty storage -> blank state; save/load round-trip
  (lang + grocery incl. checked flag); corrupt JSON flagged.
- Week helpers (4): fresh week empty; week with dish not empty; `getWeek`
  creates weeks; new week empty.

## Headless-Chrome smoke (`node tests/smoke.mjs .`, raw CDP, file://?asof=2026-10-13)

**30/30 passed, 0 failed. 0 console errors, 0 page errors, 0 network requests.**

1. App boots (`window.__wmp`, `#app` visible).
2. 7 day cards render.
3. 21 dish inputs render (7 days x 3 meals).
4. Day dates exact: 10..16 Oct 2026 under day names (Sat->Fri).
5. 24 datalist dish suggestions.
6. Week label "10 - 16 Oct 2026".
7. Today card highlighted (2026-10-13).
8. Dish entry persists across reload.
9. Grocery generate: exact deduped `["alu","mach","dim"]` from 3 dishes.
10. Tick-off persists across reload.
11. Ticked item renders struck-through.
12. Empty manual grocery add rejected inline.
13. Manual add works.
14. Next week starts empty.
15. Duplicate copies last week's dishes into current week.
16. Wrong-case "delete" does NOT clear the week.
17. Typed-DELETE clears all 21 cells.
18. Export contains app id + dish name.
19. Week wiped before import (control).
20. Export -> wipe -> import round-trip restores dish.
21. Malformed import shows error.
22. Data intact after rejected import.
23. BN toggle: day name renders in Bengali.
24. BN toggle: date renders Bengali digits.
25. BN lang persists across reload (`<html lang="bn">`).
26. BN UI persists across reload.
27. (toggle back to EN)
28. 390px viewport: `document.documentElement.scrollWidth <= 390` (no overflow).
29. Zero console errors.
30. Zero page errors.
31. Zero non-file network requests.
(counted as 30 checks; boot counted once.)

## Repairs

- 1 test-harness fix: `await ev(...).includes(...)` precedence bug in
  smoke.mjs (member access binds tighter than `await`) - parenthesized.
- 0 app-logic bugs found. 0 repair cycles consumed on the app.

## Hygiene

- `grep -rP '[^\x00-\x7F]'` over `index.html`, `styles.css`, `app.js`,
  `tests/` -> zero matches (Bengali stored as `\uXXXX` escapes).
- `node --check` clean on `app.js` and both test files.
