import type { ReviewModule } from '../data/modules';
import type { ProjectSource } from '../data/sources';
import { masterSystemPrompt } from '../data/promptCore';

export interface ChatMessage {
  id: string;
  role: 'system' | 'assistant' | 'user';
  text: string;
  createdAt: string;
  moduleId?: number;
}

export interface ChatRequest {
  messages: ChatMessage[];
  activeModule?: ReviewModule;
  sources: ProjectSource[];
  selectedText?: string;
}

export interface ChatResponse {
  text: string;
  mode: 'proxy' | 'offline';
}

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const proxyUrl = localStorage.getItem('labirintos.proxyUrl') || import.meta.env.VITE_LLM_PROXY_URL || '/chat';
  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: masterSystemPrompt,
        ...request
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Proxy respondeu ${res.status}: ${text}`);
    }
    const data = await res.json();
    return { text: String(data.text ?? data.message ?? ''), mode: 'proxy' };
  }

  return { text: offlineGuide(request), mode: 'offline' };
}

function offlineGuide(request: ChatRequest) {
  const last = request.messages[request.messages.length - 1]?.text.toLowerCase() ?? '';
  const mod = request.activeModule;
  if (!mod) {
    return 'Escolha um módulo no painel lateral. Eu preparo o prompt, o checklist e o pacote de fontes correspondente. Para análise textual real, cole um trecho da dissertação no campo “Trecho em revisão” ou conecte um proxy LLM em Configurações.';
  }

  if (/aprovo|aprovado|confirmo|ok|sim|perfeito|validado/.test(last)) {
    return `Registrado: validação recebida para o Módulo ${mod.id} — ${mod.shortTitle}. Use o botão “Aprovar módulo” para travar esta etapa e liberar o próximo módulo no fluxo.`;
  }

  if (/documentário|documentario|vídeo|video|rodrigo|marta|carlos|dsc/.test(last)) {
    return `Para o documentário, use a aba “Documentário + DSC”. A regra do projeto é fundir Rodrigo, Marta e Carlos em Discurso do Sujeito Coletivo, com supressão de dados identificatórios. Enquanto o vídeo não estiver publicado em URL institucional do TJGO/YouTube, trate-o como material institucional em produção, com nota metodológica provisória.`;
  }

  if (/link|url|testar|acesso/.test(last)) {
    return 'Use a aba “Links” para colar a lista de URLs. O navegador pode bloquear alguns testes por CORS; para relatório formal e auditável, rode no terminal: npm run linkcheck.';
  }

  if (/periódico|periodico|artigo|dossiê|dossie|revista/.test(last)) {
    return 'O módulo “Periódicos” deve ser usado somente após validação final. Ele estrutura artigos derivados sem fatiamento indevido e exige busca atualizada para chamadas/dossiês, com links testados e checagem de periódico predatório.';
  }

  const sourceList = request.sources.map((s) => `- ${s.title}`).join('\n');
  return `Modo local ativo. Para análise completa deste módulo, copie o prompt abaixo para o ChatGPT com as fontes anexadas ou conecte um proxy LLM.\n\nMódulo ${mod.id}: ${mod.title}\n\nFontes deste módulo:\n${sourceList}\n\nPrompt recomendado:\n${mod.prompt}`;
}
