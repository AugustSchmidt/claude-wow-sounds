const fs = require("fs");
const path = require("path");
const settings = require("./settings");
const manifestLib = require("./manifest");

const SOUNDS_DIR = path.join(process.env.HOME, ".claude", "hooks", "sounds");

function run({ dryRun }) {
  const man = manifestLib.read();
  if (!man) {
    console.log("No install manifest found — nothing to uninstall.");
    console.log("(Expected manifest at", manifestLib.MANIFEST_PATH + ")");
    process.exit(1);
  }

  // --- Preview mode ---
  if (dryRun) {
    console.log("Dry run — no changes will be made.\n");
    console.log("Would remove sound files from:", SOUNDS_DIR);
    for (const f of man.sounds || []) {
      console.log("  " + f);
    }
    console.log("\nWould remove hooks from:", settings.SETTINGS_PATH);
    for (const event of Object.keys(man.hooks || {})) {
      console.log("  " + event);
    }
    console.log("\nWould delete manifest:", manifestLib.MANIFEST_PATH);
    return;
  }

  // --- Remove hooks from settings.json ---
  const current = settings.read();
  const cleaned = settings.removeHooks(current, man);
  settings.save(cleaned);
  console.log(`Removed hooks from ${settings.SETTINGS_PATH}`);

  // --- Delete sound files ---
  let deleted = 0;
  for (const file of man.sounds || []) {
    const fp = path.join(SOUNDS_DIR, file);
    try {
      fs.unlinkSync(fp);
      deleted++;
    } catch {
      // file already gone
    }
  }
  console.log(`Deleted ${deleted} sound files from ${SOUNDS_DIR}`);

  // --- Remove manifest ---
  manifestLib.remove();
  console.log("Removed install manifest.");

  // --- Clean up empty sounds dir ---
  try {
    const remaining = fs.readdirSync(SOUNDS_DIR);
    if (remaining.length === 0) {
      fs.rmdirSync(SOUNDS_DIR);
      console.log("Removed empty sounds directory.");
    }
  } catch {
    // dir already gone or not empty
  }

  console.log("\nWoW sounds uninstalled from Claude Code.");
}

module.exports = { run };
