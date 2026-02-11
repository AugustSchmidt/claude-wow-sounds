const fs = require("fs");
const path = require("path");

const SETTINGS_PATH = path.join(
  process.env.HOME,
  ".claude",
  "settings.json"
);

function read() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
  } catch {
    return {};
  }
}

function save(settings) {
  // Ensure the directory exists
  const dir = path.dirname(SETTINGS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");
}

/**
 * Build the hook entry for a given sound file and volume.
 */
function buildHookEntry(soundFile, volume) {
  const soundPath = `~/.claude/hooks/sounds/${soundFile}`;
  const cmd =
    volume != null
      ? `afplay -v ${volume} ${soundPath}`
      : `afplay ${soundPath}`;

  return {
    hooks: [
      {
        type: "command",
        command: cmd,
        async: true,
      },
    ],
  };
}

/**
 * Merge sound hooks into a settings object. Returns a new settings object
 * and a record of where each hook was inserted.
 */
function mergeHooks(settings, hookMap, volume) {
  const result = JSON.parse(JSON.stringify(settings)); // deep clone
  if (!result.hooks) result.hooks = {};

  const insertions = {};

  for (const [event, soundFile] of Object.entries(hookMap)) {
    const entry = buildHookEntry(soundFile, volume);

    if (!result.hooks[event]) {
      result.hooks[event] = [];
    }

    const idx = result.hooks[event].length;
    result.hooks[event].push(entry);
    insertions[event] = { index: idx };
  }

  return { settings: result, insertions };
}

/**
 * Remove sound hooks from settings. Matches by command pattern rather than
 * index, since the user may have reordered hooks manually.
 */
function removeHooks(settings, manifest) {
  const result = JSON.parse(JSON.stringify(settings));
  if (!result.hooks) return result;

  const pattern = /^afplay\s+(?:-v\s+[\d.]+\s+)?~\/\.claude\/hooks\/sounds\//;

  for (const event of Object.keys(manifest.hooks || {})) {
    if (!result.hooks[event]) continue;

    result.hooks[event] = result.hooks[event].filter((group) => {
      // Keep the group if none of its hooks match our sound pattern
      if (!group.hooks || !Array.isArray(group.hooks)) return true;
      return !group.hooks.some((h) => pattern.test(h.command || ""));
    });

    // Clean up empty arrays
    if (result.hooks[event].length === 0) {
      delete result.hooks[event];
    }
  }

  // Clean up empty hooks object
  if (Object.keys(result.hooks).length === 0) {
    delete result.hooks;
  }

  return result;
}

module.exports = { SETTINGS_PATH, read, save, buildHookEntry, mergeHooks, removeHooks };
