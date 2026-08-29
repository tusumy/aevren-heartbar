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
assert.doesNotMatch(html,/class="goo /,"oversized edge blobs stay removed");
assert.match(html,/\.bar::after\{[^}]*border-radius:17px/,"outer shell keeps a restrained inner glass ring");
assert.match(html,/class="liquid-frame"/,"outer shell includes a responsive liquid crystal SVG frame");
assert.match(html,/feTurbulence[^>]+baseFrequency="\.009 \.055"/,"liquid frame has organic crystalline distortion");
assert.match(html,/class="frame-wisp"/,"liquid frame includes smoky crystalline edge wisps");
assert.match(html,/setInterval\(spawnBubble,1200\)/,"ambient bubbles appear every 1.2 seconds");
assert.match(html,/querySelectorAll\("\.bubble"\)\.length>=6/,"ambient bubble count is bounded");
assert.match(html,/\.popover::before/,"popover has an organic outer membrane");
assert.match(html,/\.popover::after/,"popover has liquid bubble droplets");
assert.match(html,/@media\(prefers-color-scheme:light\)/,"widget follows the host light theme");
assert.match(html,/color-scheme:light dark/,"widget advertises both color schemes");
assert.match(html,/-webkit-text-size-adjust:100%/,"mobile hosts must not inflate widget text");
assert.match(html,/@media\(max-width:430px\)[\s\S]*?\.popover\{left:44%;right:8px;top:30px;min-height:58px/,"mobile popover stays readable and below the clock");
assert.match(html,/\.pop-text\{[^}]*overflow-wrap:anywhere;word-break:break-word/,"mobile detail text wraps long tokens instead of clipping");
assert.doesNotMatch(html,/\.stamp\{opacity:0\}/,"the live clock remains visible when details open");
assert.doesNotMatch(html,/\.stamp\{display:none\}/,"the live clock remains visible on narrow phones");
assert.match(html,/aria-label="Aevren × Niamh">𝒜ℯ𝓋𝓇ℯ𝓃 [^<]+ 𝒩𝒾𝒶𝓂𝒽/,"preserve the user-selected brand names and separator in a portable script form");
assert.match(html,/\.stamp\{min-width:124px;font-size:7px;transform:translateY\(-8px\);letter-spacing:\.06em\}/,"preserve the user-selected mobile clock offset");
assert.match(html,/font-family:"Cambria Math","STIX Two Math","Noto Sans Math","Times New Roman",serif/,"brand supports portable mathematical script glyphs");
assert.match(html,/\.pill\{min-width:92px;max-width:104px;margin-right:[1-9]\d*px;/,"mobile capsule is inset from the right edge");
assert.match(html,/\.pill span\{font-size:8px;line-height:1\.25;white-space:normal;overflow-wrap:anywhere\}/,"mobile capsule detail wraps instead of clipping");
assert.match(html,/setInterval\(updateClock,1000\)/,"clock updates once per second");
assert.match(html,/\.stamp\{[^}]*min-width:[^}]*font-variant-numeric:tabular-nums/,"clock reserves stable width");
assert.doesNotMatch(html,/@keyframes[^}]*\b(?:height|width|margin|padding|top|bottom|left|right)\s*:/s,"animations must not mutate layout geometry");

console.log("layout stability regression: pass");
