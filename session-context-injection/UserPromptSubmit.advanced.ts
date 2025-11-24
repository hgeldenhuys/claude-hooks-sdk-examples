#!/usr/bin/env bun

/**
 * UserPromptSubmit Hook - Advanced Customization Example
 *
 * This example shows how to customize the createUserPromptSubmitHook() helper
 * with custom formatting, additional context, and error handling.
 */

import { createUserPromptSubmitHook } from 'claude-hooks-sdk';
import { execSync } from 'child_process';

createUserPromptSubmitHook({
  // Custom session format with emoji
  format: (name, id) => `🔵 Session: ${name} [${id.slice(0, 8)}]`,

  // Add additional context (git branch, environment, etc.)
  customContext: async (input) => {
    const parts: string[] = [];

    // Add git branch if available
    try {
      const branch = execSync('git branch --show-current', { cwd: input.cwd })
        .toString()
        .trim();
      if (branch) {
        parts.push(`Git branch: ${branch}`);
      }
    } catch {
      // Not a git repo or git not available
    }

    // Add environment if set
    if (process.env.NODE_ENV) {
      parts.push(`Environment: ${process.env.NODE_ENV}`);
    }

    // Add working directory
    parts.push(`Working directory: ${input.cwd}`);

    return parts.join('\n');
  },

  // Custom error handling
  onError: (err) => {
    // Log to file instead of stderr
    const fs = require('fs');
    const logPath = `${process.env.HOME}/.claude/hooks/errors.log`;
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] UserPromptSubmit error: ${err.message}\n`
    );
  },
});
