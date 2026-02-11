const fs = require("fs");
const path = require("path");
const settings = require("./settings");
const manifest = require("./manifest");

const HOOK_MAP = {
  SessionStart: "session-start.wav",
  UserPromptSubmit: "prompt-submit.wav",
  Notification: "notification.wav",
  Stop: "stop.wav",
  SubagentStart: "subagent-start.wav",
  SubagentStop: "subagent-stop.wav",
  TaskCompleted: "task-completed.wav",
  PostToolUseFailure: "tool-failure.wav",
  PermissionRequest: "permission-request.wav",
  PreCompact: "pre-compact.wav",
  SessionEnd: "session-end.wav",
};

const SOUNDS_DIR = path.join(process.env.HOME, ".claude", "hooks", "sounds");
const PKG_SOUNDS = path.join(__dirname, "..", "sounds");

function run({ volume, dryRun }) {
  const existing = manifest.read();
  if (existing) {
    console.log("WoW sounds are already installed.");
    console.log("Run 'claude-wow-sounds uninstall' first to reinstall.");
    process.exit(1);
  }

  const soundFiles = Object.values(HOOK_MAP);

  // --- Preview mode ---
  if (dryRun) {
    console.log("Dry run — no changes will be made.\n");
    console.log("Would copy sounds to:", SOUNDS_DIR);
    for (const f of soundFiles) {
      console.log("  " + f);
    }
    console.log("\nWould add hooks to:", settings.SETTINGS_PATH);
    for (const [event, file] of Object.entries(HOOK_MAP)) {
      const v = volume != null ? ` -v ${volume}` : "";
      console.log(`  ${event} → afplay${v} ~/.claude/hooks/sounds/${file}`);
    }
    return;
  }

  // --- Copy sound files ---
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });

  let copied = 0;
  for (const file of soundFiles) {
    const src = path.join(PKG_SOUNDS, file);
    const dst = path.join(SOUNDS_DIR, file);
    fs.copyFileSync(src, dst);
    copied++;
  }
  console.log(`Copied ${copied} sound files to ${SOUNDS_DIR}`);

  // --- Merge hooks into settings.json ---
  const current = settings.read();
  const { settings: merged, insertions } = settings.mergeHooks(
    current,
    HOOK_MAP,
    volume
  );
  settings.save(merged);
  console.log(`Merged hooks into ${settings.SETTINGS_PATH}`);

  // --- Write manifest ---
  manifest.write({
    version: require("../package.json").version,
    installedAt: new Date().toISOString(),
    volume: volume ?? null,
    sounds: soundFiles,
    hooks: insertions,
  });
  console.log("Wrote install manifest.");

  // --- Summary ---
  console.log("\nInstalled WoW sounds for Claude Code:");
  for (const [event, file] of Object.entries(HOOK_MAP)) {
    console.log(`  ${event} → ${file}`);
  }
  if (volume != null) {
    console.log(`\nVolume: ${volume}`);
  }
  console.log("\nRun 'claude-wow-sounds uninstall' to remove.");
}

module.exports = { run, HOOK_MAP };
