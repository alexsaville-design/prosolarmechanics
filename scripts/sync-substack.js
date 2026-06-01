#!/usr/bin/env node
// Fetches prosolarmechanics.substack.com API and creates Markdown files
// in src/content/log/ for any new posts.

import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';

const API_URL = 'https://prosolarmechanics.substack.com/api/v1/posts?limit=25';
const OUTPUT_DIR = 'src/content/log';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function fetchPosts() {
  const res = await fetch(API_URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  return res.json();
}

function escapeYaml(str) {
  return (str || '').replace(/"/g, '\\"').replace(/\n/g, ' ').trim();
}

function buildMarkdown(post) {
  const date = post.post_date
    ? new Date(post.post_date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const desc = (post.description || post.subtitle || '')
    .replace(/<[^>]+>/g, '').slice(0, 200).trim();
  const url = post.canonical_url || `https://prosolarmechanics.substack.com/p/${post.slug}`;
  const body = post.body_html || post.truncated_body_text || '';

  return `---
title: "${escapeYaml(post.title)}"
date: ${date}
substackUrl: "${url}"
description: "${escapeYaml(desc)}"
---

${body}
`;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const existing = new Set(
    readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
  );

  const posts = await fetchPosts();
  console.log(`fetched ${posts.length} post(s) from Substack`);

  let created = 0;
  for (const post of posts) {
    if (!post.slug || !post.title) continue;
    if (existing.has(post.slug)) continue;
    const filePath = `${OUTPUT_DIR}/${post.slug}.md`;
    writeFileSync(filePath, buildMarkdown(post));
    console.log(`created: ${filePath}`);
    created++;
  }

  console.log(`done — ${created} new post(s) synced, ${posts.length - created} already up to date.`);
}

main().catch(err => { console.error(err); process.exit(1); });
