#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

const [,, inputPath = './links.txt', outputPath = './link-check-report.csv'] = process.argv;
const raw = await readFile(inputPath, 'utf8');
const urls = Array.from(new Set((raw.match(/https?:\/\/[^\s)\]}>"]+/g) ?? []).map((u) => u.replace(/[.,;:]+$/g, ''))));

async function check(url) {
  const checkedAt = new Date().toISOString();
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow' });
      return { url, ok: res.ok, status: res.status, statusText: res.statusText, method, checkedAt, finalUrl: res.url, error: '' };
    } catch (error) {
      if (method === 'GET') return { url, ok: false, status: '', statusText: '', method, checkedAt, finalUrl: '', error: error instanceof Error ? error.message : String(error) };
    }
  }
}

const rows = [];
for (const url of urls) {
  console.log(`[check] ${url}`);
  rows.push(await check(url));
}

const header = ['url','ok','status','statusText','method','checkedAt','finalUrl','error'];
const csv = [header.join(','), ...rows.map((row) => header.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
await writeFile(outputPath, csv, 'utf8');
console.log(`[ok] relatório salvo em ${outputPath} (${rows.length} links)`);
