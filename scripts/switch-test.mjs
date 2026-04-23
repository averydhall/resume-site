#!/usr/bin/env node
import puppeteer from "puppeteer-core";

const outDir = "/tmp/screenshots";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
  defaultViewport: { width: 1400, height: 900 },
});

const page = await browser.newPage();
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 500));

async function clickVariant(letter) {
  await page.evaluate((t) => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent?.trim() === t);
    btn?.click();
  }, letter);
  await new Promise((r) => setTimeout(r, 250));
  await page.mouse.move(1380, 10);
  await new Promise((r) => setTimeout(r, 150));
}

async function measure(tag) {
  const m = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll("a").forEach((a) => {
      const word = a.getAttribute("aria-label") ?? (a.textContent?.trim().slice(0, 10) ?? "?");
      const r = a.getBoundingClientRect();
      out[`a_${word}`] = { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    });
    const sw = document.querySelector('[aria-label="Primary"]')?.parentElement;
    // Get the switcher container (fixed bottom-right)
    const fixed = Array.from(document.querySelectorAll('div')).find((d) => getComputedStyle(d).position === 'fixed');
    if (fixed) {
      const r = fixed.getBoundingClientRect();
      out.switcher = { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    }
    return out;
  });
  console.log(`[${tag}]`, JSON.stringify(m));
}

await clickVariant("A");
await measure("A");
await page.screenshot({ path: `${outDir}/var_a.png` });

await clickVariant("B");
await measure("B");
await page.screenshot({ path: `${outDir}/var_b.png` });

await clickVariant("C");
await measure("C");
await page.screenshot({ path: `${outDir}/var_c.png` });

await browser.close();
