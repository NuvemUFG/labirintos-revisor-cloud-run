#!/usr/bin/env node
/*
Cloud Run server for Labirintos Revisor.

Endpoints:
- GET  /health
- GET  /api/runtime-config
- POST /chat
- POST /api/check-url
- GET  /* static React build

AI provider order:
1. PROVIDER_URL custom institutional proxy, when defined
2. Vertex AI Gemini on Google Cloud, when AI_PROVIDER=vertex or VERTEX_AI_ENABLED=true
3. OpenAI Responses API, when OPENAI_API_KEY exists
4. Local advisor fallback
*/

import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = normalize(join(__dirname, '..'));
const distDir = join(rootDir, 'dist');
const port = Number(process.env.PORT || 8080);
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES || 2_000_000);

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


const agentCatalog = new Map([
  ['orquestrador', {
    name: 'Orquestrador acadêmico',
    role: 'Quebre a tarefa em etapas, delimite escopo, identifique dúvidas e impeça avanço sem validação de Érica.',
    output: 'Plano de ação, escopo, riscos de pressuposição e pergunta de validação.'
  }],
  ['privacidade', {
    name: 'Guardião de privacidade e ética',
    deterministic: true,
    role: 'Detecte dados pessoais, marcadores de reidentificação, nomes operacionais sensíveis, processos, datas, links e combinações narrativas vulnerabilizantes.',
    output: 'Lista de riscos, severidade, justificativa e sugestão de anonimização.'
  }],
  ['fontes', {
    name: 'Curador de fontes e rastreabilidade',
    role: 'Vincule cada afirmação a fonte disponível, fonte pendente ou dúvida objetiva para Érica.',
    output: 'Matriz afirmação-fonte, lacunas, fontes pertinentes e perguntas de conferência.'
  }],
  ['normativo', {
    name: 'Revisor ABNT e UFG/BDTD',
    role: 'Aplique NBR 14724, NBR 6023, NBR 10520, NBR 6027 e orientações de entrega UFG/BDTD sem redistribuir normas protegidas.',
    output: 'Correções formais, citações, referências, sumário, figuras, tabelas e checklist final.'
  }],
  ['metodologico', {
    name: 'Revisor metodológico',
    role: 'Avalie coerência entre estudo de caso, pesquisa-ação, autoetnografia, fenomenologia, material documental e participação da pesquisadora.',
    output: 'Diagnóstico metodológico, reescrita sugerida e salvaguardas científicas.'
  }],
  ['dsc', {
    name: 'Especialista em documentário e DSC',
    role: 'Transforme transcrições de Rodrigo, Marta e Carlos em matriz de Discurso do Sujeito Coletivo, suprimindo identificadores.',
    output: 'Expressões-chave, ideias centrais, ancoragens, discurso coletivo e nota metodológica.'
  }],
  ['links', {
    name: 'Auditor de links e referências online',
    deterministic: true,
    role: 'Extraia URLs, proponha teste, status, data de acesso e tratamento ABNT para fontes online.',
    output: 'Lista de URLs, pendências de teste e campos ABNT necessários.'
  }],
  ['editorial', {
    name: 'Editor de fluidez e diagramação',
    role: 'Reestruture trechos para leitura fluida, voz autoral, coesão, elementos interagentes e projeto editorial compatível com dissertação final.',
    output: 'Texto reestruturado, justificativas e recomendações de diagramação.'
  }],
  ['periodicos', {
    name: 'Estrategista de periódicos',
    role: 'Converta achados validados em recortes publicáveis, sem submissão duplicada, fatiamento indevido ou periódico predatório.',
    output: 'Matriz de artigos, critérios de periódicos, riscos de integridade e ações antes de submissão.'
  }],
  ['sintese', {
    name: 'Síntese final e validação humana',
    role: 'Integre pareceres dos agentes, elimine contradições, separe certeza de hipótese e encerre com decisão pendente para Érica.',
    output: 'Resposta consolidada com relatório, texto pronto para copiar, dúvidas e pergunta de validação.'
  }]
]);

const workflowCatalog = new Map([
  ['trecho-completo', { title: 'Revisão agêntica de trecho', agents: ['orquestrador', 'privacidade', 'fontes', 'normativo', 'metodologico', 'editorial', 'sintese'] }],
  ['documentario-dsc', { title: 'Documentário e DSC protetivo', agents: ['orquestrador', 'privacidade', 'dsc', 'fontes', 'normativo', 'sintese'] }],
  ['referencias-links', { title: 'Referências e links', agents: ['orquestrador', 'links', 'fontes', 'normativo', 'sintese'] }],
  ['versao-final', { title: 'Versão final UFG/BDTD', agents: ['orquestrador', 'privacidade', 'normativo', 'editorial', 'sintese'] }],
  ['artigos-periodicos', { title: 'Artigos e periódicos', agents: ['orquestrador', 'fontes', 'periodicos', 'links', 'sintese'] }]
]);

function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...extra
  };
}

function corsHeaders() {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, securityHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders()
  }));
  res.end(body);
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, securityHeaders({ 'Content-Type': contentType }));
  res.end(text);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error(`Request body exceeds ${maxBodyBytes} bytes.`);
    chunks.push(chunk);
  }
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

  return `${moduleInfo}\n\nFontes ativas declaradas no manifesto:\n${sources || '[sem fontes no payload]'}\n\nHistorico recente do chat:\n${messages || '[sem mensagens]'}${selectedText}\n\nResponda em portugues do Brasil, com postura de revisor academico, exigindo validacao de Erica antes de avancar. Nao exponha dados pessoais ou identificadores sensiveis.`;
}

function extractOpenAIText(data) {
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

function extractVertexText(data) {
  const parts = [];
  for (const candidate of data?.candidates || []) {
    for (const part of candidate?.content?.parts || []) {
      if (typeof part?.text === 'string') parts.push(part.text);
    }
  }
  const text = parts.join('\n').trim();
  if (text) return text;
  if (data?.promptFeedback) return `A resposta foi bloqueada ou nao retornou texto. Feedback: ${JSON.stringify(data.promptFeedback)}`;
  return JSON.stringify(data).slice(0, 4000);
}

async function getGoogleAccessToken() {
  if (process.env.GOOGLE_ACCESS_TOKEN) return process.env.GOOGLE_ACCESS_TOKEN;

  const tokenUrl = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';
  const response = await fetch(tokenUrl, { headers: { 'Metadata-Flavor': 'Google' } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Metadata token ${response.status}: ${text}`);
  const data = JSON.parse(text);
  if (!data.access_token) throw new Error('Metadata token response did not include access_token.');
  return data.access_token;
}

async function callVertexAI(payload) {
  const enabled = process.env.AI_PROVIDER === 'vertex' || process.env.VERTEX_AI_ENABLED === 'true';
  if (!enabled) return null;

  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'sei-ufg-nuvem-ndh';
  const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.VERTEX_LOCATION || 'global';
  const model = process.env.VERTEX_MODEL || 'gemini-2.5-pro';
  const maxOutputTokens = Number(process.env.VERTEX_MAX_OUTPUT_TOKENS || process.env.MAX_OUTPUT_TOKENS || 4096);
  const temperature = Number(process.env.VERTEX_TEMPERATURE || 0.2);
  const endpoint = location === 'global'
    ? `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`
    : `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;

  const token = await getGoogleAccessToken();
  const body = {
    systemInstruction: {
      parts: [{ text: payload.system || 'Voce e o revisor cientifico da dissertacao de Erica Fernanda. Nao invente dados; pergunte quando houver ambiguidade; respeite ABNT, etica e validacao da autora.' }]
    },
    contents: [
      { role: 'user', parts: [{ text: buildChatInput(payload) }] }
    ],
    generationConfig: {
      maxOutputTokens,
      temperature
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`Vertex AI ${response.status}: ${text}`);
  const data = JSON.parse(text);
  return { text: extractVertexText(data), provider: 'vertex-ai', model, location, project };
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
  return { text: extractOpenAIText(data), provider: 'openai', model };
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
    text: `Ambiente Cloud Run ativo em modo local. Recebi ${moduleName} com ${sourceCount} fontes no manifesto. Para ativar respostas generativas institucionais, configure AI_PROVIDER=vertex, GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION=global e conceda roles/aiplatform.user a conta de servico do Cloud Run. Enquanto isso, use os prompts, checklists, scanner de privacidade, Documentario + DSC, UFG/BDTD, Periodicos e teste de links server-side.`
  };
}


async function callAnyGenerative(payload) {
  const providerData = await callProvider(payload);
  if (providerData) return providerData;
  const vertexData = await callVertexAI(payload);
  if (vertexData) return vertexData;
  const openAIData = await callOpenAI(payload);
  if (openAIData) return openAIData;
  return null;
}

function limitText(value, max = 18000) {
  const text = String(value || '');
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n[trecho truncado pelo servidor: ${text.length - max} caracteres omitidos]`;
}

function flattenAgentContext(payload) {
  const dsc = payload.dsc || {};
  const sources = Array.isArray(payload.sources)
    ? payload.sources.map((s, i) => `${i + 1}. ${s.title || s.id || 'Fonte'} | ${s.fileName || s.link || s.kind || 'sem arquivo'} | confidencialidade: ${s.confidentiality || 'n/a'}`).join('\n')
    : '';
  const active = payload.activeModule ? `Módulo ${payload.activeModule.id} — ${payload.activeModule.title || payload.activeModule.shortTitle || ''}` : 'Módulo não informado';
  const dscBlock = [dsc.videoTitle, dsc.videoUrl, dsc.videoDuration, dsc.rodrigo, dsc.marta, dsc.carlos].some(Boolean)
    ? `\n\nCampos Documentário/DSC:\nTitulo: ${dsc.videoTitle || '[pendente]'}\nURL: ${dsc.videoUrl || '[pendente]'}\nDuração: ${dsc.videoDuration || '[pendente]'}\nRodrigo: ${limitText(dsc.rodrigo, 4500)}\nMarta: ${limitText(dsc.marta, 4500)}\nCarlos: ${limitText(dsc.carlos, 4500)}`
    : '';
  return `Tarefa solicitada por Érica:\n${payload.task || '[sem tarefa livre]'}\n\n${active}\n\nFontes ativas:\n${sources || '[sem fontes]'}\n\nTrecho/documento colado:\n${limitText(payload.selectedText || payload.text || '', 18000)}${dscBlock}`;
}

function extractUrlsFromText(text) {
  const matches = String(text || '').match(/https?:\/\/[^\s)\]}>"']+/g) || [];
  return Array.from(new Set(matches.map((url) => url.replace(/[.,;:]+$/, ''))));
}

function scanPrivacyServer(text) {
  const raw = String(text || '');
  const checks = [
    { label: 'CPF', severity: 'alto', regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b/g, suggestion: 'Remover ou substituir por [CPF suprimido].' },
    { label: 'E-mail', severity: 'medio', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, suggestion: 'Remover e manter apenas domínio institucional quando indispensável.' },
    { label: 'Telefone', severity: 'alto', regex: /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/g, suggestion: 'Remover telefones de participantes, equipe e contatos privados.' },
    { label: 'Número de processo/documento', severity: 'alto', regex: /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b|\b\d{4,}\/\d{2,4}\b/g, suggestion: 'Substituir por marcador genérico e manter em arquivo restrito.' },
    { label: 'Data específica', severity: 'baixo', regex: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, suggestion: 'Generalizar quando a data somada ao caso puder reidentificar.' },
    { label: 'Marcador pendente', severity: 'medio', regex: /\((?:xxx|fonte|anexo x|corrigir|verificar)\)/gi, suggestion: 'Resolver antes da versão de defesa ou transformar em pergunta para Érica.' },
    { label: 'Nome operacional sensível', severity: 'medio', regex: /\b(Rodrigo|Marta|Carlos|Pedro|Roberto)\b/g, suggestion: 'Confirmar se é pseudônimo e se não há combinação de dados que identifique.' }
  ];
  const findings = [];
  for (const check of checks) {
    const hits = raw.match(check.regex) || [];
    for (const hit of hits.slice(0, 8)) findings.push({ ...check, match: hit });
  }
  return findings;
}

function deterministicAgentOutput(agentId, context) {
  if (agentId === 'privacidade') {
    const findings = scanPrivacyServer(context);
    if (!findings.length) return 'Scanner determinístico: nenhum CPF, e-mail, telefone, processo, data específica ou marcador pendente foi detectado. Isso não substitui validação humana de Érica, especialmente em narrativas sensíveis.';
    return ['Scanner determinístico de privacidade:'].concat(findings.map((f) => `- [${f.severity}] ${f.label}: ${f.match} — ${f.suggestion}`)).join('\n');
  }
  if (agentId === 'links') {
    const urls = extractUrlsFromText(context);
    if (!urls.length) return 'Auditoria determinística: nenhuma URL foi encontrada no trecho/tarefa. Se houver referências online sem URL, Érica deve inserir os links para teste.';
    return ['URLs extraídas para teste e conferência ABNT:'].concat(urls.map((url) => `- ${url} | ação: testar status, registrar data de acesso, confirmar se é fonte oficial.`)).join('\n');
  }
  return 'Agente local: sem provedor generativo ativo. Configure AI_PROVIDER=vertex no Cloud Run para análise textual completa. Este agente foi registrado na trilha e suas instruções foram preservadas para auditoria.';
}

function agentSystemPrompt(agentId, agent) {
  return `Você é o agente "${agent.name}" do projeto Labirintos de Punição e Rodas de Cura.\nPapel: ${agent.role}\nEntrega esperada: ${agent.output}\n\nRegras obrigatórias:\n- Responda em português do Brasil.\n- Não invente dados, autores, páginas, decisões, links ou números.\n- Diferencie fato confirmado, hipótese interpretativa e pendência.\n- Preserve a voz autoral de Érica.\n- Proteja participantes e dados pessoais.\n- Não redistribua conteúdo de normas ABNT; use apenas síntese operacional.\n- Termine indicando o que Érica precisa validar.`;
}

async function runSingleAgent(agentId, payload, context, previousOutputs) {
  const agent = agentCatalog.get(agentId) || agentCatalog.get('sintese');
  const startedAt = new Date().toISOString();
  const previous = previousOutputs.length ? `\n\nSaídas anteriores dos agentes:\n${previousOutputs.map((step) => `## ${step.agentName}\n${limitText(step.output, 5000)}`).join('\n\n')}` : '';
  if (agent.deterministic) {
    const output = deterministicAgentOutput(agentId, context);
    return { agentId, agentName: agent.name, status: output.includes('[alto]') ? 'warning' : 'ok', summary: output.split('\n')[0], output, startedAt, completedAt: new Date().toISOString(), provider: 'deterministic' };
  }

  const agentPayload = {
    system: agentSystemPrompt(agentId, agent),
    messages: [],
    activeModule: payload.activeModule,
    sources: payload.sources,
    selectedText: `${context}${previous}`
  };

  try {
    const generated = await callAnyGenerative(agentPayload);
    if (generated?.text) {
      return { agentId, agentName: agent.name, status: 'ok', summary: `Análise gerada por ${generated.provider || 'modelo'}.`, output: generated.text, startedAt, completedAt: new Date().toISOString(), provider: generated.provider || 'modelo' };
    }
  } catch (error) {
    const output = `${deterministicAgentOutput(agentId, context)}\n\nFalha ao consultar provedor generativo para este agente: ${error instanceof Error ? error.message : String(error)}`;
    return { agentId, agentName: agent.name, status: 'warning', summary: 'Agente executado em fallback local por falha do provedor.', output, startedAt, completedAt: new Date().toISOString(), provider: 'local-fallback' };
  }

  const output = deterministicAgentOutput(agentId, context);
  return { agentId, agentName: agent.name, status: 'skipped', summary: 'Sem provedor generativo ativo; saída local registrada.', output, startedAt, completedAt: new Date().toISOString(), provider: 'local' };
}

function buildLocalFinal(workflow, steps) {
  const warnings = steps.filter((step) => step.status === 'warning' || step.status === 'blocked');
  const stepSummary = steps.map((step) => `- ${step.agentName}: ${step.summary}`).join('\n');
  return `# Síntese agêntica — ${workflow.title}\n\n## Trilha executada\n${stepSummary}\n\n## Resultado operacional\nO fluxo foi executado com ${steps.length} agentes. ${warnings.length ? `Há ${warnings.length} alerta(s) que Érica deve revisar antes de incorporar alterações.` : 'Não houve alerta determinístico crítico.'}\n\n## Próxima ação\nCopie as saídas dos agentes relevantes, revise as pendências e aplique as alterações somente após validação humana.\n\nÉrica, você aprova esta revisão? Deseja ajustar algo antes de prosseguirmos?`;
}

async function handleAgenticReview(req, res) {
  const payload = await readJson(req);
  const workflow = workflowCatalog.get(payload.workflowId) || workflowCatalog.get('trecho-completo');
  const context = flattenAgentContext(payload);
  const maxSteps = Math.max(1, Math.min(Number(process.env.AGENTIC_MAX_STEPS || workflow.agents.length), workflow.agents.length));
  const multiCalls = process.env.AGENTIC_MULTI_CALLS !== 'false';
  const selectedAgents = workflow.agents.slice(0, maxSteps);
  const steps = [];
  const warnings = [];

  if (!context.trim() || context.length < 80) warnings.push('Pouco contexto textual foi enviado. Cole o trecho da dissertação, transcrição ou lista de referências para análise efetiva.');

  if (!multiCalls) {
    const deterministic = selectedAgents.filter((id) => agentCatalog.get(id)?.deterministic);
    for (const agentId of deterministic) steps.push(await runSingleAgent(agentId, payload, context, steps));
    const synthesisAgent = selectedAgents.includes('sintese') ? 'sintese' : selectedAgents[selectedAgents.length - 1];
    steps.push(await runSingleAgent(synthesisAgent, payload, context, steps));
  } else {
    for (const agentId of selectedAgents) steps.push(await runSingleAgent(agentId, payload, context, steps));
  }

  const finalStep = [...steps].reverse().find((step) => step.agentId === 'sintese' && step.output) || steps[steps.length - 1];
  const final = finalStep?.output?.includes('Érica, você aprova') ? finalStep.output : `${finalStep?.output || buildLocalFinal(workflow, steps)}\n\nÉrica, você aprova esta revisão? Deseja ajustar algo antes de prosseguirmos?`;
  const provider = steps.find((step) => !['deterministic', 'local', 'local-fallback'].includes(step.provider || ''))?.provider;
  return sendJson(res, 200, {
    ok: true,
    workflowId: payload.workflowId || 'trecho-completo',
    workflowTitle: workflow.title,
    mode: provider ? 'agentic' : 'local',
    provider,
    steps,
    final,
    warnings
  });
}

async function handleChat(req, res) {
  const payload = await readJson(req);
  const providerData = await callProvider(payload);
  if (providerData) return sendJson(res, 200, providerData);
  const vertexData = await callVertexAI(payload);
  if (vertexData) return sendJson(res, 200, vertexData);
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
  if (!existsSync(filePath)) filePath = indexPath;

  if (!existsSync(filePath)) {
    return sendText(res, 503, 'Build not found. Run: npm install && npm run build && npm start', 'text/plain; charset=utf-8');
  }

  const contentType = mimeTypes.get(extname(filePath)) || 'application/octet-stream';
  const cacheControl = filePath.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-store';
  res.writeHead(200, securityHeaders({ 'Content-Type': contentType, 'Cache-Control': cacheControl }));
  createReadStream(filePath).pipe(res);
}

function runtimeConfig() {
  const provider = process.env.PROVIDER_URL ? 'custom' : (process.env.AI_PROVIDER === 'vertex' || process.env.VERTEX_AI_ENABLED === 'true') ? 'vertex-ai' : process.env.OPENAI_API_KEY ? 'openai' : 'local';
  return {
    ok: true,
    service: 'labirintos-revisor-react',
    provider,
    project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'sei-ufg-nuvem-ndh',
    location: process.env.GOOGLE_CLOUD_LOCATION || process.env.VERTEX_LOCATION || 'global',
    model: provider === 'vertex-ai' ? (process.env.VERTEX_MODEL || 'gemini-2.5-pro') : provider === 'openai' ? (process.env.OPENAI_MODEL || 'gpt-5.2') : undefined,
    agentic: { enabled: true, multiCalls: process.env.AGENTIC_MULTI_CALLS !== 'false', maxSteps: Number(process.env.AGENTIC_MAX_STEPS || 8) },
    env: process.env.APP_ENV || 'production'
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return sendJson(res, 204, {});
    if (req.method === 'GET' && req.url === '/health') return sendJson(res, 200, runtimeConfig());
    if (req.method === 'GET' && req.url === '/api/runtime-config') return sendJson(res, 200, runtimeConfig());
    if (req.method === 'POST' && req.url === '/api/agentic/review') return handleAgenticReview(req, res);
    if (req.method === 'POST' && req.url === '/chat') return handleChat(req, res);
    if (req.method === 'POST' && req.url === '/api/check-url') return handleCheckUrl(req, res);
    if (req.method === 'GET') return serveStatic(req, res);
    return sendJson(res, 404, { error: 'Rota nao encontrada.' });
  } catch (error) {
    return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[labirintos-cloud-run] ativo em http://0.0.0.0:${port}`);
  console.log('[labirintos-cloud-run] /chat usa PROVIDER_URL, Vertex AI, OPENAI_API_KEY ou modo local.');
  console.log('[labirintos-cloud-run] /api/agentic/review ativo com orquestracao multiagente.');
});
