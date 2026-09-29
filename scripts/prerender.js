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

function getExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidatePaths = [
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/brave-browser",
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

async function run() {
  console.log("Starting Prerender Process...");

  if (!fs.existsSync(BUILD_DIR)) {
    console.warn(`Build directory ${BUILD_DIR} does not exist. Skipping prerender.`);
    return;
  }

  // 1. Start a local server to serve the build folder
  const app = express();
  app.use(express.static(BUILD_DIR));
  app.use((req, res) => {
    res.sendFile(path.join(BUILD_DIR, "index.html"));
  });

  const server = await new Promise((resolve) => {
    const s = app.listen(PORT, () => {
      console.log(`Local server started on port ${PORT}`);
      resolve(s);
    });
  });

  let browser = null;
  try {
    const executablePath = getExecutablePath();
    const launchOptions = {
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
    if (executablePath) {
      console.log(`Using browser at: ${executablePath}`);
      launchOptions.executablePath = executablePath;
    }

    browser = await puppeteer.launch(launchOptions);

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

    console.log("Prerendering Complete!");
  } catch (err) {
    console.warn("Prerender encountered an issue:", err.message);
  } finally {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    server.close();
  }
}

run().catch((err) => {
  console.warn("Prerender failed (non-fatal):", err.message);
});
