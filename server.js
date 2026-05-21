process.env.NODE_ENV = process.env.NODE_ENV || "production";

/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const next = require("next");
const fs = require("fs");
const path = require("path");
/* eslint-enable @typescript-eslint/no-require-imports */

// On startup: copy any missing data files from data-defaults/ → data/
// This ensures data persists on a Railway Volume across redeploys.
// Files already on the volume (user edits) are never overwritten.
function initData() {
  const dataDir = path.join(__dirname, "data");
  const defaultsDir = path.join(__dirname, "data-defaults");
  if (!fs.existsSync(defaultsDir)) return;
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  for (const file of fs.readdirSync(defaultsDir)) {
    const dest = path.join(dataDir, file);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(defaultsDir, file), dest);
      console.log(`[init] Copied default: ${file}`);
    }
  }
}

initData();

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`Ready on http://${hostname}:${port}`);
  });
});
