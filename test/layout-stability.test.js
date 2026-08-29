import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../public/heartbar.html",import.meta.url),"utf8");

assert.doesNotMatch(html,/ui\/notifications\/size-changed/,"host owns inline widget sizing");
assert.doesNotMatch(html,/ResizeObserver/,"manual observation creates host feedback loops");
assert.doesNotMatch(html,/reportSize|lastReportedHeight/,"manual resize bookkeeping stays removed");
assert.doesNotMatch(html,/margin\s*:\s*-\d/,"negative margins must not fight host layout");
assert.match(html,/class="bar"/,"compact status bar is present");
assert.match(html,/class="popover"/,"click popover is present");
assert.match(html,/@keyframes mist-drift/,"ambient motion is present");
assert.match(html,/@keyframes sheen/,"the full-width light sweep is present");
assert.match(html,/class="goo left"/,"liquid crystal edge decoration is present");
assert.match(html,/class="goo right"/,"liquid crystal decoration frames both edges");
assert.match(html,/\.popover::before/,"popover has an organic outer membrane");
assert.match(html,/\.popover::after/,"popover has liquid bubble droplets");
assert.match(html,/@media\(prefers-color-scheme:light\)/,"widget follows the host light theme");
assert.match(html,/color-scheme:light dark/,"widget advertises both color schemes");
assert.match(html,/-webkit-text-size-adjust:100%/,"mobile hosts must not inflate widget text");
assert.match(html,/@media\(max-width:430px\)[\s\S]*?\.popover\{left:52%;right:8px;top:8px;min-height:58px/,"mobile popover stays compact and right-aligned");
assert.match(html,/\.bar:has\(\.popover\.open\) \.stamp\{opacity:0\}/,"open mobile popover hides the clock behind it");
assert.match(html,/setInterval\(updateClock,1000\)/,"clock updates once per second");
assert.match(html,/\.stamp\{[^}]*min-width:[^}]*font-variant-numeric:tabular-nums/,"clock reserves stable width");
assert.doesNotMatch(html,/@keyframes[^}]*\b(?:height|width|margin|padding|top|bottom|left|right)\s*:/s,"animations must not mutate layout geometry");

console.log("layout stability regression: pass");
