#!/usr/bin/env node
import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://localhost:3000/?variant=splotch-reverse";
const outDir = "/tmp/screenshots";
const label = process.argv[3] || "BIO";
const waitMs = Number(process.argv[4] || 700);

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
  defaultViewport: { width: 1400, height: 900 },
});

const page = await browser.newPage();
page.on("console", (msg) => console.log("[page]", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 300));

// Pre-hover screenshot
await page.screenshot({ path: `${outDir}/pre.png` });

// Locate the target Link by its text content and hover over its center.
const target = await page.evaluateHandle((t) => {
  const links = Array.from(document.querySelectorAll("a"));
  return links.find((a) => a.textContent?.trim().includes(t)) ?? null;
}, label);

if (!target) {
  console.error("Target link not found for", label);
  process.exit(2);
}
const box = await (target.asElement()).boundingBox();
console.log("box", box);
if (!box) throw new Error("no bounding box");
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

// Move mouse onto the element to trigger hover.
await page.mouse.move(cx - 200, cy - 200); // off
await page.mouse.move(cx, cy, { steps: 8 }); // on

await new Promise((r) => setTimeout(r, waitMs));
await page.screenshot({ path: `${outDir}/hover.png` });

// Move mouse away and wait, then screenshot again.
await page.mouse.move(10, 10, { steps: 6 });
await new Promise((r) => setTimeout(r, waitMs));
await page.screenshot({ path: `${outDir}/afterleave.png` });

await browser.close();
console.log("wrote", outDir + "/pre.png,hover.png,afterleave.png");
