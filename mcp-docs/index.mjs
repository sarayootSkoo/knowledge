import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, searchDocs, readDoc, listDocs, docStats } from './lib.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DOCS_DIR = resolve(__dirname, '../docs');

/** Always-fresh docs index — rebuilds on each tool call */
function getDocs() {
  const start = Date.now();
  const docs = buildIndex(DOCS_DIR);
  console.error(`[docs-mcp] index rebuilt: ${docs.length} files in ${Date.now() - start}ms`);
  return docs;
}

// --- Zod Schemas ---

const ResponseFormatSchema = z
  .enum(['json', 'markdown'])
  .default('json')
  .describe("Output format: 'json' for structured data or 'markdown' for human-readable");

const SearchInputSchema = z.object({
  query: z.string().min(1).max(200).describe('Search keyword (e.g. "order", "kafka")'),
  limit: z.number().int().min(1).max(50).default(10).describe('Max results (default: 10)'),
  offset: z.number().int().min(0).default(0).describe('Skip N results for pagination'),
  response_format: ResponseFormatSchema,
}).strict();

const ReadInputSchema = z.object({
  path: z.string().min(1).describe('Relative path (e.g. "oms-order-docs/api.md"). Use docs_list to find paths.'),
  offset: z.number().int().min(0).default(0).optional().describe('Start from line N (0-based)'),
  limit: z.number().int().min(0).default(0).optional().describe('Read N lines (0 = all)'),
}).strict();

const ListInputSchema = z.object({
  prefix: z.string().optional().describe('Filter by path prefix (e.g. "oms-order", "oms-webapp-specs")'),
  limit: z.number().int().min(1).max(200).default(50).describe('Max results (default: 50)'),
  offset: z.number().int().min(0).default(0).describe('Skip N results for pagination'),
  response_format: ResponseFormatSchema,
}).strict();

const StatsInputSchema = z.object({
  response_format: ResponseFormatSchema,
}).strict();

// --- MCP Server ---

const server = new McpServer({
  name: 'docs-mcp-server',
  version: '2.0.0',
});

server.registerTool(
  'docs_search',
  {
    title: 'Search Documentation',
    description: 'Search docs by keyword. Returns matching files ranked by relevance with line-level matches. Supports pagination via limit/offset.',
    inputSchema: SearchInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ query, limit, offset, response_format }) => ({
    content: [{ type: 'text', text: searchDocs(getDocs(), query, { limit, offset, format: response_format }) }],
  }),
);

server.registerTool(
  'docs_read',
  {
    title: 'Read Document',
    description: 'Read a doc by path. Supports line range via offset/limit to read specific sections. Use docs_search to find paths first.',
    inputSchema: ReadInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ path: docPath, offset = 0, limit = 0 }) => {
    const result = readDoc(getDocs(), docPath, { offset, limit });
    if (result.error) {
      return { isError: true, content: [{ type: 'text', text: result.message }] };
    }
    return { content: [{ type: 'text', text: result.content }] };
  },
);

server.registerTool(
  'docs_list',
  {
    title: 'List Documents',
    description: 'List docs filtered by prefix. Returns paths and titles with pagination. Use prefix to narrow by project (e.g. "oms-order-docs").',
    inputSchema: ListInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ prefix, limit, offset, response_format }) => ({
    content: [{ type: 'text', text: listDocs(getDocs(), { prefix, limit, offset, format: response_format }) }],
  }),
);

server.registerTool(
  'docs_stats',
  {
    title: 'Documentation Statistics',
    description: 'Get doc stats: total files, lines, and file counts per directory.',
    inputSchema: StatsInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ response_format }) => ({
    content: [{ type: 'text', text: docStats(getDocs(), { format: response_format }) }],
  }),
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('docs-mcp-server v2.0.0 running via stdio');
}

main().catch((err) => {
  console.error('MCP docs server failed:', err);
  process.exit(1);
});
