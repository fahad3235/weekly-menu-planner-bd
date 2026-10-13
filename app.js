/* Weekly Menu Planner BD - offline bilingual EN/BN weekly meal planner.
 * Pure static: no build step, no CDN, zero network requests.
 * This source file is pure ASCII; all Bengali text is stored as \uXXXX escapes
 * (injected at build time) so GitHub's push API transport stays ASCII-safe.
 */
(function () {
"use strict";

/* ============================== pure logic ============================== */

var STORAGE_KEY = "weekly-menu-planner-bd:v1";
var APP_ID = "weekly-menu-planner-bd";
var STATE_VERSION = 1;

var DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
var MEALS = ["breakfast", "lunch", "dinner"];

var STR = {
  en: {
    appTitle: "Weekly Menu Planner BD",
    appSub: "Weekly meal planning + grocery checklist for Bangladeshi families - 100% offline",
    prevWeek: "Previous week",
    nextWeek: "Next week",
    thisWeek: "This week",
    weekTools: "Week tools",
    duplicateWeek: "Duplicate last week's menu",
    clearWeek: "Clear this week",
    clearConfirmLabel: "Type DELETE to confirm:",
    clearPh: "DELETE",
    clearBtn: "Clear week",
    clearMismatch: "Type DELETE exactly to clear the week.",
    cleared: "This week's menu was cleared.",
    duplicated: "Last week's menu was copied into this week.",
    noLastWeek: "No menu found for last week.",
    groceryTitle: "Grocery checklist",
    genGrocery: "Generate from menu",
    addItemPh: "Add a grocery item...",
    addBtn: "Add",
    emptyGrocery: "List is empty. Generate from the menu or add items manually.",
    mappingTitle: "Keyword mapping",
    mappingHint: "If a dish name contains a keyword, its grocery items are suggested.",
    keywordPh: "Keyword",
    itemsPh: "Items (comma separated)",
    addRule: "Add rule",
    ruleAdded: "Rule added.",
    ruleRemoved: "Rule removed.",
    exportTitle: "Backup & restore",
    exportBtn: "Download JSON",
    importBtn: "Import",
    importPh: "Paste exported JSON here...",
    imported: "Data imported successfully.",
    printBtn: "Print menu",
    today: "Today",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    days: { sat: "Saturday", sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    dishPh: "Type a dish name or pick a suggestion...",
    emptyItemErr: "Item name cannot be empty.",
    generated: "Added {n} item(s) from the menu.",
    removeChecked: "Remove checked",
    checkedRemoved: "Checked items removed.",
    langBtn: "\u09ac\u09be\u0982\u09b2\u09be",
    footer: "Personal offline tool - nothing leaves your device.",
    loading: "Loading...",
    importErr: {
      bad_json: "Import rejected: invalid JSON, could not parse the text.",
      bad_shape: "Import rejected: data shape is invalid. Current data unchanged.",
      bad_app: "Import rejected: this file is not from Weekly Menu Planner BD.",
      bad_version: "Import rejected: unsupported data version.",
      bad_week_key: "Import rejected: invalid week key."
    }
  },
  bn: {"appTitle": "\u09b8\u09be\u09aa\u09cd\u09a4\u09be\u09b9\u09bf\u0995 \u09ae\u09c7\u09a8\u09c1 \u09aa\u09cd\u09b2\u09cd\u09af\u09be\u09a8\u09be\u09b0", "appSub": "\u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6\u09bf \u09aa\u09b0\u09bf\u09ac\u09be\u09b0\u09c7\u09b0 \u09b8\u09be\u09aa\u09cd\u09a4\u09be\u09b9\u09bf\u0995 \u0996\u09be\u09ac\u09be\u09b0 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u0993 \u09ac\u09be\u099c\u09be\u09b0\u09c7\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be \u2014 \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u0985\u09ab\u09b2\u09be\u0987\u09a8", "prevWeek": "\u0986\u0997\u09c7\u09b0 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9", "nextWeek": "\u09aa\u09b0\u09c7\u09b0 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9", "thisWeek": "\u098f\u0987 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9", "weekTools": "\u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u09b8\u09b0\u099e\u09cd\u099c\u09be\u09ae", "duplicateWeek": "\u0997\u09a4 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u09ae\u09c7\u09a8\u09c1 \u09a8\u0995\u09b2 \u0995\u09b0\u09c1\u09a8", "clearWeek": "\u098f\u0987 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u09ae\u09c7\u09a8\u09c1 \u09ae\u09c1\u099b\u09c1\u09a8", "clearConfirmLabel": "\u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8:", "clearPh": "DELETE", "clearBtn": "\u09b8\u09aa\u09cd\u09a4\u09be\u09b9 \u09ae\u09c1\u099b\u09c1\u09a8", "clearMismatch": "\u09b8\u09aa\u09cd\u09a4\u09be\u09b9 \u09ae\u09c1\u099b\u09a4\u09c7 \u09a0\u09bf\u0995 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964", "cleared": "\u098f\u0987 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u09ae\u09c7\u09a8\u09c1 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964", "duplicated": "\u0997\u09a4 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u09ae\u09c7\u09a8\u09c1 \u098f\u0987 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7 \u09a8\u0995\u09b2 \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964", "noLastWeek": "\u0997\u09a4 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u0995\u09cb\u09a8\u09cb \u09ae\u09c7\u09a8\u09c1 \u09aa\u09be\u0993\u09af\u09bc\u09be \u09af\u09be\u09af\u09bc\u09a8\u09bf\u0964", "groceryTitle": "\u09ac\u09be\u099c\u09be\u09b0\u09c7\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be", "genGrocery": "\u09ae\u09c7\u09a8\u09c1 \u09a5\u09c7\u0995\u09c7 \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8", "addItemPh": "\u09ac\u09be\u099c\u09be\u09b0\u09c7\u09b0 \u0986\u0987\u099f\u09c7\u09ae \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u2026", "addBtn": "\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8", "emptyGrocery": "\u09a4\u09be\u09b2\u09bf\u0995\u09be \u0996\u09be\u09b2\u09bf\u0964 \u09ae\u09c7\u09a8\u09c1 \u09a5\u09c7\u0995\u09c7 \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8 \u09ac\u09be \u09a8\u09bf\u099c\u09c7 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964", "mappingTitle": "\u0995\u09c0\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1 \u09ae\u09cd\u09af\u09be\u09aa\u09bf\u0982", "mappingHint": "\u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09a8\u09be\u09ae\u09c7 \u0995\u09c0\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1 \u09a5\u09be\u0995\u09b2\u09c7 \u09b8\u0982\u09b6\u09cd\u09b2\u09bf\u09b7\u09cd\u099f \u09ac\u09be\u099c\u09be\u09b0 \u0986\u0987\u099f\u09c7\u09ae \u09af\u09cb\u0997 \u09b9\u09ac\u09c7\u0964", "keywordPh": "\u0995\u09c0\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1", "itemsPh": "\u0986\u0987\u099f\u09c7\u09ae (\u0995\u09ae\u09be \u09a6\u09bf\u09af\u09bc\u09c7 \u0986\u09b2\u09be\u09a6\u09be \u0995\u09b0\u09c1\u09a8)", "addRule": "\u09a8\u09bf\u09af\u09bc\u09ae \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8", "ruleAdded": "\u09a8\u09bf\u09af\u09bc\u09ae \u09af\u09cb\u0997 \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964", "ruleRemoved": "\u09a8\u09bf\u09af\u09bc\u09ae \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964", "exportTitle": "\u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u0993 \u09aa\u09c1\u09a8\u09b0\u09c1\u09a6\u09cd\u09a7\u09be\u09b0", "exportBtn": "JSON \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1", "importBtn": "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u0995\u09b0\u09c1\u09a8", "importPh": "\u09b0\u09aa\u09cd\u09a4\u09be\u09a8\u09bf \u0995\u09b0\u09be JSON \u098f\u0996\u09be\u09a8\u09c7 \u09aa\u09c7\u09b8\u09cd\u099f \u0995\u09b0\u09c1\u09a8\u2026", "imported": "\u09a1\u09c7\u099f\u09be \u09b8\u09ab\u09b2\u09ad\u09be\u09ac\u09c7 \u0986\u09ae\u09a6\u09be\u09a8\u09bf \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964", "printBtn": "\u09ae\u09c7\u09a8\u09c1 \u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f \u0995\u09b0\u09c1\u09a8", "today": "\u0986\u099c", "breakfast": "\u09b8\u0995\u09be\u09b2\u09c7\u09b0 \u09a8\u09be\u09b8\u09cd\u09a4\u09be", "lunch": "\u09a6\u09c1\u09aa\u09c1\u09b0\u09c7\u09b0 \u0996\u09be\u09ac\u09be\u09b0", "dinner": "\u09b0\u09be\u09a4\u09c7\u09b0 \u0996\u09be\u09ac\u09be\u09b0", "days": {"sat": "\u09b6\u09a8\u09bf\u09ac\u09be\u09b0", "sun": "\u09b0\u09ac\u09bf\u09ac\u09be\u09b0", "mon": "\u09b8\u09cb\u09ae\u09ac\u09be\u09b0", "tue": "\u09ae\u0999\u09cd\u0997\u09b2\u09ac\u09be\u09b0", "wed": "\u09ac\u09c1\u09a7\u09ac\u09be\u09b0", "thu": "\u09ac\u09c3\u09b9\u09b8\u09cd\u09aa\u09a4\u09bf\u09ac\u09be\u09b0", "fri": "\u09b6\u09c1\u0995\u09cd\u09b0\u09ac\u09be\u09b0"}, "months": ["\u099c\u09be\u09a8\u09c1\u09af\u09bc\u09be\u09b0\u09bf", "\u09ab\u09c7\u09ac\u09cd\u09b0\u09c1\u09af\u09bc\u09be\u09b0\u09bf", "\u09ae\u09be\u09b0\u09cd\u099a", "\u098f\u09aa\u09cd\u09b0\u09bf\u09b2", "\u09ae\u09c7", "\u099c\u09c1\u09a8", "\u099c\u09c1\u09b2\u09be\u0987", "\u0986\u0997\u09b8\u09cd\u099f", "\u09b8\u09c7\u09aa\u09cd\u099f\u09c7\u09ae\u09cd\u09ac\u09b0", "\u0985\u0995\u09cd\u099f\u09cb\u09ac\u09b0", "\u09a8\u09ad\u09c7\u09ae\u09cd\u09ac\u09b0", "\u09a1\u09bf\u09b8\u09c7\u09ae\u09cd\u09ac\u09b0"], "dishPh": "\u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09a8\u09be\u09ae \u09b2\u09bf\u0996\u09c1\u09a8 \u09ac\u09be \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u09a5\u09c7\u0995\u09c7 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8\u2026", "emptyItemErr": "\u0986\u0987\u099f\u09c7\u09ae\u09c7\u09b0 \u09a8\u09be\u09ae \u0996\u09be\u09b2\u09bf \u09b0\u09be\u0996\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964", "generated": "\u09ae\u09c7\u09a8\u09c1 \u09a5\u09c7\u0995\u09c7 {n}\u099f\u09bf \u0986\u0987\u099f\u09c7\u09ae \u09af\u09cb\u0997 \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964", "removeChecked": "\u099f\u09bf\u0995 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u0986\u0987\u099f\u09c7\u09ae \u09ae\u09c1\u099b\u09c1\u09a8", "checkedRemoved": "\u099f\u09bf\u0995 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u0986\u0987\u099f\u09c7\u09ae \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964", "langBtn": "English", "footer": "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u0985\u09ab\u09b2\u09be\u0987\u09a8 \u099f\u09c1\u09b2 \u2014 \u0995\u09cb\u09a8\u09cb \u09a1\u09c7\u099f\u09be \u09a1\u09bf\u09ad\u09be\u0987\u09b8\u09c7\u09b0 \u09ac\u09be\u0987\u09b0\u09c7 \u09af\u09be\u09af\u09bc \u09a8\u09be\u0964", "loading": "\u09b2\u09cb\u09a1 \u09b9\u099a\u09cd\u099b\u09c7\u2026", "importErr": {"bad_json": "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09ac\u09be\u09a4\u09bf\u09b2: \u09ad\u09c1\u09b2 JSON, \u099f\u09c7\u0995\u09cd\u09b8\u099f \u09aa\u09be\u09b0\u09cd\u09b8 \u0995\u09b0\u09be \u09af\u09be\u09af\u09bc\u09a8\u09bf\u0964", "bad_shape": "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09ac\u09be\u09a4\u09bf\u09b2: \u09a1\u09c7\u099f\u09be\u09b0 \u0997\u09a0\u09a8 \u09b8\u09a0\u09bf\u0995 \u09a8\u09af\u09bc\u0964 \u09ac\u09b0\u09cd\u09a4\u09ae\u09be\u09a8 \u09a1\u09c7\u099f\u09be \u0985\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09bf\u09a4 \u0986\u099b\u09c7\u0964", "bad_app": "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09ac\u09be\u09a4\u09bf\u09b2: \u098f\u0987 \u09ab\u09be\u0987\u09b2 Weekly Menu Planner BD-\u098f\u09b0 \u09a8\u09af\u09bc\u0964", "bad_version": "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09ac\u09be\u09a4\u09bf\u09b2: \u0985\u09b8\u09ae\u09b0\u09cd\u09a5\u09bf\u09a4 \u09a1\u09c7\u099f\u09be \u09b8\u0982\u09b8\u09cd\u0995\u09b0\u09a3\u0964", "bad_week_key": "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09ac\u09be\u09a4\u09bf\u09b2: \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u0995\u09c0 \u09b8\u09a0\u09bf\u0995 \u09a8\u09af\u09bc\u0964"}}
};

var DISHES = ["\u09ad\u09be\u09a4", "\u09a1\u09be\u09b2", "\u0996\u09bf\u099a\u09c1\u09a1\u09bc\u09bf", "\u09aa\u09cb\u09b2\u09be\u0993", "\u09ac\u09bf\u09b0\u09bf\u09af\u09bc\u09be\u09a8\u09bf", "\u09a4\u09c7\u09b9\u09be\u09b0\u09bf", "\u09ae\u09cb\u09b0\u0997 \u09aa\u09cb\u09b2\u09be\u0993", "\u0995\u09be\u099a\u09cd\u099a\u09bf \u09ac\u09bf\u09b0\u09bf\u09af\u09bc\u09be\u09a8\u09bf", "\u09b0\u09c1\u099f\u09bf", "\u09aa\u09b0\u09cb\u099f\u09be", "\u09ae\u09c1\u09b0\u0997\u09bf\u09b0 \u09b0\u09cb\u09b8\u09cd\u099f", "\u0997\u09b0\u09c1\u09b0 \u09ae\u09be\u0982\u09b8 \u09ad\u09c1\u09a8\u09be", "\u0996\u09be\u09b8\u09bf\u09b0 \u09ae\u09be\u0982\u09b8\u09c7\u09b0 \u099d\u09cb\u09b2", "\u0987\u09b2\u09bf\u09b6 \u09ae\u09be\u099b \u09ad\u09be\u099c\u09bf", "\u09b0\u09c1\u0987 \u09ae\u09be\u099b\u09c7\u09b0 \u099d\u09cb\u09b2", "\u099a\u09bf\u0982\u09a1\u09bc\u09bf \u09ad\u09c1\u09a8\u09be", "\u09aa\u09be\u09ac\u09a6\u09be \u09ae\u09be\u099b\u09c7\u09b0 \u099d\u09cb\u09b2", "\u09b6\u09c1\u099f\u0995\u09bf \u09ad\u09b0\u09cd\u09a4\u09be", "\u0986\u09b2\u09c1 \u09ad\u09b0\u09cd\u09a4\u09be", "\u09ac\u09c7\u0997\u09c1\u09a8 \u09ad\u09be\u099c\u09bf", "\u09b6\u09be\u0995 \u09ad\u09be\u099c\u09bf", "\u09ae\u09bf\u0995\u09cd\u09b8\u09a1 \u09b8\u09ac\u099c\u09bf", "\u09a1\u09bf\u09ae \u09ad\u09be\u099c\u09bf", "\u09aa\u09be\u09af\u09bc\u09c7\u09b6"];           // array of dish-name strings
var DEFAULT_MAPPING = [{"k": "\u09ad\u09be\u09a4", "items": ["\u099a\u09be\u09b2"]}, {"k": "\u0996\u09bf\u099a\u09c1\u09a1\u09bc\u09bf", "items": ["\u099a\u09be\u09b2"]}, {"k": "\u09aa\u09cb\u09b2\u09be\u0993", "items": ["\u099a\u09be\u09b2"]}, {"k": "\u09ac\u09bf\u09b0\u09bf\u09af\u09bc\u09be\u09a8\u09bf", "items": ["\u099a\u09be\u09b2"]}, {"k": "\u09a4\u09c7\u09b9\u09be\u09b0\u09bf", "items": ["\u099a\u09be\u09b2"]}, {"k": "\u09a1\u09be\u09b2", "items": ["\u09ae\u09b8\u09c1\u09b0 \u09a1\u09be\u09b2"]}, {"k": "\u09b0\u09c1\u099f\u09bf", "items": ["\u0986\u099f\u09be"]}, {"k": "\u09aa\u09b0\u09cb\u099f\u09be", "items": ["\u0986\u099f\u09be"]}, {"k": "\u09ae\u09c1\u09b0\u0997\u09bf", "items": ["\u09ae\u09c1\u09b0\u0997\u09bf"]}, {"k": "\u09ae\u09cb\u09b0\u0997", "items": ["\u09ae\u09c1\u09b0\u0997\u09bf"]}, {"k": "\u0997\u09b0\u09c1", "items": ["\u0997\u09b0\u09c1\u09b0 \u09ae\u09be\u0982\u09b8"]}, {"k": "\u0996\u09be\u09b8\u09bf", "items": ["\u0996\u09be\u09b8\u09bf\u09b0 \u09ae\u09be\u0982\u09b8"]}, {"k": "\u0987\u09b2\u09bf\u09b6", "items": ["\u09ae\u09be\u099b"]}, {"k": "\u09b0\u09c1\u0987", "items": ["\u09ae\u09be\u099b"]}, {"k": "\u099a\u09bf\u0982\u09a1\u09bc\u09bf", "items": ["\u099a\u09bf\u0982\u09a1\u09bc\u09bf \u09ae\u09be\u099b"]}, {"k": "\u09aa\u09be\u09ac\u09a6\u09be", "items": ["\u09ae\u09be\u099b"]}, {"k": "\u09ae\u09be\u099b", "items": ["\u09ae\u09be\u099b"]}, {"k": "\u09b6\u09c1\u099f\u0995\u09bf", "items": ["\u09b6\u09c1\u099f\u0995\u09bf \u09ae\u09be\u099b"]}, {"k": "\u0986\u09b2\u09c1", "items": ["\u0986\u09b2\u09c1"]}, {"k": "\u09ac\u09c7\u0997\u09c1\u09a8", "items": ["\u09ac\u09c7\u0997\u09c1\u09a8"]}, {"k": "\u09b6\u09be\u0995", "items": ["\u09b6\u09be\u0995"]}, {"k": "\u09b8\u09ac\u099c\u09bf", "items": ["\u09ae\u09cc\u09b8\u09c1\u09ae\u09bf \u09b8\u09ac\u099c\u09bf"]}, {"k": "\u09a1\u09bf\u09ae", "items": ["\u09a1\u09bf\u09ae"]}, {"k": "\u09aa\u09be\u09af\u09bc\u09c7\u09b6", "items": ["\u09a6\u09c1\u09a7", "\u099a\u09bf\u09a8\u09bf"]}]; // [{k: keyword, items: [grocery items]}]

var BN_DIGIT = ["\u09e6", "\u09e7", "\u09e8", "\u09e9", "\u09ea", "\u09eb", "\u09ec", "\u09ed", "\u09ee", "\u09ef"];

function toBnDigits(s) {
  return String(s).replace(/[0-9]/g, function (d) { return BN_DIGIT[+d]; });
}
function fmtNum(v, lang) {
  var s = String(v);
  return lang === "bn" ? toBnDigits(s) : s;
}

/* ---------- dates (local time, ISO YYYY-MM-DD) ---------- */
function pad2(n) { return (n < 10 ? "0" : "") + n; }
function todayISO() {
  var d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
function isValidISODate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  var y = +s.slice(0, 4), m = +s.slice(5, 7), d = +s.slice(8, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  var dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}
function parseISO(s) { // assumes valid
  return new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
}
function toISODate(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
function addDaysISO(iso, n) {
  var d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}
/* Bangladesh week runs Saturday -> Friday. */
function weekStartISO(iso) {
  var d = parseISO(iso);
  var sinceSat = (d.getDay() + 1) % 7; // Sat=0, Sun=1, ... Fri=6
  d.setDate(d.getDate() - sinceSat);
  return toISODate(d);
}
function weekDates(satISO) {
  var out = [];
  for (var i = 0; i < 7; i++) out.push(addDaysISO(satISO, i));
  return out;
}

/* ---------- state ---------- */
function blankDay() { return { breakfast: "", lunch: "", dinner: "" }; }
function blankWeekDays() {
  var o = {};
  DAYS.forEach(function (k) { o[k] = blankDay(); });
  return o;
}
function cloneMapping(mapping) {
  return mapping.map(function (r) { return { k: r.k, items: r.items.slice() }; });
}
function blankState() {
  return { app: APP_ID, version: STATE_VERSION, lang: "en", weeks: {}, mapping: cloneMapping(DEFAULT_MAPPING) };
}
function getWeek(state, satISO) {
  if (!state.weeks[satISO]) state.weeks[satISO] = { days: blankWeekDays(), grocery: [] };
  return state.weeks[satISO];
}
function isWeekEmpty(w) {
  for (var i = 0; i < DAYS.length; i++) {
    var d = w.days[DAYS[i]];
    for (var m = 0; m < MEALS.length; m++) if (normName(d[MEALS[m]])) return false;
  }
  return (w.grocery || []).length === 0;
}
function normName(s) { return String(s == null ? "" : s).trim(); }

function loadState() {
  try {
    var raw = (typeof localStorage !== "undefined") ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { state: blankState(), corrupt: false };
    var data = JSON.parse(raw);
    var r = validateImport(JSON.stringify(data));
    if (!r.ok) return { state: blankState(), corrupt: true };
    return { state: r.data, corrupt: false };
  } catch (e) {
    return { state: blankState(), corrupt: true };
  }
}
function saveState(state) {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) { return false; }
}

/* ---------- grocery generation ---------- */
function generateGrocery(menuDays, mapping) {
  // menuDays: {dayKey: {breakfast, lunch, dinner}} -> deduped grocery names, first-seen order
  var seen = {}, out = [];
  function add(n) {
    n = normName(n);
    if (n && !seen[n]) { seen[n] = 1; out.push(n); }
  }
  DAYS.forEach(function (d) {
    MEALS.forEach(function (m) {
      var dish = normName(menuDays[d] && menuDays[d][m]);
      if (!dish) return;
      mapping.forEach(function (rule) {
        if (rule.k && dish.indexOf(rule.k) !== -1) rule.items.forEach(add);
      });
    });
  });
  return out;
}

/* ---------- import validation ---------- */
function validateMapping(mapping) {
  if (!Array.isArray(mapping)) return false;
  for (var i = 0; i < mapping.length; i++) {
    var r = mapping[i];
    if (!r || typeof r !== "object" || typeof r.k !== "string" || !normName(r.k)) return false;
    if (!Array.isArray(r.items)) return false;
    var anyItem = false;
    for (var j = 0; j < r.items.length; j++) {
      if (typeof r.items[j] !== "string") return false;
      if (normName(r.items[j])) anyItem = true;
    }
    if (!anyItem) return false;
  }
  return true;
}
function validateImport(text) {
  var data;
  try { data = JSON.parse(text); }
  catch (e) { return { ok: false, error: "bad_json" }; }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "bad_shape" };
  if (data.app !== APP_ID) return { ok: false, error: "bad_app" };
  if (data.version !== STATE_VERSION) return { ok: false, error: "bad_version" };
  if (!data.weeks || typeof data.weeks !== "object" || Array.isArray(data.weeks)) return { ok: false, error: "bad_shape" };
  var keys = Object.keys(data.weeks);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (!isValidISODate(k) || weekStartISO(k) !== k) return { ok: false, error: "bad_week_key" };
    var w = data.weeks[k];
    if (!w || typeof w !== "object" || !w.days || typeof w.days !== "object") return { ok: false, error: "bad_shape" };
    for (var di = 0; di < DAYS.length; di++) {
      var dd = w.days[DAYS[di]];
      if (!dd || typeof dd !== "object") return { ok: false, error: "bad_shape" };
      for (var mi = 0; mi < MEALS.length; mi++) {
        if (typeof dd[MEALS[mi]] !== "string") return { ok: false, error: "bad_shape" };
      }
    }
    if (!Array.isArray(w.grocery)) return { ok: false, error: "bad_shape" };
    for (var gi = 0; gi < w.grocery.length; gi++) {
      var it = w.grocery[gi];
      if (!it || typeof it.name !== "string" || typeof it.checked !== "boolean") return { ok: false, error: "bad_shape" };
    }
  }
  if (!validateMapping(data.mapping)) return { ok: false, error: "bad_shape" };
  var lang = (data.lang === "bn") ? "bn" : "en";
  return { ok: true, data: { app: APP_ID, version: STATE_VERSION, lang: lang, weeks: data.weeks, mapping: data.mapping } };
}

var API = {
  STORAGE_KEY: STORAGE_KEY, APP_ID: APP_ID, STATE_VERSION: STATE_VERSION,
  DAYS: DAYS, MEALS: MEALS, STR: STR, DISHES: DISHES, DEFAULT_MAPPING: DEFAULT_MAPPING,
  toBnDigits: toBnDigits, fmtNum: fmtNum,
  todayISO: todayISO, isValidISODate: isValidISODate, addDaysISO: addDaysISO,
  weekStartISO: weekStartISO, weekDates: weekDates,
  blankState: blankState, blankWeekDays: blankWeekDays, getWeek: getWeek, isWeekEmpty: isWeekEmpty,
  loadState: loadState, saveState: saveState, normName: normName,
  generateGrocery: generateGrocery, validateImport: validateImport, validateMapping: validateMapping,
  cloneMapping: cloneMapping
};
if (typeof module !== "undefined" && module.exports) module.exports = API;

/* ============================== browser UI ============================== */
if (typeof document === "undefined") return;

function $(id) { return document.getElementById(id); }
function el(tag, cls) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}
function esc(s) { return String(s); }

var TODAY = todayISO();
try {
  var m = (typeof location !== "undefined" ? location.search : "").match(/[?&]asof=(\d{4}-\d{2}-\d{2})/);
  if (m && isValidISODate(m[1])) TODAY = m[1];
} catch (e) {}

var loaded = loadState();
var state = loaded.state;
var curSat = weekStartISO(TODAY);
var toastTimer = null;

function t(key) {
  var v = STR[state.lang][key];
  return (v === undefined) ? key : v;
}
function tImportErr(code) { return STR[state.lang].importErr[code] || code; }

function toast(msg) {
  var box = $("toast");
  box.textContent = msg;
  box.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { box.hidden = true; }, 2600);
}

function fmtDate(iso) {
  var y = +iso.slice(0, 4), mo = +iso.slice(5, 7), d = +iso.slice(8, 10);
  var s = d + " " + STR[state.lang].months[mo - 1] + " " + y;
  return state.lang === "bn" ? toBnDigits(s) : s;
}
function weekRangeLabel(satISO) {
  var a = satISO, b = addDaysISO(satISO, 6);
  var am = +a.slice(5, 7), bm = +b.slice(5, 7), ay = +a.slice(0, 4), by = +b.slice(0, 4);
  var s;
  if (am === bm) {
    s = (+a.slice(8, 10)) + " - " + (+b.slice(8, 10)) + " " + STR[state.lang].months[am - 1] + " " + ay;
  } else if (ay === by) {
    s = (+a.slice(8, 10)) + " " + STR[state.lang].months[am - 1] + " - " + (+b.slice(8, 10)) + " " + STR[state.lang].months[bm - 1] + " " + ay;
  } else {
    s = (+a.slice(8, 10)) + " " + STR[state.lang].months[am - 1] + " " + ay + " - " + (+b.slice(8, 10)) + " " + STR[state.lang].months[bm - 1] + " " + by;
  }
  return state.lang === "bn" ? toBnDigits(s) : s;
}

function curWeek() { return getWeek(state, curSat); }

function renderStatic() {
  document.documentElement.lang = (state.lang === "bn") ? "bn" : "en";
  document.title = t("appTitle");
  $("appTitle").textContent = t("appTitle");
  $("appSub").textContent = t("appSub");
  $("langBtn").textContent = t("langBtn");
  $("prevWeek").textContent = "< " + t("prevWeek");
  $("nextWeek").textContent = t("nextWeek") + " >";
  $("thisWeek").textContent = t("thisWeek");
  $("printBtn").textContent = t("printBtn");
  $("toolsTitle").textContent = t("weekTools");
  $("dupBtn").textContent = t("duplicateWeek");
  $("clearTitle").textContent = t("clearWeek");
  $("clearLabel").textContent = t("clearConfirmLabel");
  $("clearInput").placeholder = t("clearPh");
  $("clearBtn").textContent = t("clearBtn");
  $("groceryTitle").textContent = t("groceryTitle");
  $("genBtn").textContent = t("genGrocery");
  $("addItemInput").placeholder = t("addItemPh");
  $("addItemBtn").textContent = t("addBtn");
  $("removeCheckedBtn").textContent = t("removeChecked");
  $("mappingTitle").textContent = t("mappingTitle");
  $("mappingHint").textContent = t("mappingHint");
  $("ruleKey").placeholder = t("keywordPh");
  $("ruleItems").placeholder = t("itemsPh");
  $("addRuleBtn").textContent = t("addRule");
  $("dataTitle").textContent = t("exportTitle");
  $("exportBtn").textContent = t("exportBtn");
  $("importBtn").textContent = t("importBtn");
  $("importArea").placeholder = t("importPh");
  $("footerText").textContent = t("footer");
  // datalist suggestions
  var dl = $("dishList");
  dl.innerHTML = "";
  DISHES.forEach(function (name) {
    var o = document.createElement("option");
    o.value = name;
    dl.appendChild(o);
  });
}

function renderWeek() {
  var grid = $("weekGrid");
  grid.innerHTML = "";
  var dates = weekDates(curSat);
  var w = curWeek();
  for (var i = 0; i < 7; i++) {
    (function (i) {
      var dayKey = DAYS[i], iso = dates[i];
      var card = el("section", "day-card");
      if (iso === TODAY) card.classList.add("today");
      var head = el("div", "day-head");
      var nm = el("div", "day-name");
      nm.textContent = STR[state.lang].days[dayKey];
      var dt = el("div", "day-date");
      dt.textContent = fmtDate(iso);
      head.appendChild(nm);
      head.appendChild(dt);
      if (iso === TODAY) {
        var badge = el("span", "today-badge");
        badge.textContent = t("today");
        head.appendChild(badge);
      }
      card.appendChild(head);
      for (var mi = 0; mi < MEALS.length; mi++) {
        (function (meal) {
          var lab = el("label", "meal");
          var sp = el("span", "meal-name");
          sp.textContent = t(meal);
          var inp = el("input", "dish-input");
          inp.type = "text";
          inp.setAttribute("list", "dishList");
          inp.setAttribute("maxlength", "80");
          inp.placeholder = t("dishPh");
          inp.value = w.days[dayKey][meal] || "";
          inp.setAttribute("data-day", dayKey);
          inp.setAttribute("data-meal", meal);
          inp.setAttribute("aria-label", STR[state.lang].days[dayKey] + " - " + t(meal));
          inp.addEventListener("change", function () {
            var v = normName(inp.value);
            // Empty dish names are not saved (validation); typed text is kept otherwise.
            w.days[dayKey][meal] = v;
            inp.value = v;
            saveState(state);
          });
          lab.appendChild(sp);
          lab.appendChild(inp);
          card.appendChild(lab);
        })(MEALS[mi]);
      }
      grid.appendChild(card);
    })(i);
  }
  $("weekLabel").textContent = weekRangeLabel(curSat);
  $("printTitle").textContent = t("appTitle") + " - " + weekRangeLabel(curSat);
}

function renderGrocery() {
  var w = curWeek();
  var list = $("groceryList");
  list.innerHTML = "";
  if (!w.grocery.length) {
    var p = el("p", "empty-note");
    p.textContent = t("emptyGrocery");
    list.appendChild(p);
    return;
  }
  w.grocery.forEach(function (it, idx) {
    var li = el("li", "g-item" + (it.checked ? " done" : ""));
    var cb = el("input", "g-check");
    cb.type = "checkbox";
    cb.checked = !!it.checked;
    cb.setAttribute("aria-label", it.name);
    cb.addEventListener("change", function () {
      it.checked = cb.checked;
      saveState(state);
      renderGrocery();
    });
    var nm = el("span", "g-name");
    nm.textContent = it.name;
    var del = el("button", "icon-btn");
    del.type = "button";
    del.textContent = "x";
    del.setAttribute("aria-label", "remove");
    del.setAttribute("data-idx", String(idx));
    del.addEventListener("click", function () {
      w.grocery.splice(idx, 1);
      saveState(state);
      renderGrocery();
    });
    li.appendChild(cb);
    li.appendChild(nm);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function renderMapping() {
  var body = $("mappingBody");
  body.innerHTML = "";
  state.mapping.forEach(function (rule, idx) {
    var tr = el("tr", null);
    var tdK = el("td", null);
    var inK = el("input", "map-key");
    inK.type = "text";
    inK.value = rule.k;
    inK.setAttribute("aria-label", t("keywordPh"));
    inK.addEventListener("change", function () {
      var v = normName(inK.value);
      if (!v) { renderMapping(); return; } // empty keyword not saved
      rule.k = v;
      saveState(state);
    });
    var tdI = el("td", null);
    var inI = el("input", "map-items");
    inI.type = "text";
    inI.value = rule.items.join(", ");
    inI.setAttribute("aria-label", t("itemsPh"));
    inI.addEventListener("change", function () {
      var parts = inI.value.split(",").map(normName).filter(function (x) { return x; });
      if (!parts.length) { renderMapping(); return; } // at least one item required
      rule.items = parts;
      saveState(state);
    });
    var tdD = el("td", null);
    var del = el("button", "icon-btn");
    del.type = "button";
    del.textContent = "x";
    del.setAttribute("data-idx", String(idx));
    del.addEventListener("click", function () {
      state.mapping.splice(idx, 1);
      saveState(state);
      renderMapping();
      toast(t("ruleRemoved"));
    });
    tdK.appendChild(inK);
    tdI.appendChild(inI);
    tdD.appendChild(del);
    tr.appendChild(tdK);
    tr.appendChild(tdI);
    tr.appendChild(tdD);
    body.appendChild(tr);
  });
}

function renderAll() {
  renderStatic();
  renderWeek();
  renderGrocery();
  renderMapping();
}

function wire() {
  $("langBtn").addEventListener("click", function () {
    state.lang = (state.lang === "bn") ? "en" : "bn";
    saveState(state);
    renderAll();
  });
  $("prevWeek").addEventListener("click", function () {
    curSat = addDaysISO(curSat, -7);
    renderWeek();
  });
  $("nextWeek").addEventListener("click", function () {
    curSat = addDaysISO(curSat, 7);
    renderWeek();
  });
  $("thisWeek").addEventListener("click", function () {
    curSat = weekStartISO(TODAY);
    renderWeek();
  });
  $("printBtn").addEventListener("click", function () { window.print(); });

  $("dupBtn").addEventListener("click", function () {
    var prev = addDaysISO(curSat, -7);
    var pw = state.weeks[prev];
    if (!pw || isWeekEmpty(pw)) { toast(t("noLastWeek")); return; }
    curWeek().days = JSON.parse(JSON.stringify(pw.days));
    saveState(state);
    renderWeek();
    toast(t("duplicated"));
  });

  $("clearBtn").addEventListener("click", function () {
    var v = $("clearInput").value;
    if (v !== "DELETE") { toast(t("clearMismatch")); return; }
    var w = curWeek();
    w.days = blankWeekDays();
    w.grocery = [];
    $("clearInput").value = "";
    saveState(state);
    renderAll();
    toast(t("cleared"));
  });

  $("genBtn").addEventListener("click", function () {
    var w = curWeek();
    var names = generateGrocery(w.days, state.mapping);
    var have = {};
    w.grocery.forEach(function (it) { have[it.name] = 1; });
    var added = 0;
    names.forEach(function (n) {
      if (!have[n]) { w.grocery.push({ name: n, checked: false, auto: true }); added++; }
    });
    saveState(state);
    renderGrocery();
    toast(t("generated").replace("{n}", fmtNum(added, state.lang)));
  });

  function addManualItem() {
    var v = normName($("addItemInput").value);
    if (!v) { toast(t("emptyItemErr")); return; }
    var w = curWeek();
    var dup = w.grocery.some(function (it) { return it.name === v; });
    if (!dup) w.grocery.push({ name: v, checked: false, auto: false });
    $("addItemInput").value = "";
    saveState(state);
    renderGrocery();
  }
  $("addItemBtn").addEventListener("click", addManualItem);
  $("addItemInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addManualItem(); }
  });

  $("removeCheckedBtn").addEventListener("click", function () {
    var w = curWeek();
    w.grocery = w.grocery.filter(function (it) { return !it.checked; });
    saveState(state);
    renderGrocery();
    toast(t("checkedRemoved"));
  });

  $("addRuleBtn").addEventListener("click", function () {
    var k = normName($("ruleKey").value);
    var parts = $("ruleItems").value.split(",").map(normName).filter(function (x) { return x; });
    if (!k || !parts.length) { toast(t("emptyItemErr")); return; }
    state.mapping.push({ k: k, items: parts });
    $("ruleKey").value = "";
    $("ruleItems").value = "";
    saveState(state);
    renderMapping();
    toast(t("ruleAdded"));
  });

  $("exportBtn").addEventListener("click", function () {
    var payload = {
      app: APP_ID, version: STATE_VERSION, exportedAt: todayISO(),
      lang: state.lang, weeks: state.weeks, mapping: state.mapping
    };
    var txt = JSON.stringify(payload, null, 2);
    $("exportArea").value = txt;
    try {
      var blob = new Blob([txt], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "weekly-menu-" + curSat + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        try { URL.revokeObjectURL(a.href); } catch (e) {}
        a.remove();
      }, 500);
    } catch (e) {}
  });

  $("importBtn").addEventListener("click", function () {
    var r = validateImport($("importArea").value);
    var errBox = $("importErr");
    if (!r.ok) {
      errBox.textContent = tImportErr(r.error);
      errBox.hidden = false;
      return; // malformed rejected, data intact
    }
    errBox.hidden = true;
    state.weeks = r.data.weeks;
    state.mapping = r.data.mapping;
    state.lang = r.data.lang;
    curSat = weekStartISO(TODAY);
    saveState(state);
    renderAll();
    toast(t("imported"));
  });
}

function init() {
  renderAll();
  wire();
  $("loading").hidden = true;
  $("app").hidden = false;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* smoke-test hooks */
window.__wmp = {
  api: API,
  getState: function () { return state; },
  getSat: function () { return curSat; },
  setSat: function (s) { curSat = s; renderWeek(); renderGrocery(); },
  getToday: function () { return TODAY; },
  renderAll: renderAll,
  save: function () { return saveState(state); }
};

})();
