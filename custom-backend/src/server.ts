#!/usr/bin/env bun
import { APP_HTML } from './ui';

/**
 * Example: Mini Bun Server for Claude Code Hook Events
 *
 * This demonstrates how to build a simple backend that:
 * - Receives hook events via HTTP POST
 * - Stores events in memory
 * - Renders an HTML page showing recent events
 * - Uses custom headers for API key authentication
 *
 * Run with: bun server.ts
 * View at: http://localhost:3030
 */

interface HookEvent {
  hook_event_name: string;
  session_id: string;
  timestamp: string;
  context?: Record<string, unknown>;
  session_name?: string;
  [key: string]: unknown;
}

// In-memory store for events (latest first)
const events: HookEvent[] = [];
const MAX_EVENTS = 50;

// Simple API key for demonstration
const API_KEY = 'demo-key-12345';

const server = Bun.serve({
  port: 3030,
  async fetch(req) {
    const url = new URL(req.url);

    // POST /events - Receive hook events
    if (req.method === 'POST' && url.pathname === '/events') {
      // Check custom X-API-Key header
      const apiKey = req.headers.get('X-API-Key');
      if (apiKey !== API_KEY) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid API key' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'X-Server-Version': '1.0.0', // Custom header example
            },
          }
        );
      }

      try {
        const payload: HookEvent = await req.json();

        // Add to front of array (latest first)
        events.unshift(payload);

        // Keep only MAX_EVENTS
        if (events.length > MAX_EVENTS) {
          events.pop();
        }

        // Handle both HookEventPayload and flat structures for logging
        const isPayloadStructure = (payload as any).event !== undefined;
        const event = isPayloadStructure ? (payload as any).event : payload;
        const eventName = event.hook_event_name || 'unknown';
        const sessionName = event.session_name || 'unnamed';
        const sessionId = event.session_id ? event.session_id.substring(0, 8) : 'unknown';

        console.log(`📥 Received ${eventName} event from session ${sessionName} (${sessionId})`);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Event received',
            total_events: events.length,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Server-Version': '1.0.0',
              'X-Events-Count': events.length.toString(),
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // GET /api/events - JSON data for frontend
    if (req.method === 'GET' && url.pathname === '/api/events') {
       return new Response(JSON.stringify({ events }), {
        headers: {
            'Content-Type': 'application/json'
        }
       });
    }

    // GET / - Display HTML page with events
    // Serve the app shell for any non-API route to support client-side routing feel
    if (req.method === 'GET' && (url.pathname === '/' || !url.pathname.startsWith('/api/') && !url.pathname.includes('.'))) {
       return new Response(APP_HTML, {
        headers: {
          'Content-Type': 'text/html',
          'X-Server-Version': '2.0.0',
        },
      });
    }

    // GET /health - Health check
    if (req.method === 'GET' && url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          events_count: events.length,
          uptime_seconds: Math.floor(process.uptime()),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Server-Version': '1.0.0',
          },
        }
      );
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🚀 Claude Code Hook Events Server running at http://localhost:${server.port}`);
console.log(`📊 View events at http://localhost:${server.port}/`);
console.log(`🔑 API Key: ${API_KEY}`);
