# Claude Hooks SDK Examples

Advanced, production-ready examples for [claude-hooks-sdk](https://github.com/hgeldenhuys/claude-hooks-sdk).

## About

This repository contains sophisticated examples that demonstrate best practices and advanced patterns for building with the Claude Code hooks system. These examples go beyond basic usage to show real-world implementations with polished UX.

**Looking for basic examples?** Check out the [claude-hooks-sdk repository](https://github.com/hgeldenhuys/claude-hooks-sdk/tree/main/examples) for simpler, educational examples.

## Examples

### ⭐ [session-context-injection](./session-context-injection/) - **SUPER IMPORTANT!**

**The most powerful pattern in Claude Code hooks.** Automatically inject session ID and name into Claude's context on every prompt - **eliminating tool calls and making session info instantly available.**

**Problem:** Claude doesn't know its own session ID without using tools to read files.

**Solution:** UserPromptSubmit hook with `additionalContext` field - injects session context directly into Claude's system prompt on every turn.

**Why This Is Critical:**
- ✅ **Zero latency** - Session info available immediately, no tool calls
- ✅ **Token savings** - Saves 50-100+ tokens per request by avoiding file reads
- ✅ **Enables advanced workflows** - Session-specific files, logging, dynamic agents
- ✅ **Always up-to-date** - Fresh session context on every prompt
- ✅ **Production-ready pattern** - Simple, reliable, tested

**Use Cases:**
- 🎯 Session-specific file creation (`.agent/sessions/${sessionName}/`)
- 📊 Logging and analytics by session
- 🤖 Multi-agent workflows that need session awareness
- 🔍 Session metadata without overhead
- 📝 Conversation tracking and resumption

**Token cost:** ~10 tokens/request (tiny compared to 50-100+ saved)

**Status:** ✅ **VERIFIED WORKING** - Tested and confirmed in production

[View session-context-injection example →](./session-context-injection/)

---

### [custom-backend](./custom-backend/)

Real-time hook event visualization server with multiple specialized views.

**Features:**
- 🎨 **Event Dashboard** - Smart polling, session names, JSON payloads
- 💬 **Chat View** - Markdown rendering, thinking blocks (💭), latest-first display, session filtering
- 📁 **File Changes** - Track Read/Write/Edit/Glob/Grep operations
- 📊 **Transactions** - Event timeline table
- 📈 **Context Usage** - Analytics dashboard

**Tech Stack:**
- Bun HTTP server with inline HTML templates
- claude-hooks-sdk for session naming and transcript parsing
- marked.js for markdown rendering
- Pure TypeScript - no build step required

**Perfect for:**
- Building observability dashboards
- Understanding transcript structure
- Learning advanced UX patterns
- Production-ready hook implementations

[View custom-backend example →](./custom-backend/)

## Requirements

- [Bun](https://bun.sh/) v1.0 or later
- [claude-hooks-sdk](https://www.npmjs.com/package/claude-hooks-sdk) v0.7.2 or later

## Installation

Each example is self-contained. Navigate to the example directory and follow its README.

```bash
cd custom-backend
bun install
bun src/server.ts
```

## Contributing

Have an advanced pattern or implementation you'd like to share? Pull requests are welcome!

## License

MIT

## Related

- [claude-hooks-sdk](https://github.com/hgeldenhuys/claude-hooks-sdk) - Main SDK repository
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/hooks) - Official hooks documentation
