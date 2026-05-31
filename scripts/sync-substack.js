#!/usr/bin/env node
// Fetches prosolarmechanics.substack.com/feed and creates Markdown files
// in src/content/log/ for any new posts.

import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';

const FEED_URL = 'https://prosolarmechanics.substack.com/feed';
const OUTPUT_DIR = 'src/content/log';

async function fetchFeed() {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Failed to fetch feed: ${res.status}`);
  return res.text();
}

function extractCDATA(str) {
  const m = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1].trim() : str.trim();
}

function parseItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];

    const title = extractCDATA(
      (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''
    );
    const link = (
      (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] ||
      extractCDATA((block.match(/<atom:link[^>]*href="([^"]*)"/) || [])[1] || '')
    ).trim();
    const pubDate = ((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '').trim();
    const description = extractCDATA(
      (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || ''
    );
    const content = extractCDATA(
      (block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) || [])[1] || ''
    );

    // derive slug from the Substack URL  (/p/some-slug)
    const slugMatch = link.match(/\/p\/([^/?#]+)/);
    const slug = slugMatch ? slugMatch[1] : '';

    if (!slug || !title) continue;

    items.push({ title, link, pubDate, description, content: content || description, slug });
  }

  return items;
}

function escapeYaml(str) {
  return str.replace(/"/g, '\\"').replace(/\n/g, ' ').trim();
}

function buildMarkdown({ title, link, pubDate, description, content, slug }) {
  const date = pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const desc = description.replace(/<[^>]+>/g, '').slice(0, 200).trim();

  return `---
title: "${escapeYaml(title)}"
date: ${date}
substackUrl: "${link}"
description: "${escapeYaml(desc)}"
---

${content}
`;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const existing = new Set(
    readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
  );

  const xml = await fetchFeed();
  const items = parseItems(xml);

  let created = 0;
  for (const item of items) {
    if (existing.has(item.slug)) continue;
    const filePath = `${OUTPUT_DIR}/${item.slug}.md`;
    writeFileSync(filePath, buildMarkdown(item));
    console.log(`created: ${filePath}`);
    created++;
  }

  console.log(`done — ${created} new post(s) synced, ${items.length - created} already up to date.`);
}

main().catch(err => { console.error(err); process.exit(1); });
