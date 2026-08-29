import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../public/heartbar.html",import.meta.url),"utf8");

assert.doesNotMatch(html,/ui\/notifications\/size-changed/,"host owns inline widget sizing");
assert.doesNotMatch(html,/ResizeObserver/,"manual observation creates host feedback loops");
assert.doesNotMatch(html,/reportSize|lastReportedHeight/,"manual resize bookkeeping stays removed");
assert.doesNotMatch(html,/setInterval\s*\(/,"the compact bar must not mutate every second");
assert.doesNotMatch(html,/margin\s*:\s*-\d/,"negative margins must not fight host layout");
assert.match(html,/class="bar"/,"compact status bar is present");
assert.match(html,/class="popover"/,"click popover is present");
assert.match(html,/@keyframes mist-drift/,"ambient motion is present");
assert.match(html,/@keyframes sheen/,"the full-width light sweep is present");
assert.doesNotMatch(html,/@keyframes[^}]*\b(?:height|width|margin|padding|top|bottom|left|right)\s*:/s,"animations must not mutate layout geometry");

console.log("layout stability regression: pass");
