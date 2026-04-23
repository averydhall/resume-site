#!/usr/bin/env node
// Captures frames during a hover animation so we can see whether the
// splatter effect actually paints in progressively (blobs + goo) rather
// than snapping from white -> paper.
import puppeteer from "puppeteer-core";

const outDir = "/tmp/splatter";
const url = "http://localhost:3000/?variant=splotch-reverse";
const label = "PROJECTS"; // widest word -> most blobs visible

import { mkdirSync } from "node:fs";
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
  defaultViewport: { width: 1400, height: 900 },
});

const page = await browser.newPage();
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("[page error]", msg.text());
});

// Slow the animation down so we can capture distinct frames. We do this by
// hijacking requestAnimationFrame to tick at 1/4 speed via performance.now
// override? Easier: just start hover, then poll screenshots quickly.
await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 400));

const target = await page.evaluateHandle((t) => {
  return Array.from(document.querySelectorAll("a")).find((a) =>
    a.textContent?.toUpperCase().includes(t)
  ) ?? null;
}, label);

const box = await target.asElement().boundingBox();
if (!box) throw new Error("no bounding box");
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

// Crop region around the word for zoomed inspection.
const pad = 30;
const clip = {
  x: Math.max(0, Math.floor(box.x - pad)),
  y: Math.max(0, Math.floor(box.y - pad)),
  width: Math.ceil(box.width + pad * 2),
  height: Math.ceil(box.height + pad * 2),
};
console.log("clip", clip);

// Park mouse away, take baseline.
await page.mouse.move(10, 10);
await new Promise((r) => setTimeout(r, 150));
await page.screenshot({ path: `${outDir}/00_idle.png`, clip });

// Move mouse on and capture at several intervals. The animation is ~620ms.
await page.mouse.move(cx, cy, { steps: 4 });
const enterTs = Date.now();
const stops = [40, 120, 220, 340, 500, 700];
for (const ms of stops) {
  const remain = enterTs + ms - Date.now();
  if (remain > 0) await new Promise((r) => setTimeout(r, remain));
  await page.screenshot({ path: `${outDir}/enter_${String(ms).padStart(3, "0")}.png`, clip });
}

// Leave, then capture reverse.
await page.mouse.move(10, 10, { steps: 4 });
const leaveTs = Date.now();
for (const ms of [40, 140, 280, 460, 700]) {
  const remain = leaveTs + ms - Date.now();
  if (remain > 0) await new Promise((r) => setTimeout(r, remain));
  await page.screenshot({ path: `${outDir}/leave_${String(ms).padStart(3, "0")}.png`, clip });
}

await browser.close();
console.log("wrote frames to", outDir);
