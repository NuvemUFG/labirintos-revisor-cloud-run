#!/usr/bin/env node
/*
Servidor unico para Replit: serve o build React/Vite e expoe endpoints seguros.
- GET  /health
- POST /chat           (OpenAI Responses API, provider institucional ou modo orientativo)
- POST /api/check-url  (teste de links server-side, sem bloqueio CORS do navegador)
*/

import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = normalize(join(__dirname, '..'));
const distDir = join(rootDir, 'dist');
const port = Number(process.env.PORT || process.env.REPLIT_PORT || 3000);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.csv', 'text/csv; charset=utf-8']
]);

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(body);
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(text);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function buildChatInput(payload) {
  const moduleInfo = payload.activeModule
    ? `Modulo ativo: ${payload.activeModule.id} - ${payload.activeModule.title || payload.activeModule.shortTitle || ''}`
    : 'Modulo ativo: nao informado';
  const sources = Array.isArray(payload.sources)
    ? payload.sources.map((s, i) => `${i + 1}. ${s.title || s.id || 'Fonte'} | arquivo/link: ${s.fileName || s.link || 'n/a'} | uso: ${(s.useIn || []).join('; ')} | confidencialidade: ${s.confidentiality || 'n/a'}`).join('\n')
    : '';
  const messages = Array.isArray(payload.messages)
    ? payload.messages.slice(-16).map((m) => `${m.role || 'user'}: ${m.text || ''}`).join('\n\n')
    : '';
  const selectedText = payload.selectedText
    ? `\n\nTrecho em revisao colado por Erica:\n${String(payload.selectedText).slice(0, 24000)}`
    : '';

  return `${moduleInfo}\n\nFontes ativas declaradas no manifesto:\n${sources || '[sem fontes no payload]'}\n\nHistorico recente do chat:\n${messages || '[sem mensagens]'}${selectedText}\n\nResponda em portugues do Brasil, com postura de revisor academico, exigindo validacao de Erica antes de avancar.`;
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text;
  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') parts.push(content.text);
      if (typeof content?.output_text === 'string') parts.push(content.output_text);
    }
  }
  return parts.join('\n').trim() || JSON.stringify(data).slice(0, 4000);
}

async function callOpenAI(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || 'gpt-5.2';
  const body = {
    model,
    instructions: payload.system || 'Voce e o revisor cientifico da dissertacao de Erica Fernanda. Nao invente dados; pergunte quando houver ambiguidade; respeite ABNT, etica e validacao da autora.',
    input: buildChatInput(payload),
    max_output_tokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 2500)
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${text}`);
  const data = JSON.parse(text);
  return { text: extractOutputText(data), provider: 'openai', model };
}

async function callProvider(payload) {
  const providerUrl = process.env.PROVIDER_URL || '';
  const providerApiKey = process.env.PROVIDER_API_KEY || '';
  if (!providerUrl) return null;

  const response = await fetch(providerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(providerApiKey ? { Authorization: `Bearer ${providerApiKey}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`Provider ${response.status}: ${text}`);
  try {
    const data = JSON.parse(text);
    return { text: String(data.text ?? data.message ?? data.output_text ?? text), provider: 'custom' };
  } catch {
    return { text, provider: 'custom' };
  }
}

function localAdvisor(payload) {
  const mod = payload.activeModule;
  const moduleName = mod ? `Modulo ${mod.id} - ${mod.title || mod.shortTitle}` : 'sem modulo selecionado';
  const sourceCount = Array.isArray(payload.sources) ? payload.sources.length : 0;
  return {
    provider: 'local-advisor',
    text: `Ambiente Replit ativo em modo local. Recebi ${moduleName} com ${sourceCount} fontes no manifesto. Para ativar respostas generativas completas, adicione OPENAI_API_KEY em Secrets do Replit e mantenha VITE_LLM_PROXY_URL=/chat ou deixe o padrao. Enquanto isso, use os prompts, checklists, scanner de privacidade, Documentario + DSC, UFG/BDTD, Periodicos e teste de links server-side.`
  };
}

async function handleChat(req, res) {
  const payload = await readJson(req);
  const providerData = await callProvider(payload);
  if (providerData) return sendJson(res, 200, providerData);
  const openAIData = await callOpenAI(payload);
  if (openAIData) return sendJson(res, 200, openAIData);
  return sendJson(res, 200, localAdvisor(payload));
}

async function checkUrl(url) {
  const checkedAt = new Date().toISOString();
  if (!/^https?:\/\//i.test(url)) {
    return { url, ok: false, checkedAt, method: 'blocked', error: 'URL invalida: use http:// ou https://.' };
  }
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, { method, redirect: 'follow' });
      return { url, ok: response.ok, status: response.status, statusText: response.statusText, method, checkedAt, finalUrl: response.url, error: '' };
    } catch (error) {
      if (method === 'GET') {
        return { url, ok: false, status: '', statusText: '', method, checkedAt, finalUrl: '', error: error instanceof Error ? error.message : String(error) };
      }
    }
  }
}

async function handleCheckUrl(req, res) {
  const payload = await readJson(req);
  return sendJson(res, 200, await checkUrl(String(payload.url || '')));
}

async function serveStatic(req, res) {
  const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';
  const requested = normalize(join(distDir, pathname));
  const indexPath = join(distDir, 'index.html');

  if (!requested.startsWith(distDir)) return sendText(res, 403, 'Forbidden');

  let filePath = requested;
  if (!existsSync(filePath)) {
    filePath = indexPath;
  }

  if (!existsSync(filePath)) {
    return sendText(
      res,
      503,
      'Build ainda nao encontrado. Rode: npm install && npm run build && npm start',
      'text/plain; charset=utf-8'
    );
  }

  const contentType = mimeTypes.get(extname(filePath)) || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return sendJson(res, 204, {});
    if (req.method === 'GET' && req.url === '/health') {
      return sendJson(res, 200, { ok: true, service: 'labirintos-revisor-react', mode: process.env.OPENAI_API_KEY ? 'openai' : process.env.PROVIDER_URL ? 'provider' : 'local' });
    }
    if (req.method === 'POST' && req.url === '/chat') return handleChat(req, res);
    if (req.method === 'POST' && req.url === '/api/check-url') return handleCheckUrl(req, res);
    if (req.method === 'GET') return serveStatic(req, res);
    return sendJson(res, 404, { error: 'Rota nao encontrada.' });
  } catch (error) {
    return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[labirintos-replit] ativo em http://0.0.0.0:${port}`);
  console.log('[labirintos-replit] /chat usa PROVIDER_URL, OPENAI_API_KEY ou modo local.');
});
