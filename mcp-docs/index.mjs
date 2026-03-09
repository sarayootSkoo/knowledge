import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readdirSync, readFileSync, statSync, realpathSync } from 'node:fs';
import { resolve, join, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DOCS_DIR = resolve(__dirname, '../docs');

// --- Helpers ---

/** Recursively collect all .md files, following symlinks */
function collectFiles(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        collectFiles(full, files);
      } else if (stat.isFile() && extname(entry.name) === '.md') {
        files.push(full);
      }
    } catch {
      // broken symlink or permission error — skip
    }
  }
  return files;
}

/** Build index once at startup */
function buildIndex() {
  const files = collectFiles(DOCS_DIR);
  return files.map((filePath) => {
    const rel = relative(DOCS_DIR, filePath);
    const content = readFileSync(filePath, 'utf-8');
    const firstLine = content.split('\n').find((l) => l.trim()) || '';
    const title =
      firstLine.startsWith('# ') ? firstLine.slice(2).trim() : basename(filePath, '.md');
    return { path: rel, filePath, title, content };
  });
}

const docs = buildIndex();

// --- MCP Server ---

const server = new McpServer({
  name: 'docs',
  version: '1.0.0',
});

server.tool(
  'search_docs',
  'Search documentation by keyword. Returns matching file paths, titles, and line-level matches.',
  {
    query: z.string().describe('Search keyword or phrase'),
    limit: z.number().optional().default(20).describe('Max results (default 20)'),
  },
  async ({ query, limit }) => {
    const q = query.toLowerCase();
    const results = [];

    for (const doc of docs) {
      const lines = doc.content.split('\n');
      const matches = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(q)) {
          matches.push({ line: i + 1, text: lines[i].trim().substring(0, 200) });
        }
      }
      // Also match on path and title
      const pathMatch = doc.path.toLowerCase().includes(q);
      const titleMatch = doc.title.toLowerCase().includes(q);

      if (matches.length > 0 || pathMatch || titleMatch) {
        results.push({
          path: doc.path,
          title: doc.title,
          matchCount: matches.length,
          matches: matches.slice(0, 5),
        });
      }
    }

    // Sort by match count descending
    results.sort((a, b) => b.matchCount - a.matchCount);

    return {
      content: [{ type: 'text', text: JSON.stringify(results.slice(0, limit), null, 2) }],
    };
  },
);

server.tool(
  'read_doc',
  'Read the full content of a documentation file by its relative path.',
  {
    path: z.string().describe('Relative path within docs/ (e.g. "oms-order-docs/api.md")'),
  },
  async ({ path: docPath }) => {
    const doc = docs.find((d) => d.path === docPath);
    if (!doc) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: 'Not found', path: docPath }) }],
      };
    }
    return {
      content: [{ type: 'text', text: doc.content }],
    };
  },
);

server.tool(
  'list_docs',
  'List all documentation files, optionally filtered by directory prefix.',
  {
    prefix: z
      .string()
      .optional()
      .describe('Filter by path prefix (e.g. "oms-order-specs")'),
  },
  async ({ prefix }) => {
    let filtered = docs;
    if (prefix) {
      const p = prefix.toLowerCase();
      filtered = docs.filter((d) => d.path.toLowerCase().startsWith(p));
    }
    const list = filtered.map((d) => ({ path: d.path, title: d.title }));
    return {
      content: [{ type: 'text', text: JSON.stringify(list, null, 2) }],
    };
  },
);

server.tool(
  'doc_stats',
  'Get documentation statistics: total files, files per directory, total lines.',
  {},
  async () => {
    const dirs = {};
    let totalLines = 0;
    for (const doc of docs) {
      const dir = doc.path.split('/')[0] || '(root)';
      dirs[dir] = (dirs[dir] || 0) + 1;
      totalLines += doc.content.split('\n').length;
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            { totalFiles: docs.length, totalLines, directories: dirs },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP docs server failed:', err);
  process.exit(1);
});
