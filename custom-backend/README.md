# Custom Backend Example

Real-time hook event visualization server with conversation tracking, file change monitoring, and analytics.

## Features

**New: Modern Single Page Application (SPA) Interface**

### Dashboard
- Real-time hook event monitoring
- Clean, minimalistic timeline view
- Session name display with friendly names (e.g., "mutual-lion")
- Collapsible JSON payload viewer
- Event type badges and timestamps

### Chat View
- Full conversation timeline with user and assistant messages
- **Markdown rendering** - Code blocks, links, lists, and formatting
- **Thinking blocks** - Collapsible 💭 sections showing AI reasoning
- **Message filtering** - Focus purely on conversation flow

### File Changes
- Track Read/Write/Edit/Glob/Grep operations
- Visual indicators for operation types (Write vs Read)
- Collapsible detailed input parameters

### Analytics
- Usage statistics
- Tool usage breakdown
- File modification counts

## Quick Start

```bash
# Start the server
bun src/server.ts

# Configure hook (in .claude/settings.json)
{
  "hooks": {
    "SessionStart": [
      { "type": "command", "command": "bun $CLAUDE_PROJECT_DIR/.claude/examples/custom-backend/src/hook.ts" }
    ],
    "UserPromptSubmit": [
      { "type": "command", "command": "bun $CLAUDE_PROJECT_DIR/.claude/examples/custom-backend/src/hook.ts" }
    ],
    "PostToolUse": [
      { "type": "command", "command": "bun $CLAUDE_PROJECT_DIR/.claude/examples/custom-backend/src/hook.ts" }
    ],
    "Stop": [
      { "type": "command", "command": "bun $CLAUDE_PROJECT_DIR/.claude/examples/custom-backend/src/hook.ts" }
    ]
  }
}
```

## How It Works

1. **Hook** (`src/hook.ts`):
   - Receives events from Claude Code via stdin
   - Reads transcript file for conversation context
   - Creates `HookEventPayload` with event + conversation + timestamp
   - POSTs to backend server

2. **Server** (`src/server.ts`):
   - Stores events in-memory (latest 50)
   - Serves a modern SPA for visualization
   - Provides JSON API for the frontend

## API Endpoints

- `POST /events` - Receive hook events (requires API key)
- `GET /api/events` - JSON data for the frontend
- `GET /` - Main Single Page Application
- `GET /health` - Health check

## Configuration

Environment variables:
- `HOOK_BACKEND_URL` - Backend URL (default: `http://localhost:3030/events`)
- `HOOK_API_KEY` - API key for authentication (default: `demo-key-12345`)

## Architecture

Built with:
- **Bun** - Runtime and HTTP server
- **claude-hooks-sdk** - Session naming and transcript parsing
- **Tailwind CSS** - Styling (CDN)
- **Alpine.js** - Reactive frontend state (CDN)
- **marked.js** - Markdown rendering (CDN)
- **Pure TypeScript** - No build step or bundler required

## Development

```bash
# Run server
bun src/server.ts

# Run tests (when added)
bun test

# Lint/format
bun run lint
```
