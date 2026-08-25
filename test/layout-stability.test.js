import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../public/heartbar.html", import.meta.url), "utf8");
const server = readFileSync(new URL("../server.js", import.meta.url), "utf8");

assert.doesNotMatch(html, /ui\/notifications\/size-changed/, "the host must own inline widget sizing");
assert.doesNotMatch(html, /ResizeObserver/, "manual resize observation can create a host feedback loop");
assert.doesNotMatch(html, /reportSize/, "manual height reporting must stay removed");
assert.doesNotMatch(html, /lastReportedHeight/, "obsolete resize bookkeeping must stay removed");
assert.match(server, /heartbar-v6\.html/, "serve the current widget URI");

console.log("layout stability regression: pass");
