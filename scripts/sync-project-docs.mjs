#!/usr/bin/env node
/**
 * sync-project-docs.mjs
 *
 * Scans all *-docs symlinks in knowledge/ and updates sidebar AUTO-GENERATED
 * sections in .vitepress/config.ts
 *
 * Usage:
 *   node knowledge/scripts/sync-project-docs.mjs
 *   pnpm sync-docs   (from inside knowledge/)
 */

import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE_DIR = join(__dirname, '..')
const CONFIG_PATH = join(KNOWLEDGE_DIR, '.vitepress/config.ts')

// Files to skip — not real docs
const EXCLUDE = new Set([
  'CLAUDE',
  'pull_request_template',
  'backend-api-issue-report',
])

// Convert SCREAMING_SNAKE_CASE filename to Title Case label
function toTitle(filename) {
  return filename
    .split(/[_-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

// Find all *-docs symlinks inside knowledge/
const docLinks = readdirSync(KNOWLEDGE_DIR, { withFileTypes: true })
  .filter(e => {
    if (!e.name.endsWith('-docs')) return false
    try { return lstatSync(join(KNOWLEDGE_DIR, e.name)).isSymbolicLink() }
    catch { return false }
  })

if (docLinks.length === 0) {
  console.log('No *-docs symlinks found in knowledge/.')
  process.exit(0)
}

let config = readFileSync(CONFIG_PATH, 'utf8')
let anyUpdated = false

for (const link of docLinks) {
  const prefix = link.name               // e.g. oms-order-docs
  const docsPath = join(KNOWLEDGE_DIR, prefix)

  // Read .md files, skip excluded ones, sort alphabetically
  let files
  try {
    files = readdirSync(docsPath)
      .filter(f => f.endsWith('.md') && !EXCLUDE.has(f.replace('.md', '')))
      .sort()
  } catch (err) {
    console.warn(`⚠  Cannot read ${docsPath}: ${err.message}`)
    continue
  }

  const startMarker = `// AUTO-GENERATED:${prefix}:start`
  const endMarker   = `// AUTO-GENERATED:${prefix}:end`
  const startIdx    = config.indexOf(startMarker)
  const endIdx      = config.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1) {
    console.log(`ℹ  No markers found for ${prefix} in config.ts — skipping`)
    console.log(`   Add these comments inside the items[] array:`)
    console.log(`   ${startMarker}`)
    console.log(`   ${endMarker}`)
    continue
  }

  // Detect indentation of the start marker line
  const lineStart = config.lastIndexOf('\n', startIdx) + 1
  const indent = config.slice(lineStart, startIdx).replace(/\S.*/, '')

  const generatedItems = files.map(f => {
    const name = f.replace('.md', '')
    return `${indent}{ text: '${toTitle(name)}', link: '/${prefix}/${name}' },`
  }).join('\n')

  const before = config.slice(0, startIdx + startMarker.length)
  const after  = config.slice(endIdx)
  config = `${before}\n${generatedItems}\n${indent}${after}`

  console.log(`✅ ${prefix}: ${files.length} docs synced`)
  files.forEach(f => console.log(`   • ${f.replace('.md', '')}`))
  anyUpdated = true
}

if (anyUpdated) {
  writeFileSync(CONFIG_PATH, config, 'utf8')
  console.log(`\n📝 .vitepress/config.ts updated`)
} else {
  console.log('Nothing to update.')
}
