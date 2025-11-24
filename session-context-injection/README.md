# Session Context Injection

Automatically inject the current session ID and name into Claude's context on every user prompt.

## Problem

Claude Code doesn't expose the current session ID to the assistant. When Claude needs to know its session ID (for creating session-specific files, logging, or dynamic workflows), it has to use tools to read `.claude/sessions.json`, which:
- Wastes tokens on tool calls
- Adds latency
- May guess the wrong session if multiple exist

## Solution

This `UserPromptSubmit` hook injects the session context into every prompt using the `userPromptContext` field, making it instantly available to Claude without tools.

## How It Works

1. **SessionStart hook** creates session name (e.g., "brave-elephant") and stores in `.claude/sessions.json`
2. **UserPromptSubmit hook** (this example) reads session ID from stdin
3. Uses `getSessionName()` to look up friendly name
4. Injects into Claude's context: `Current session: brave-elephant (7c6aaaf3)`

## Installation

### 1. Copy the hook

```bash
cp UserPromptSubmit.ts /path/to/your/project/.claude/hooks/
chmod +x /path/to/your/project/.claude/hooks/UserPromptSubmit.ts
```

### 2. Register in `.claude/settings.json`

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bun \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/UserPromptSubmit.ts"
          }
        ]
      }
    ]
  }
}
```

### 3. Test

Start a new Claude Code session and ask:
```
What is my current session ID?
```

Claude should respond immediately without using any tools:
```
Your current session is: brave-elephant (7c6aaaf3-...)
```

## Use Cases

### Session-Specific Files

```typescript
// Claude can now create files specific to the session without tools
const sessionFile = `.agent/sessions/${sessionName}/config.json`;
```

### Logging & Analytics

```typescript
// Track which session performed actions
console.log(`[${sessionName}] User requested feature X`);
```

### Dynamic Agent Workflows

```typescript
// Shadow advisors or agents that need to know their session
const advisorConfig = `.agent/shadow/${sessionId}.json`;
```

## Token Cost

**~10 tokens per user prompt** for the injected context.

This is minimal compared to the 50-100+ tokens saved by avoiding tool calls to read session info.

## Requirements

- [Bun](https://bun.sh/) runtime
- [claude-hooks-sdk](https://www.npmjs.com/package/claude-hooks-sdk) v0.7.2 or later
- SessionStart hook configured (for session naming)

## How `userPromptContext` Works

From the [Claude Code hooks documentation](https://code.claude.com/docs/en/hooks.md):

```typescript
{
  exitCode: 0,
  output: {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      userPromptContext: "Additional context to inject into Claude's prompt"
    }
  }
}
```

The `userPromptContext` field injects text directly into Claude's system prompt for that turn, making it available without appearing in the conversation history.

## Alternative Approaches

### Option 1: Write to `.claude/.current-session` file
- Pro: No token cost per request
- Con: Requires file read (tool call) to access

### Option 2: Environment variable injection
- Pro: Zero token cost
- Con: Not currently supported by Claude Code

### Option 3: This approach (userPromptContext)
- Pro: Instantly available, no tools needed
- Pro: Always up-to-date
- Con: Small token cost per request (~10 tokens)

## See Also

- [custom-backend](../custom-backend/) - Session filtering and visualization
- [claude-hooks-sdk Session Naming](https://github.com/hgeldenhuys/claude-hooks-sdk#session-naming)
