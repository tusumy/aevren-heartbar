import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../public/heartbar.html", import.meta.url), "utf8");
const server = readFileSync(new URL("../server.js", import.meta.url), "utf8");

assert.match(html, /let lastReportedHeight\s*=\s*0/, "height reports must be deduplicated");
assert.match(html, /if \(height === lastReportedHeight\) return/, "unchanged heights must not notify the host");
assert.match(html, /ResizeObserver\(reportSize\)\.observe\(\$\("card"\)\)/, "observe content, not the host-sized document");
assert.doesNotMatch(html, /observe\(document\.documentElement\)/, "document observation creates a host resize feedback loop");
assert.match(server, /heartbar-v6\.html/, "bump the widget URI so App clients stop using v5 cache");

console.log("layout stability regression: pass");
