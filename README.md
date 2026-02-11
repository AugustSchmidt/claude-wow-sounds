# claude-wow-sounds

World of Warcraft-themed sound effects for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) hook events.

Get audio feedback when Claude starts a session, spawns a subagent, completes a task, hits an error, and more.

## Install

```bash
npx claude-wow-sounds install
```

### With custom volume

```bash
npx claude-wow-sounds install --volume 0.5
```

Volume range is 0.0 (silent) to 1.0 (full). Omit for system default.

### Preview before installing

```bash
npx claude-wow-sounds install --dry-run
```

## Uninstall

```bash
npx claude-wow-sounds uninstall
```

This removes only the hooks and sounds installed by this package. Your other hooks and settings are preserved.

## Sound Events

| Claude Code Event   | WoW Sound              |
|---------------------|------------------------|
| SessionStart        | Ready Check            |
| UserPromptSubmit    | Tell Message (whisper) |
| Notification        | Ready Check            |
| Stop                | Level Up               |
| SubagentStart       | Fel Saber Summon       |
| SubagentStop        | Quest Complete         |
| TaskCompleted       | Quest Complete         |
| PostToolUseFailure  | Spell Holy Fizzle      |
| PermissionRequest   | PVP Flag Taken (Horde) |
| PreCompact          | Alarm Clock Warning    |
| SessionEnd          | Quest Failed           |

## Requirements

- macOS (uses `afplay` for audio playback)
- Node.js >= 18
- Claude Code

## How it works

The installer:

1. Copies `.wav` files to `~/.claude/hooks/sounds/`
2. Merges hook entries into `~/.claude/settings.json`
3. Writes a manifest at `~/.claude/hooks/sounds/.manifest.json` for clean uninstall

If you already have hooks on the same events, the sound hooks are **appended** alongside your existing hooks — nothing is overwritten.

## License

MIT
