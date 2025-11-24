#!/usr/bin/env bun

/**
 * UserPromptSubmit Hook - Inject Session Context
 *
 * Automatically injects the current session ID and name into Claude's context
 * on every user prompt, making it available without needing to use tools.
 *
 * This solves the problem of Claude not knowing its own session ID, which is
 * useful for:
 * - Creating session-specific files/configs
 * - Logging/tracking by session
 * - Dynamic agent workflows that need to know the current session
 */

import { getSessionName } from 'claude-hooks-sdk';

interface HookInput {
  hook_event_name: string;
  session_id: string;
  prompt: string;
  cwd: string;
  timestamp: string;
}

// Read input from stdin
const stdinText = await Bun.stdin.text();
let input: HookInput;

try {
  input = JSON.parse(stdinText);
} catch (error) {
  // If parsing fails, exit with success to not block Claude
  console.log(JSON.stringify({ exitCode: 0 }));
  process.exit(0);
}

try {
  // Get session name from SDK
  const sessionName = getSessionName(input.session_id);

  // Inject session context into Claude's prompt
  console.log(JSON.stringify({
    exitCode: 0,
    output: {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        userPromptContext: `Current session: ${sessionName} (${input.session_id.substring(0, 8)})`
      }
    }
  }));

  process.exit(0);
} catch (error) {
  // On error, continue without injecting context
  console.error('[UserPromptSubmit Hook] Error:', error instanceof Error ? error.message : String(error));

  console.log(JSON.stringify({ exitCode: 0 }));
  process.exit(0);
}
