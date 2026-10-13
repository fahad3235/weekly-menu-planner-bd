# Weekly Menu Planner BD

Offline bilingual (EN/Bangla) weekly meal planner for Bangladeshi families, with an
auto-generated grocery checklist.

## Problem

Many Bangladeshi families plan the week's meals (what to cook for breakfast, lunch,
and dinner each day) in a notebook or in their heads, and then build the bazar
(grocery) list from memory. This app digitizes that weekly ritual: one Sat-to-Fri
grid for the whole week's menu, plus a checklist of what to buy that is generated
from the dishes you planned.

## Features

- **Weekly grid (Saturday to Friday):** Bangladesh's week runs Saturday-Friday.
  Each of the 7 days has Breakfast / Lunch / Dinner dish fields, with the actual
  calendar date shown under each day name. Prev / Next / This-week navigation.
- **Dish suggestions:** a 24-item datalist of common Bangladeshi dishes
  (hardcoded names only - no nutritional claims, no fabricated data).
- **Auto grocery checklist:** candidate grocery items are generated from the
  week's planned dishes via an editable keyword-to-grocery mapping
  (e.g. a dish containing "alu" suggests "alu"). Manual add, tick-off
  checkboxes, remove-checked, per-item delete. Checked state persists.
- **Print-friendly menu:** print CSS renders just the week grid as a clean
  menu poster (tools, grocery, and nav are hidden on paper).
- **Week tools:** duplicate last week's menu into the current week; clear week
  behind a typed-`DELETE` confirmation; JSON export (download + textarea) and
  import with strict validation (malformed files are rejected, current data
  stays intact).
- **Bilingual EN/Bangla:** full UI toggle persisted in localStorage, Bengali
  digit rendering (e.g. 2026-10-13 renders with Bangla digits in BN mode).
- **Validation & states:** empty dish names are never saved; empty grocery
  items are rejected inline; empty-week / empty-list / import-error states;
  loading indicator on boot.
- **100% offline:** pure static files, zero network requests, no secrets,
  everything in localStorage.

## Stack

Vanilla HTML + CSS + JavaScript. No build step, no CDN, no dependencies.
Pure-ASCII sources: all Bengali text is stored as `\uXXXX` escapes in `app.js`
(verified with `grep -P`), so the GitHub push-API transport stays ASCII-safe.

## Prerequisites

Any modern browser (Chrome, Firefox, Edge, Safari). Node.js 18+ only if you
want to run the test suites.

## Install / run

No install needed - it is static files:

```bash
cd builds/weekly-menu-planner-bd
python3 -m http.server 8080   # or: npx serve .
# open http://localhost:8080/
```

It also works straight from `file://` (double-click `index.html`).

## Usage

1. Pick dishes for each Breakfast / Lunch / Dinner cell (type or choose from
   the suggestion list). Entries save automatically.
2. Open the **Grocery checklist** panel and press **Generate from menu** to
   build the week's shopping list; tick items off as you buy them.
3. Tune the **Keyword mapping** table if a dish suggests the wrong groceries.
4. Use **Week tools** to duplicate last week's menu, or clear the week
   (type `DELETE` to confirm).
5. **Backup & restore**: download the JSON export; paste it back into the
   import box on any device to restore.
6. **Print menu** (or Ctrl+P) prints just the week grid.

Tip: append `?asof=YYYY-MM-DD` to the URL to preview the app as of a fixed
date (used by the smoke tests).

## Testing

```bash
cd builds/weekly-menu-planner-bd
node tests/unit.test.mjs        # pure-logic unit tests (no browser)
node tests/smoke.mjs .          # headless-Chrome smoke tests (raw CDP, file://)
```

Results (2026-10-13): **52/52** node unit tests + **30/30** headless-Chrome
smoke checks, 0 console/page errors, 0 network requests. One test-harness fix
(`await` precedence in an assertion); zero app-logic bugs found. Details in
`tests/TEST_RESULTS.md`.

## Deployment (GitHub Pages)

1. Create a repo named `weekly-menu-planner-bd` (the GitHub API cannot create
   repos - use the web UI), push `index.html`, `styles.css`, `app.js`,
   `README.md`, `.gitignore` to `main`.
2. Settings > Pages > Deploy from branch > `main` / root.
3. The site is live at `https://<user>.github.io/weekly-menu-planner-bd/`.

## Limitations

- Data lives in the browser's localStorage - clearing site data erases it.
  Use the JSON export for backups.
- The keyword->grocery mapping is a simple substring heuristic, not a real
  ingredient database; review generated items before shopping.
- Dish suggestions are name-only; the app makes no nutritional or
  health claims.
- One device at a time - no sync between devices (import/export bridges it).
- Week navigation keeps every visited week in storage; very long use can be
  trimmed via export/clear.

## Status

Built 2026-10-13 (factory run #52, 12:00 slot). Local build + tests complete;
publish pending. `BUILT_NOT_PUBLISHED`.
