
export const APP_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Hooks</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        gray: {
                            50: '#f9fafb',
                            100: '#f3f4f6',
                            200: '#e5e7eb',
                            300: '#d1d5db',
                            400: '#9ca3af',
                            500: '#6b7280',
                            600: '#4b5563',
                            700: '#374151',
                            800: '#1f2937',
                            900: '#111827',
                        },
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            500: '#3b82f6',
                            600: '#2563eb',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js"></script>
    
    <!-- Marked.js for Markdown -->
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

    <!-- Inter Font -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        [x-cloak] { display: none !important; }
        body { font-family: 'Inter', sans-serif; }
        pre, code { font-family: 'JetBrains Mono', monospace; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 h-screen flex overflow-hidden" x-data="app()">

    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div class="p-6 border-b border-gray-100">
            <h1 class="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Claude Hooks
            </h1>
            <p class="text-xs text-gray-500 mt-1">Event Monitor</p>
        </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <template x-for="item in navItems" :key="item.id">
                <button 
                    @click="currentView = item.id"
                    :class="currentView === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                >
                    <span x-html="item.icon"></span>
                    <span x-text="item.label"></span>
                    <span x-show="item.count" x-text="item.count" class="ml-auto bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs"></span>
                </button>
            </template>
        </nav>

        <div class="p-4 border-t border-gray-100">
            <div class="text-xs text-gray-400 font-mono">
                <div class="flex justify-between">
                    <span>Status</span>
                    <span class="text-green-600">Active</span>
                </div>
                <div class="flex justify-between mt-1">
                    <span>Events</span>
                    <span x-text="events.length"></span>
                </div>
                <div class="flex justify-between mt-1">
                    <span>Last Update</span>
                    <span x-text="lastUpdated"></span>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        
        <!-- Top Bar -->
        <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
            <h2 class="text-lg font-semibold text-gray-800" x-text="currentViewLabel"></h2>
            
            <div class="flex items-center gap-3">
                 <button @click="fetchEvents()" class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors" title="Refresh">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>
                <div class="h-4 w-px bg-gray-300"></div>
                 <span class="text-sm text-gray-500" x-text="'Session: ' + (currentSession || 'None')"></span>
            </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
            
            <!-- Dashboard View -->
            <div x-show="currentView === 'dashboard'" x-transition class="space-y-4">
                <template x-if="events.length === 0">
                    <div class="text-center py-20">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900">No events yet</h3>
                        <p class="text-gray-500 mt-1">Waiting for Claude Code to send data...</p>
                    </div>
                </template>

                <template x-for="event in events" :key="getEventId(event)">
                    <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        <div class="p-4 flex items-start gap-4">
                            <div class="shrink-0 mt-1">
                                <span :class="getBadgeClass(event.type)" class="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm">
                                    <span x-html="getEventIcon(event.type)"></span>
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h3 class="text-sm font-semibold text-gray-900" x-text="event.type"></h3>
                                            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono" x-text="event.sessionId"></span>
                                        </div>
                                        <p class="text-xs text-gray-500 mt-0.5" x-text="formatDate(event.timestamp)"></p>
                                    </div>
                                    <span class="text-xs text-gray-400 font-mono" x-text="getTimeAgo(event.timestamp)"></span>
                                </div>
                                
                                <div class="mt-3 text-sm text-gray-700 space-y-2">
                                    <!-- Dynamic Details based on event type -->
                                    <template x-if="event.details.message">
                                        <div class="bg-gray-50 rounded p-2 border border-gray-100">
                                            <p class="font-medium text-gray-500 text-xs uppercase mb-1">Message</p>
                                            <p class="whitespace-pre-wrap font-mono text-xs" x-text="event.details.message"></p>
                                        </div>
                                    </template>
                                    
                                    <template x-if="event.details.tool">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-semibold uppercase text-gray-500">Tool:</span>
                                            <code class="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100" x-text="event.details.tool"></code>
                                        </div>
                                    </template>
                                    
                                    <template x-if="event.details.path">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-semibold uppercase text-gray-500">Path:</span>
                                            <code class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100" x-text="event.details.path"></code>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Collapsible JSON -->
                        <div x-data="{ open: false }" class="border-t border-gray-100">
                            <button @click="open = !open" class="w-full px-4 py-2 bg-gray-50 text-left text-xs text-gray-500 hover:bg-gray-100 flex items-center justify-between">
                                <span x-text="open ? 'Hide Raw Payload' : 'Show Raw Payload'"></span>
                                <svg :class="{'rotate-180': open}" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div x-show="open" x-collapse class="p-4 bg-gray-900 overflow-x-auto">
                                <pre class="text-xs text-green-400" x-text="JSON.stringify(event.raw, null, 2)"></pre>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Chat View -->
            <div x-show="currentView === 'chat'" x-transition class="max-w-3xl mx-auto">
                <div class="space-y-6">
                    <template x-for="msg in chatMessages" :key="msg.id">
                        <div :class="msg.role === 'user' ? 'ml-12' : 'mr-12'" class="flex flex-col gap-1">
                            <div class="flex items-center gap-2 mb-1" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                                <span class="text-xs font-bold text-gray-500 uppercase" x-text="msg.role"></span>
                                <span class="text-xs text-gray-300" x-text="formatDate(msg.timestamp)"></span>
                            </div>
                            
                            <div :class="msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm'" class="p-4 overflow-hidden">
                                <!-- Thinking Block -->
                                <template x-if="msg.thinking">
                                    <details class="mb-3 bg-yellow-50/50 rounded-lg text-xs">
                                        <summary class="cursor-pointer p-2 text-yellow-700 font-medium select-none hover:bg-yellow-50 rounded">💭 Thinking Process</summary>
                                        <div class="p-3 border-t border-yellow-100/50 text-gray-600 prose prose-sm max-w-none" x-html="parseMarkdown(msg.thinking)"></div>
                                    </details>
                                </template>
                                
                                <!-- Message Content -->
                                <div class="prose max-w-none text-sm" 
                                     :class="msg.role === 'user' ? 'prose-invert' : 'prose-gray'"
                                     x-html="parseMarkdown(msg.content)"></div>
                            </div>
                        </div>
                    </template>
                    
                    <template x-if="chatMessages.length === 0">
                        <div class="text-center text-gray-400 py-10 italic">No conversation history found.</div>
                    </template>
                </div>
            </div>

            <!-- Files View -->
            <div x-show="currentView === 'files'" x-transition>
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <template x-for="op in fileOperations" :key="op.id">
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                              :class="{
                                                'bg-green-100 text-green-800': op.type === 'Write',
                                                'bg-blue-100 text-blue-800': op.type === 'Read',
                                                'bg-yellow-100 text-yellow-800': op.type === 'Edit',
                                                'bg-gray-100 text-gray-800': ['Glob', 'Grep'].includes(op.type)
                                              }" x-text="op.type">
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" x-text="op.path"></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="getTimeAgo(op.timestamp)"></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button @click="alert(JSON.stringify(op.details, null, 2))" class="text-indigo-600 hover:text-indigo-900">View</button>
                                    </td>
                                </tr>
                            </template>
                            <template x-if="fileOperations.length === 0">
                                <tr>
                                    <td colspan="4" class="px-6 py-10 text-center text-gray-500 text-sm">No file operations recorded yet.</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Stats View -->
            <div x-show="currentView === 'stats'" x-transition>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <dt class="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900" x-text="stats.totalEvents"></dd>
                    </div>
                     <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <dt class="text-sm font-medium text-gray-500 truncate">Tool Usage</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900" x-text="stats.toolUses"></dd>
                    </div>
                     <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <dt class="text-sm font-medium text-gray-500 truncate">Files Modified</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900" x-text="stats.filesModified"></dd>
                    </div>
                     <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <dt class="text-sm font-medium text-gray-500 truncate">Sessions</dt>
                        <dd class="mt-1 text-3xl font-semibold text-gray-900" x-text="stats.sessions"></dd>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <script>
        function app() {
            return {
                currentView: 'dashboard',
                events: [],
                lastUpdated: '-',
                
                navItems: [
                    { id: 'dashboard', label: 'Dashboard', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' },
                    { id: 'chat', label: 'Chat', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>' },
                    { id: 'files', label: 'File Operations', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
                    { id: 'stats', label: 'Analytics', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>' }
                ],

                get currentViewLabel() {
                    return this.navItems.find(i => i.id === this.currentView)?.label || 'Dashboard';
                },
                
                get currentSession() {
                    if (this.events.length > 0) return this.events[0].sessionName;
                    return null;
                },

                get chatMessages() {
                    // Extract conversation similar to the original server logic
                    const messages = [];
                    const seen = new Set();
                    
                    // Clone and reverse to process chronologically (oldest first)
                    const cronEvents = [...this.events].reverse();
                    
                    cronEvents.forEach(e => {
                        // User prompts - check event.prompt for instant display
                        if (e.type === 'UserPromptSubmit' && e.raw?.event?.prompt) {
                            const hash = 'user:' + e.raw.event.prompt.substring(0,50);
                            if (!seen.has(hash)) {
                                seen.add(hash);
                                messages.push({
                                    id: Math.random().toString(36),
                                    role: 'user',
                                    content: e.raw.event.prompt,
                                    timestamp: e.timestamp
                                });
                            }
                        }
                        
                        // Assistant responses from conversation context
                        if (e.raw && (e.raw.conversation || (e.raw.event && e.raw.event.conversation))) {
                            // Logic to extract from conversation context would go here
                            // For now we rely on what we can easily extract
                        }
                        
                        // NOTE: In a real implementation, we would fully port the "recentConversation" logic
                        // For this demo, we'll try to extract what we can from the payloads
                        if(e.raw.recentConversation) {
                            e.raw.recentConversation.forEach(msg => {
                                if(msg.type === 'user') {
                                     // We handle user messages above
                                } else if (msg.type === 'assistant') {
                                    let content = '';
                                    let thinking = '';
                                    if(Array.isArray(msg.message.content)) {
                                        msg.message.content.forEach(block => {
                                            if(block.type === 'text') content += block.text + '\\n';
                                            if(block.type === 'thinking') thinking += block.thinking + '\\n';
                                        });
                                    }
                                    const hash = 'asst:' + content.substring(0,50);
                                    if(!seen.has(hash) && (content || thinking)) {
                                        seen.add(hash);
                                        messages.push({
                                            id: Math.random().toString(36),
                                            role: 'assistant',
                                            content: content,
                                            thinking: thinking,
                                            timestamp: msg.timestamp || e.timestamp
                                        });
                                    }
                                }
                            });
                        }
                    });

                    // Reverse to show latest messages first
                    return messages.reverse();
                },

                get fileOperations() {
                    return this.events
                        .filter(e => e.type === 'PostToolUse' && ['Read', 'Write', 'Edit', 'Glob', 'Grep'].includes(e.details.tool))
                        .map(e => ({
                            id: Math.random(),
                            type: e.details.tool,
                            path: e.details.path,
                            timestamp: e.timestamp,
                            details: e.raw.event?.tool_input || {}
                        }));
                },

                get stats() {
                    const stats = {
                        totalEvents: this.events.length,
                        toolUses: 0,
                        filesModified: 0,
                        sessions: new Set().size
                    };
                    const sessions = new Set();
                    this.events.forEach(e => {
                        if(e.sessionId) sessions.add(e.sessionId);
                        if(e.type === 'PostToolUse') stats.toolUses++;
                        if(e.type === 'PostToolUse' && ['Write', 'Edit'].includes(e.details.tool)) stats.filesModified++;
                    });
                    stats.sessions = sessions.size;
                    return stats;
                },

                init() {
                    this.fetchEvents();
                    setInterval(() => this.fetchEvents(), 3000);
                },

                async fetchEvents() {
                    try {
                        const res = await fetch('/api/events');
                        if (!res.ok) throw new Error('Failed to fetch');
                        const data = await res.json();
                        
                        // Process events for UI
                        this.events = data.events.map(raw => {
                            const isPayload = raw.event !== undefined;
                            const event = isPayload ? raw.event : raw;
                            const timestamp = isPayload ? raw.timestamp : event.timestamp;
                            
                            let details = {
                                message: event.prompt || null,
                                tool: event.tool_name || null,
                                path: event.tool_input?.file_path || event.tool_input?.path || event.cwd || null,
                            };
                            
                            return {
                                type: event.hook_event_name || 'Unknown',
                                timestamp: timestamp || new Date().toISOString(),
                                sessionId: (event.session_id || '').substring(0, 8),
                                sessionName: event.session_name || 'Unknown',
                                details,
                                raw
                            };
                        });
                        
                        this.lastUpdated = new Date().toLocaleTimeString();
                    } catch (e) {
                        console.error(e);
                    }
                },

                getBadgeClass(type) {
                    const map = {
                        'SessionStart': 'bg-green-100 text-green-700',
                        'UserPromptSubmit': 'bg-blue-100 text-blue-700',
                        'PostToolUse': 'bg-purple-100 text-purple-700',
                        'Stop': 'bg-red-100 text-red-700'
                    };
                    return map[type] || 'bg-gray-100 text-gray-700';
                },

                getEventIcon(type) {
                    const map = {
                        'SessionStart': '🏁',
                        'UserPromptSubmit': '👤',
                        'PostToolUse': '🛠️',
                        'Stop': '🛑'
                    };
                    return map[type] || '📝';
                },

                getEventId(event) {
                    return event.timestamp + event.type;
                },

                formatDate(iso) {
                    if(!iso) return '';
                    return new Date(iso).toLocaleString();
                },

                getTimeAgo(iso) {
                    if(!iso) return '';
                    const seconds = Math.floor((new Date() - new Date(iso)) / 1000);
                    if (seconds < 60) return seconds + 's ago';
                    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
                    return Math.floor(seconds / 3600) + 'h ago';
                },
                
                parseMarkdown(text) {
                    if (!text) return '';
                    return marked.parse(text);
                }
            }
        }
    </script>
</body>
</html>
`;
