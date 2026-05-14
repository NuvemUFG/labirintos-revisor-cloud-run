/*
Proxy genérico para conectar o React a um modelo de linguagem sem expor chave no navegador.

Uso:
  1) Configure PROVIDER_URL e PROVIDER_API_KEY conforme seu provedor institucional.
  2) Rode: npm run proxy
  3) No app, configure URL: http://localhost:8787/chat

Contrato esperado do provedor: POST JSON com { system, messages, activeModule, sources, selectedText }.
Adapte a função callProvider() ao seu ambiente (OpenAI, Azure, servidor local, gateway institucional etc.).
*/

import http from 'node:http';

const port = Number(process.env.PORT || 8787);
const providerUrl = process.env.PROVIDER_URL || '';
const providerApiKey = process.env.PROVIDER_API_KEY || '';

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function callProvider(payload) {
  if (!providerUrl) {
    return {
      text: `Proxy ativo, mas PROVIDER_URL não foi configurado. Recebi o módulo ${payload.activeModule?.id ?? 'sem módulo'} e ${payload.sources?.length ?? 0} fontes. Configure server/llm-proxy.mjs para seu gateway institucional.`
    };
  }

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
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});
  if (req.method !== 'POST' || req.url !== '/chat') return sendJson(res, 404, { error: 'Use POST /chat' });

  try {
    const raw = await readBody(req);
    const payload = JSON.parse(raw);
    const data = await callProvider(payload);
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, () => {
  console.log(`[labirintos-proxy] ouvindo em http://localhost:${port}/chat`);
});
