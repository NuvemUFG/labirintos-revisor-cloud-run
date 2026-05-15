import type { ReviewModule } from './modules';
import type { ProjectSource } from './sources';

export type AgentId =
  | 'orquestrador'
  | 'privacidade'
  | 'fontes'
  | 'normativo'
  | 'metodologico'
  | 'dsc'
  | 'links'
  | 'editorial'
  | 'periodicos'
  | 'sintese';

export interface AgentSpec {
  id: AgentId;
  name: string;
  shortName: string;
  role: string;
  output: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  deterministic?: boolean;
}

export interface AgentWorkflow {
  id: string;
  title: string;
  description: string;
  agentIds: AgentId[];
  recommendedFor: string;
}

export const agentSpecs: AgentSpec[] = [
  {
    id: 'orquestrador',
    name: 'Orquestrador acadêmico',
    shortName: 'Orquestração',
    color: 'purple',
    role: 'Quebra a tarefa em etapas, define quais agentes devem atuar, registra dúvidas e impede avanço sem validação de Érica.',
    output: 'Plano de ação, escopo da análise, riscos de pressuposição e pergunta de validação.'
  },
  {
    id: 'privacidade',
    name: 'Guardião de privacidade e ética',
    shortName: 'Privacidade',
    color: 'orange',
    deterministic: true,
    role: 'Detecta dados pessoais, marcadores de reidentificação, nomes operacionais sensíveis, processos, datas, links e combinações narrativas vulnerabilizantes.',
    output: 'Lista de riscos, severidade, justificativa e sugestão de anonimização ou generalização.'
  },
  {
    id: 'fontes',
    name: 'Curador de fontes e rastreabilidade',
    shortName: 'Fontes',
    color: 'blue',
    role: 'Confere se cada afirmação está vinculada a fonte disponível, fonte pendente ou dúvida objetiva para Érica.',
    output: 'Matriz afirmação-fonte, lacunas, fontes anexadas pertinentes e perguntas de conferência.'
  },
  {
    id: 'normativo',
    name: 'Revisor ABNT e UFG/BDTD',
    shortName: 'ABNT/UFG',
    color: 'green',
    role: 'Aplica NBR 14724, NBR 6023, NBR 10520, NBR 6027 e orientações de entrega UFG/BDTD sem redistribuir normas protegidas.',
    output: 'Correções formais, citações, referências, sumário, figuras, tabelas e checklist final.'
  },
  {
    id: 'metodologico',
    name: 'Revisor metodológico',
    shortName: 'Metodologia',
    color: 'blue',
    role: 'Avalia coerência entre estudo de caso, pesquisa-ação, autoetnografia, fenomenologia, material documental e participação da pesquisadora.',
    output: 'Diagnóstico metodológico, reescrita sugerida e salvaguardas científicas.'
  },
  {
    id: 'dsc',
    name: 'Especialista em documentário e DSC',
    shortName: 'DSC',
    color: 'purple',
    role: 'Transforma transcrições de Rodrigo, Marta e Carlos em matriz de Discurso do Sujeito Coletivo, suprimindo identificadores.',
    output: 'Expressões-chave, ideias centrais, ancoragens, discurso coletivo e nota metodológica.'
  },
  {
    id: 'links',
    name: 'Auditor de links e referências online',
    shortName: 'Links',
    color: 'orange',
    deterministic: true,
    role: 'Extrai URLs, propõe teste, status, data de acesso e tratamento ABNT para fontes online.',
    output: 'Lista de URLs, pendências de teste e campos ABNT necessários.'
  },
  {
    id: 'editorial',
    name: 'Editor de fluidez e diagramação',
    shortName: 'Editorial',
    color: 'green',
    role: 'Reestrutura trechos para leitura fluida, voz autoral, coesão, elementos interagentes e projeto editorial compatível com dissertação final.',
    output: 'Texto reestruturado, justificativas e recomendações de diagramação.'
  },
  {
    id: 'periodicos',
    name: 'Estrategista de periódicos',
    shortName: 'Periódicos',
    color: 'blue',
    role: 'Converte achados validados em recortes publicáveis, sem submissão duplicada, fatiamento indevido ou periódico predatório.',
    output: 'Matriz de artigos, critérios de periódicos, riscos de integridade e ações antes de submissão.'
  },
  {
    id: 'sintese',
    name: 'Síntese final e validação humana',
    shortName: 'Síntese',
    color: 'purple',
    role: 'Integra os pareceres dos agentes, elimina contradições, separa certeza de hipótese e encerra com decisão pendente para Érica.',
    output: 'Resposta consolidada com relatório, texto pronto para copiar, dúvidas e pergunta de validação.'
  }
];

export const agentWorkflows: AgentWorkflow[] = [
  {
    id: 'trecho-completo',
    title: 'Revisão agêntica de trecho',
    description: 'Fluxo completo para cada trecho da dissertação: privacidade, fontes, ABNT, método, edição e síntese final.',
    agentIds: ['orquestrador', 'privacidade', 'fontes', 'normativo', 'metodologico', 'editorial', 'sintese'],
    recommendedFor: 'Trechos de capítulo, introdução, conclusão, análise de caso e revisão por módulo.'
  },
  {
    id: 'documentario-dsc',
    title: 'Documentário e DSC protetivo',
    description: 'Fluxo especializado para transcrições de Rodrigo, Marta e Carlos, com dissolução de dados identificatórios.',
    agentIds: ['orquestrador', 'privacidade', 'dsc', 'fontes', 'normativo', 'sintese'],
    recommendedFor: 'Transcrição do vídeo documental, matriz DSC, nota metodológica e referência audiovisual.'
  },
  {
    id: 'referencias-links',
    title: 'Referências e links',
    description: 'Fluxo para lista de referências, citações órfãs, URL, DOI, data de acesso e relatório de links.',
    agentIds: ['orquestrador', 'links', 'fontes', 'normativo', 'sintese'],
    recommendedFor: 'Módulo de referências, link do documentário, páginas TJGO/CNJ/UFG e fontes online.'
  },
  {
    id: 'versao-final',
    title: 'Versão final UFG/BDTD',
    description: 'Fluxo para fechamento pós-validação, versão pública, anexos restritos, declaração de IA e depósito institucional.',
    agentIds: ['orquestrador', 'privacidade', 'normativo', 'editorial', 'sintese'],
    recommendedFor: 'Arquivo final depois da aprovação da banca e antes do envio ao SIBI/UFG.'
  },
  {
    id: 'artigos-periodicos',
    title: 'Artigos e periódicos',
    description: 'Fluxo pós-dissertação para recortes publicáveis, integridade, autoria, dossiês e periódicos.',
    agentIds: ['orquestrador', 'fontes', 'periodicos', 'links', 'sintese'],
    recommendedFor: 'Planejamento de publicações após validação final por Érica e orientação.'
  }
];

export function getAgent(agentId: AgentId) {
  return agentSpecs.find((agent) => agent.id === agentId) ?? agentSpecs[0];
}

export function getWorkflow(workflowId: string) {
  return agentWorkflows.find((workflow) => workflow.id === workflowId) ?? agentWorkflows[0];
}

export function buildAgenticUserPrompt(params: {
  workflow: AgentWorkflow;
  module?: ReviewModule;
  sources: ProjectSource[];
  task: string;
  excerpt?: string;
}) {
  const sourceList = params.sources
    .map((source) => `- ${source.title} | ${source.fileName ?? source.link ?? source.kind} | confidencialidade: ${source.confidentiality}`)
    .join('\n');
  const moduleLine = params.module ? `Módulo ativo: ${params.module.id} — ${params.module.title}` : 'Módulo ativo: não informado';
  return `Fluxo agêntico: ${params.workflow.title}\n${moduleLine}\n\nTarefa de Érica:\n${params.task || '[sem tarefa livre]'}\n\nFontes disponíveis para este fluxo:\n${sourceList || '[sem fontes declaradas]'}\n\nTrecho/documento colado:\n${params.excerpt || '[sem trecho colado]'}\n\nRegras obrigatórias:\n1. Não inventar dados ou links; quando faltar dado, perguntar.\n2. Não expor CPF, RG, processos, cidade pequena, datas específicas, nomes reais, parentescos raros ou detalhes combinados que reidentifiquem.\n3. Distinguir achado confirmado, hipótese interpretativa e pendência de validação por Érica.\n4. Encerrar com: "Érica, você aprova esta revisão? Deseja ajustar algo antes de prosseguirmos?"`;
}
