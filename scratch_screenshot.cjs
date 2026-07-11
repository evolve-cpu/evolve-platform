const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push("console: " + msg.text());
  });

  const base = "http://localhost:8082";

  for (const [path, viewport, label] of [
    ["/", { width: 1440, height: 900 }, "landing-desktop"],
    ["/", { width: 390, height: 844 }, "landing-mobile"],
    ["/", { width: 1024, height: 768 }, "landing-tablet-landscape"],
    ["/", { width: 820, height: 1180 }, "landing-tablet-portrait"]
  ]) {
    await page.setViewport(viewport);
    await page.goto(base + path, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `scratch_${label}.png` });
  }

  // Navigate to /designers from landing to check header timing
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base + "/", { waitUntil: "networkidle0" });
  await page.click('button:has-text("designers")').catch(() => {});
  // fallback: find button containing text designers
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const target = btns.find((b) => b.textContent.trim().toLowerCase().startsWith("designers"));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });
  console.log("clicked designers card:", clicked);
  await new Promise((r) => setTimeout(r, 50));
  await page.screenshot({ path: "scratch_designers_immediately.png" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: "scratch_designers_after800ms.png" });

  console.log("Console/page errors:", JSON.stringify(errors, null, 2));

  await browser.close();
})();
