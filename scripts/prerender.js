

// for seo friendly urls 



const puppeteer = require("puppeteer");
const express = require("express");
const path = require("path");
const fs = require("fs");

const PORT = 5055;
const BUILD_DIR = path.join(__dirname, "../build");

// Routes to prerender
const routes = [
  "/forpartner",
  "/forpartner/become-partner",
  "/forpartner/resource-partner"
];

async function run() {
  console.log("Starting Prerender Process...");

  // 1. Start a local server to serve the build folder
  const app = express();
  app.use(express.static(BUILD_DIR));
  app.use((req, res) => {
    res.sendFile(path.join(BUILD_DIR, "index.html"));
  });

  const server = app.listen(PORT, async () => {
    console.log(`Local server started on port ${PORT}`);

    // 2. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new"
    });

    for (const route of routes) {
      console.log(`Prerendering route: ${route}`);
      const page = await browser.newPage();

      // Go to the page
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle0" });

      // Wait for React to fully render the DOM and Helmet to inject tags
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get the full HTML content
      const html = await page.evaluate(() => {
        return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
      });

      // 3. Save the HTML to the build directory
      const routeDir = path.join(BUILD_DIR, route);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }

      fs.writeFileSync(path.join(routeDir, "index.html"), html);
      console.log(`Successfully saved ${route}/index.html`);
      await page.close();
    }

    await browser.close();
    server.close();
    console.log("Prerendering Complete!");
  });
}

run().catch((err) => {
  console.error("Prerender failed!", err);
  process.exit(1);
});
