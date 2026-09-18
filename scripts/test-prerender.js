



// for seo friendly urls 






const puppeteer = require("puppeteer");
const path = require("path");
const express = require("express");

async function test() {
  const app = express();
  app.use(express.static(path.join(__dirname, "../build")));
  app.use((req, res) => res.sendFile(path.join(__dirname, "../build/index.html")));
  const server = app.listen(5056, async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto("http://localhost:5056/forpartner/become-partner", { waitUntil: "networkidle0" });

    const html = await page.evaluate(() => document.documentElement.outerHTML);
    console.log("ROOT CONTENT:", html.includes('id="root"></div>') ? 'EMPTY' : 'RENDERED');

    await browser.close();
    server.close();
  });
}

test();
