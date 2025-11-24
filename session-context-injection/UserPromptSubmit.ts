#!/usr/bin/env bun

/**
 * UserPromptSubmit Hook - Inject Session Context
 *
 * Automatically injects the current session ID and name into Claude's context
 * on every user prompt, making it available without needing to use tools.
 *
 * This uses the built-in createUserPromptSubmitHook() helper from claude-hooks-sdk
 * which handles all the complexity for you.
 *
 * For advanced customization, see README.md
 */

import { createUserPromptSubmitHook } from 'claude-hooks-sdk';

// That's it! Session context automatically injected
createUserPromptSubmitHook();
