# claude-wow-sounds — Spec

## Overview

An npm package that installs World of Warcraft-themed sound effects for Claude Code hook events. Teammates install via `npx claude-wow-sounds install` and get audio feedback for 11 different Claude Code lifecycle events.

## Distribution

- **Package name:** `claude-wow-sounds`
- **Registry:** GitHub Packages (private, org-scoped)
- **Repository:** GitHub repo created via `gh` CLI
- **License:** MIT (sound assets are freely licensed, not ripped from game files)

## Sound Mapping

| Hook Event          | Sound File             | Description                        |
|---------------------|------------------------|------------------------------------|
| SessionStart        | session-start.wav      | Session opens                      |
| UserPromptSubmit    | prompt-submit.wav      | User sends a prompt                |
| Notification        | notification.wav       | Claude sends a notification        |
| Stop                | stop.wav               | Generation stops                   |
| SubagentStart       | subagent-start.wav     | Subagent spawned                   |
| SubagentStop        | subagent-stop.wav      | Subagent finishes                  |
| TaskCompleted       | task-completed.wav     | Background task completes          |
| PostToolUseFailure  | tool-failure.wav       | A tool call fails                  |
| PermissionRequest   | permission-request.wav | Awaiting user permission           |
| PreCompact          | pre-compact.wav        | Context window about to compact    |
| SessionEnd          | session-end.wav        | Session closes                     |

## Platform Support

- **macOS only** — uses `afplay` for audio playback
- No Linux/Windows support needed at this time

## Installation UX

### Install
```bash
npx claude-wow-sounds install
npx claude-wow-sounds install --volume 0.5   # optional volume (0.0–1.0)
```

**What install does:**
1. Copies all `.wav` files to `~/.claude/hooks/sounds/`
2. Reads `~/.claude/settings.json`
3. Deep-merges hook entries into the existing `hooks` object
4. If an event already has hooks, **appends** the sound hook to the existing array (does not replace)
5. Writes a manifest file at `~/.claude/hooks/sounds/.manifest.json` tracking what was installed
6. Writes updated `settings.json` back

### Uninstall
```bash
npx claude-wow-sounds uninstall
```

**What uninstall does:**
1. Reads `~/.claude/hooks/sounds/.manifest.json`
2. Removes only the hook entries that were installed by this package (matching by manifest)
3. Deletes the sound files listed in the manifest
4. Removes the manifest file
5. Does **not** remove hooks the user added manually or from other sources

## Volume Control

- `--volume <float>` flag on install, range 0.0–1.0
- Translates to `afplay -v <volume>` in each hook command
- Default: no `-v` flag (system default volume)
- Volume choice is recorded in `.manifest.json` so uninstall works correctly

## Settings.json Merge Strategy

### Hook entry format
Each hook event gets an entry like:
```json
{
  "hooks": [
    {
      "type": "command",
      "command": "afplay ~/.claude/hooks/sounds/session-start.wav",
      "async": true
    }
  ]
}
```

With volume:
```json
{
  "hooks": [
    {
      "type": "command",
      "command": "afplay -v 0.5 ~/.claude/hooks/sounds/session-start.wav",
      "async": true
    }
  ]
}
```

### Merge rules
- If `settings.json` doesn't exist, create it with only the hooks section
- If `hooks` key doesn't exist, add it
- If an event key (e.g. `Notification`) doesn't exist, add the full entry
- If an event key exists, append the sound hook entry to the existing array
- Never overwrite or remove existing hook entries

## Manifest File

Location: `~/.claude/hooks/sounds/.manifest.json`

```json
{
  "version": "1.0.0",
  "installedAt": "2026-02-11T10:00:00Z",
  "volume": null,
  "sounds": [
    "session-start.wav",
    "prompt-submit.wav",
    "notification.wav",
    "stop.wav",
    "subagent-start.wav",
    "subagent-stop.wav",
    "task-completed.wav",
    "tool-failure.wav",
    "permission-request.wav",
    "pre-compact.wav",
    "session-end.wav"
  ],
  "hooks": {
    "SessionStart": { "index": 0 },
    "UserPromptSubmit": { "index": 0 },
    "Notification": { "index": 1 },
    "Stop": { "index": 0 },
    "SubagentStart": { "index": 0 },
    "SubagentStop": { "index": 0 },
    "TaskCompleted": { "index": 0 },
    "PostToolUseFailure": { "index": 0 },
    "PermissionRequest": { "index": 0 },
    "PreCompact": { "index": 1 },
    "SessionEnd": { "index": 0 }
  }
}
```

The `hooks` object records the **array index** at which the sound hook was inserted for each event, enabling precise removal during uninstall. On uninstall, hooks are identified by matching the `afplay ~/.claude/hooks/sounds/` command pattern from the manifest rather than relying solely on index (indices may shift if user edits manually).

## Package Structure

```
claude-wow-sounds/
├── package.json
├── README.md
├── LICENSE
├── bin/
│   └── cli.js              # Entry point: install / uninstall subcommands
├── lib/
│   ├── install.js           # Install logic
│   ├── uninstall.js         # Uninstall logic
│   ├── settings.js          # settings.json read/merge/write
│   └── manifest.js          # Manifest read/write
└── sounds/
    ├── session-start.wav
    ├── prompt-submit.wav
    ├── notification.wav
    ├── stop.wav
    ├── subagent-start.wav
    ├── subagent-stop.wav
    ├── task-completed.wav
    ├── tool-failure.wav
    ├── permission-request.wav
    ├── pre-compact.wav
    └── session-end.wav
```

## CLI Interface

```
claude-wow-sounds <command> [options]

Commands:
  install     Install WoW sound hooks into Claude Code
  uninstall   Remove WoW sound hooks from Claude Code

Install options:
  --volume <float>   Set playback volume 0.0–1.0 (default: system default)
  --dry-run          Print what would be changed without writing anything

General options:
  --help             Show help
  --version          Show version
```

## GitHub Setup

- Create repo via `gh repo create`
- Configure GitHub Packages publishing in `package.json`
- Add `.npmrc` for GitHub Packages registry
- Teammates authenticate with `npm login --registry=https://npm.pkg.github.com`

## Out of Scope

- Linux/Windows support
- Sound theme system (multiple themes)
- Custom spinner verbs
- Non-sound hooks (the functional hooks like `approve-mathsearch.py`, `syncthing-todo-merge.sh` are personal and not included)

## Implementation Notes

- Pure Node.js, no external dependencies beyond `fs`, `path`, `os`
- No build step needed — ship raw JS
- Sound files are bundled in the npm package (total ~5.3 MB)
- `bin` field in package.json points to `bin/cli.js` for `npx` support
