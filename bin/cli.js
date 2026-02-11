#!/usr/bin/env node

const pkg = require("../package.json");

const args = process.argv.slice(2);
const command = args[0];

function parseFlag(name) {
  const i = args.indexOf(name);
  return i !== -1;
}

function parseFlagValue(name) {
  const i = args.indexOf(name);
  if (i === -1 || i + 1 >= args.length) return undefined;
  return args[i + 1];
}

function showHelp() {
  console.log(`
${pkg.name} v${pkg.version}
${pkg.description}

Usage:
  claude-wow-sounds <command> [options]

Commands:
  install       Install WoW sound hooks into Claude Code
  uninstall     Remove WoW sound hooks from Claude Code

Install options:
  --volume <float>   Set playback volume 0.0-1.0 (default: system default)
  --dry-run          Print what would be changed without writing anything

Uninstall options:
  --dry-run          Print what would be removed without deleting anything

General options:
  --help             Show this help
  --version          Show version
`.trim());
}

if (parseFlag("--help") || parseFlag("-h") || !command) {
  showHelp();
  process.exit(0);
}

if (parseFlag("--version") || parseFlag("-v")) {
  console.log(pkg.version);
  process.exit(0);
}

const dryRun = parseFlag("--dry-run");

if (command === "install") {
  const volumeStr = parseFlagValue("--volume");
  let volume;
  if (volumeStr !== undefined) {
    volume = parseFloat(volumeStr);
    if (isNaN(volume) || volume < 0 || volume > 1) {
      console.error("Error: --volume must be a number between 0.0 and 1.0");
      process.exit(1);
    }
  }

  if (process.platform !== "darwin") {
    console.error(
      "Error: This package uses macOS afplay for audio playback."
    );
    console.error("It is not supported on " + process.platform + ".");
    process.exit(1);
  }

  require("../lib/install").run({ volume, dryRun });
} else if (command === "uninstall") {
  require("../lib/uninstall").run({ dryRun });
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Run "claude-wow-sounds --help" for usage.');
  process.exit(1);
}
