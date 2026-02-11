const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.join(
  process.env.HOME,
  ".claude",
  "hooks",
  "sounds",
  ".manifest.json"
);

function read() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return null;
  }
}

function write(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

function remove() {
  try {
    fs.unlinkSync(MANIFEST_PATH);
  } catch {
    // already gone
  }
}

module.exports = { MANIFEST_PATH, read, write, remove };
