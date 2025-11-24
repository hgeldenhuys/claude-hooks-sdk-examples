# Session Context Injection ⭐

## ⚡ THE MOST IMPORTANT CLAUDE CODE HOOK PATTERN

**Automatically inject the current session ID and name into Claude's context on every user prompt - eliminating tool calls and enabling powerful session-aware workflows.**

## Problem

Claude Code doesn't expose the current session ID to the assistant. When Claude needs to know its session ID (for creating session-specific files, logging, or dynamic workflows), it has to use tools to read `.claude/sessions.json`, which:
- ❌ Wastes 50-100+ tokens on tool calls
- ❌ Adds latency (tool execution time)
- ❌ May guess the wrong session if multiple exist
- ❌ Clutters conversation with unnecessary tool use
- ❌ Breaks agent workflows that depend on session awareness

## Solution

**This `UserPromptSubmit` hook injects the session context into every prompt using the `additionalContext` field, making it instantly available to Claude without tools.**

### Why This Is Critical

This is not just a convenience - it's a **foundational pattern** that unlocks advanced Claude Code capabilities:

1. **🎯 Session-Aware File Management** - Create session-specific directories, logs, and configs
2. **📊 Analytics & Observability** - Track which sessions perform which actions
3. **🤖 Multi-Agent Workflows** - Agents can identify themselves and coordinate via session
4. **💾 State Management** - Persist and resume work by session
5. **🔍 Zero-Overhead Metadata** - Session info always available without asking for it

### The Magic: `additionalContext`

The `additionalContext` field in UserPromptSubmit hook output gets injected **directly into Claude's system prompt** on every turn. This means:
- ✅ Available immediately (no tool calls)
- ✅ Always fresh (updated every prompt)
- ✅ Invisible to user (doesn't clutter conversation)
- ✅ Minimal cost (~10 tokens vs 50-100+ for tool calls)

## How It Works

1. **SessionStart hook** creates session name (e.g., "brave-elephant") and stores in `.claude/sessions.json`
2. **UserPromptSubmit hook** (this example) reads session ID from stdin
3. Uses `getSessionName()` to look up friendly name
4. Injects into Claude's context: `Current session: brave-elephant (7c6aaaf3)`

## Installation

### 1. Install the SDK

```bash
bun add claude-hooks-sdk@latest
# or
npm install claude-hooks-sdk@latest
```

### 2. Copy the hook

```bash
cp UserPromptSubmit.ts /path/to/your/project/.claude/hooks/
chmod +x /path/to/your/project/.claude/hooks/UserPromptSubmit.ts
```

**For advanced customization**, use `UserPromptSubmit.advanced.ts` instead - it shows how to add git branch info, environment variables, and custom error handling.

### 3. Register in `.claude/settings.json`

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

### 4. Test

Start a new Claude Code session and ask:
```
What is my current session ID?
```

Claude should respond **immediately without using any tools**:
```
Your current session is: brave-elephant (7c6aaaf3-...)
```

### ✅ Verification

You'll know it's working when:
1. Claude answers session questions **without** calling `Bash` or `Read` tools
2. Verbose mode shows: `UserPromptSubmit hook succeeded: Success`
3. No `.claude/sessions.json` file reads in the conversation

**Before this hook:**
```
> What is my current session ID?
⏺ Bash(cat .claude/sessions.json)  ← Tool call needed
⏺ Your current session is: brave-elephant
```

**After this hook:**
```
> What is my current session ID?
⏺ Your current session is: brave-elephant  ← Instant response, no tools!
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
- [claude-hooks-sdk](https://www.npmjs.com/package/claude-hooks-sdk) v0.8.0 or later (for `createUserPromptSubmitHook()` helper)
- SessionStart hook configured (for session naming)

**Note:** SDK v0.8.0+ includes the `createUserPromptSubmitHook()` helper which dramatically simplifies this pattern from ~60 lines to just 1 line!

## How `additionalContext` Works

From the [Claude Code hooks documentation](https://code.claude.com/docs/en/hooks.md):

```typescript
{
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: "Additional context to inject into Claude's prompt"
  }
}
```

The `additionalContext` field injects text directly into Claude's system prompt for that turn, making it available without appearing in the conversation history.

### ⚠️ CRITICAL: Use `additionalContext`, Not `userPromptContext`

**Common mistake:** The field is `additionalContext`, not `userPromptContext` or `context`.

```typescript
// ❌ WRONG - This won't work!
{
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    userPromptContext: "..."  // ❌ Wrong field name
  }
}

// ❌ WRONG - Don't wrap in `output`
{
  exitCode: 0,
  output: {
    hookSpecificOutput: {  // ❌ Extra nesting
      hookEventName: "UserPromptSubmit",
      additionalContext: "..."
    }
  }
}

// ✅ CORRECT - Simple, flat structure
{
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: "Current session: brave-elephant (7c6aaaf3)"
  }
}
```

**Testing tip:** If Claude still uses tools to find the session ID after installing this hook, check:
1. Hook is registered in `.claude/settings.json`
2. Using `additionalContext` (not `userPromptContext`)
3. No extra `output` wrapper in JSON structure
4. Hook script is executable (`chmod +x`)
5. Hook returns valid JSON to stdout

## Alternative Approaches

### Option 1: Write to `.claude/.current-session` file
- Pro: No token cost per request
- Con: Requires file read (tool call) to access

### Option 2: Environment variable injection
- Pro: Zero token cost
- Con: Not currently supported by Claude Code

### Option 3: This approach (additionalContext)
- Pro: Instantly available, no tools needed
- Pro: Always up-to-date
- Con: Small token cost per request (~10 tokens)

## See Also

- [custom-backend](../custom-backend/) - Session filtering and visualization
- [claude-hooks-sdk Session Naming](https://github.com/hgeldenhuys/claude-hooks-sdk#session-naming)
