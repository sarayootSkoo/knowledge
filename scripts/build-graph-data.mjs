#!/usr/bin/env node
/**
 * build-graph-data.mjs
 * สแกน markdown files ใน knowledge/ แล้วสร้าง graph-data.json
 * Usage: node knowledge/scripts/build-graph-data.mjs
 */
import { readdir, readFile, stat, writeFile, readlink } from 'fs/promises';
import { join, relative, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_ROOT = join(__dirname, '..');
const OUTPUT_FILE = join(KNOWLEDGE_ROOT, 'demo', 'graph-data.json');

// Category detection from path
function detectCategory(relPath) {
  if (relPath.startsWith('decisions/')) return 'decisions';
  if (relPath.startsWith('discussion/')) return 'discussion';
  if (relPath.startsWith('oms-order-docs/')) return 'oms-order';
  if (relPath.startsWith('oms-webapp-docs/')) return 'oms-webapp';
  if (relPath.startsWith('oms-webapp-help-docs/')) return 'oms-help';
  if (relPath.startsWith('scripts/') || relPath.startsWith('.')) return 'meta';
  if (relPath.startsWith('demo/')) return 'meta';
  return 'core';
}

// Extract first # heading
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

// Extract all ## headings
function extractHeadings(content) {
  const matches = [...content.matchAll(/^#{2,3}\s+(.+)$/gm)];
  return matches.map(m => m[1].trim());
}

// Extract **bold** terms
function extractBoldTerms(content) {
  const matches = [...content.matchAll(/\*\*([^*]+)\*\*/g)];
  return [...new Set(matches.map(m => m[1].trim()).filter(t => t.length < 50))];
}

// Extract markdown links [text](path)
function extractLinks(content, currentFile) {
  const matches = [...content.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)];
  const links = [];
  for (const m of matches) {
    const text = m[1];
    let target = m[2];
    // Skip external URLs and anchors
    if (target.startsWith('http') || target.startsWith('#') || target.startsWith('mailto:')) continue;
    // Resolve relative paths
    if (!target.startsWith('/')) {
      const dir = dirname(currentFile);
      target = join(dir, target);
    }
    // Normalize: remove .md extension, leading ./
    target = target.replace(/\.md$/, '').replace(/^\.\//, '');
    links.push({ text, target });
  }
  return links;
}

// Extract references to other knowledge files (pattern-based)
function extractImplicitRefs(content) {
  const refs = [];
  const patterns = [
    /`knowledge\/([^`]+\.md)`/g,
    /`([^`]+\/[^`]+\.md)`/g,
    /(?:See|see|Read|read|Check|check)\s+[`"]?([A-Z_]+\.md)[`"]?/g,
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      refs.push(match[1].replace(/\.md$/, ''));
    }
  }
  return [...new Set(refs)];
}

// Recursively scan directory for .md files
async function scanDir(dir, root = dir) {
  const files = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    // Skip hidden dirs, node_modules, .vitepress cache/dist
    if (entry.name.startsWith('.') && entry.name !== '.vitepress') continue;
    if (entry.name === 'node_modules') continue;
    if (entry.name === 'cache' || entry.name === 'dist') continue;
    if (entry.name === 'demo') continue; // skip our own output

    if (entry.isDirectory()) {
      files.push(...await scanDir(fullPath, root));
    } else if (entry.isSymbolicLink()) {
      // Follow symlinks to directories
      try {
        const s = await stat(fullPath);
        if (s.isDirectory()) {
          files.push(...await scanDir(fullPath, root));
        } else if (s.isFile() && extname(entry.name) === '.md') {
          files.push(fullPath);
        }
      } catch { /* broken symlink */ }
    } else if (extname(entry.name) === '.md') {
      files.push(fullPath);
    }
  }
  return files;
}

// Main
async function main() {
  console.log('Scanning markdown files...');
  const mdFiles = await scanDir(KNOWLEDGE_ROOT);

  const nodesMap = new Map();
  const allLinks = [];

  for (const filePath of mdFiles) {
    const relPath = relative(KNOWLEDGE_ROOT, filePath);
    const cat = detectCategory(relPath);

    // Skip CLAUDE.md meta files (noise)
    if (basename(filePath) === 'CLAUDE.md' && cat !== 'core') continue;

    let content;
    try {
      content = await readFile(filePath, 'utf-8');
    } catch { continue; }

    const title = extractTitle(content);
    const headings = extractHeadings(content);
    const boldTerms = extractBoldTerms(content);
    const mdLinks = extractLinks(content, relPath);
    const implicitRefs = extractImplicitRefs(content);
    const keywords = [...new Set([...headings.slice(0, 8), ...boldTerms.slice(0, 10)])];

    // Create short ID from filename
    const id = relPath.replace(/\.md$/, '').replace(/\//g, '-').toUpperCase();

    // First line of content for description (skip heading)
    const descLines = content.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('>')).slice(0, 2);
    const desc = descLines.join(' ').replace(/[*`[\]]/g, '').trim().substring(0, 200);

    // Markdown preview: first 120 lines (strip claude-mem noise)
    const previewLines = content.split('\n')
      .filter(l => !l.includes('claude-mem') && !l.includes('<!-- This section') && !l.includes('<!-- AUTO-GENERATED'))
      .slice(0, 120);
    const preview = previewLines.join('\n');

    nodesMap.set(id, {
      id,
      file: relPath,
      label: title || basename(filePath, '.md'),
      cat,
      desc: desc || title || relPath,
      keywords,
      filePath: filePath,
      preview,
    });

    // Collect links for edge creation
    for (const link of mdLinks) {
      allLinks.push({ sourceFile: relPath, target: link.target, label: link.text });
    }
    for (const ref of implicitRefs) {
      allLinks.push({ sourceFile: relPath, target: ref, label: 'reference' });
    }
  }

  // Build edges by matching link targets to node files
  const edges = [];
  const edgeSet = new Set();

  for (const link of allLinks) {
    const sourceId = relative(KNOWLEDGE_ROOT, join(KNOWLEDGE_ROOT, link.sourceFile))
      .replace(/\.md$/, '').replace(/\//g, '-').toUpperCase();

    if (!nodesMap.has(sourceId)) continue;

    // Try to find target node
    let targetId = null;
    for (const [nid, node] of nodesMap) {
      const normTarget = link.target.replace(/\//g, '-').toUpperCase();
      const normFile = node.file.replace(/\.md$/, '').replace(/\//g, '-').toUpperCase();
      if (normFile === normTarget || normFile.endsWith(normTarget) || nid.endsWith(normTarget)) {
        targetId = nid;
        break;
      }
    }

    if (targetId && targetId !== sourceId) {
      const edgeKey = `${sourceId}→${targetId}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          source: sourceId,
          target: targetId,
          label: link.label.substring(0, 40),
        });
      }
    }
  }

  // Calculate reference counts
  const refCounts = {};
  for (const node of nodesMap.values()) refCounts[node.id] = 0;
  for (const edge of edges) {
    refCounts[edge.target] = (refCounts[edge.target] || 0) + 1;
    refCounts[edge.source] = (refCounts[edge.source] || 0) + 1;
  }

  // Build final output
  const nodes = [...nodesMap.values()].map(n => ({
    id: n.id,
    file: n.file,
    label: n.label,
    cat: n.cat,
    desc: n.desc,
    keywords: n.keywords,
    refs: refCounts[n.id] || 0,
    filePath: n.filePath,
    preview: n.preview || '',
  }));

  const output = {
    generated: new Date().toISOString(),
    root: KNOWLEDGE_ROOT,
    stats: {
      totalFiles: nodes.length,
      totalLinks: edges.length,
      categories: [...new Set(nodes.map(n => n.cat))],
    },
    nodes,
    links: edges,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nGraph data written to: ${OUTPUT_FILE}`);
  console.log(`  Nodes: ${nodes.length}`);
  console.log(`  Edges: ${edges.length}`);
  console.log(`  Categories: ${output.stats.categories.join(', ')}`);
}

main().catch(console.error);
