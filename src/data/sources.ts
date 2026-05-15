export type SourceConfidentiality = 'publica' | 'restrita' | 'sensivel' | 'temporaria';
export type SourceKind =
  | 'documento_matriz'
  | 'normativa_abnt'
  | 'integridade'
  | 'parecer'
  | 'prompt'
  | 'codigo'
  | 'conferencia'
  | 'audiovisual'
  | 'institucional_ufg'
  | 'usuario';

export interface ProjectSource {
  id: string;
  title: string;
  fileName?: string;
  kind: SourceKind;
  status: 'anexada' | 'referencia' | 'pendente' | 'externa' | 'usuario';
  confidentiality: SourceConfidentiality;
  useIn: string[];
  citationHint: string;
  link?: string;
  notes: string[];
  mustAskErica?: string[];
}

export const projectSources: ProjectSource[] = [
  {
    id: 'DIS_MATRIZ',
    title: 'Documento matriz da dissertação — Labirintos de Punição e Rodas de Cura',
    fileName: 'Cópia de Dissertação_Érica_Fernanda_Qualificação .pdf',
    kind: 'documento_matriz',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['Todos os módulos', 'revisão por trecho', 'conclusão', 'artigos'],
    citationHint: 'Usar como matriz textual. Sempre registrar página, seção e trecho revisado.',
    notes: [
      'Não substituir a autoria de Érica; o sistema atua como revisor e organizador.',
      'Trechos com casos reais devem passar pelo scanner de risco identificatório antes de qualquer envio ao modelo.',
      'A versão final deve preservar a voz em primeira pessoa quando metodologicamente pertinente.'
    ],
    mustAskErica: ['Confirmação de alterações substantivas', 'Autorização para reescrever narrativas de casos', 'Validação final de cada módulo']
  },
  {
    id: 'NBR14724',
    title: 'ABNT NBR 14724:2024 — Trabalhos acadêmicos — Apresentação',
    fileName: 'NBR14724 - Arquivo para impressão.pdf',
    kind: 'normativa_abnt',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['pré-textuais', 'formatação final', 'figuras e tabelas', 'paginação'],
    citationHint: 'Usar para estrutura, elementos pré/pós-textuais, margens, espaçamento, ilustrações e tabelas.',
    notes: ['Não redistribuir a norma no pacote; usar apenas como base de conformidade.']
  },
  {
    id: 'NBR6023',
    title: 'ABNT NBR 6023:2025 — Referências — Elaboração',
    fileName: 'NBR6023 - Arquivo para impressão.pdf',
    kind: 'normativa_abnt',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['referências', 'documentário', 'fontes online', 'artigos'],
    citationHint: 'Usar para padronizar referências; audiovisual online deve ser tratado como documento audiovisual em meio eletrônico.',
    notes: ['Aplicar lista única em ordem alfabética e consistência tipográfica.']
  },
  {
    id: 'NBR10520',
    title: 'ABNT NBR 10520:2023 — Citações em documentos — Apresentação',
    fileName: 'NBR10520 - Arquivo para impressão.pdf',
    kind: 'normativa_abnt',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['citações diretas', 'citações indiretas', 'apud', 'notas'],
    citationHint: 'Usar para correlação citação-referência, autor-data, citação direta/indireta e notas.',
    notes: ['Marcar citações órfãs e pedir fonte quando a obra não estiver na lista.']
  },
  {
    id: 'NBR6027',
    title: 'ABNT NBR 6027:2012 — Sumário — Apresentação',
    fileName: 'NBR6027 - Arquivo para impressão.pdf',
    kind: 'normativa_abnt',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['sumário', 'numeração progressiva', 'hierarquia de seções'],
    citationHint: 'Usar para revisar sumário, alinhamento, pontilhamento e correspondência com seções.',
    notes: ['Checar duplicidade 2.9/2.14 e ausência de 2.10 indicada no parecer.']
  },
  {
    id: 'CNPQ_INTEGRIDADE',
    title: 'Política de Integridade na Atividade Científica do CNPq',
    fileName: 'Política de Integridade na Atividade Científica CNPQ.pdf',
    kind: 'integridade',
    status: 'anexada',
    confidentiality: 'publica',
    useIn: ['integridade', 'uso de IA', 'autoria', 'dados', 'publicações'],
    citationHint: 'Usar como parâmetro de boas práticas científicas e prevenção de má conduta.',
    notes: ['Aplicar em conjunto com diretrizes UFG/CEP e com validação humana de todas as saídas de IA.']
  },
  {
    id: 'PARECER_INTEGRADO',
    title: 'Parecer Técnico Integrado — versão pós-qualificação com documentário',
    fileName: 'Parecer_Tecnico_Integrado_Erica_Fernanda.docx',
    kind: 'parecer',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['diagnóstico', 'prioridades', 'documentário', 'metodologia', 'referências'],
    citationHint: 'Usar como mapa de pendências e justificativas do orientador.',
    notes: [
      'Contém diagnóstico de erros: comitted, referências, duplicidades, tabela 8 vs 15, documentário e DSC.',
      'Não tomar como versão final sem validação de Érica.'
    ]
  },
  {
    id: 'SISTEMA_PROMPT',
    title: 'Sistema Mestre de Revisão — prompts e projeto editorial',
    fileName: 'Sistema_Prompt_ChatGPT_Dissertacao_NUCJUR.docx',
    kind: 'prompt',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['system prompt', 'workflow 9 módulos', 'paleta NUCJUR', 'apresentação responsiva'],
    citationHint: 'Usar como base do comportamento interativo: nunca avançar sem validação de Érica.',
    notes: ['Foi incorporado e aprimorado nesta aplicação.']
  },
  {
    id: 'REVISOR_SONNET',
    title: 'Revisor Interativo original — React/JSX criado no Sonnet',
    fileName: 'revisor_dissertacao_nucjur.jsx',
    kind: 'codigo',
    status: 'anexada',
    confidentiality: 'restrita',
    useIn: ['base visual', 'módulos', 'chat', 'checklists'],
    citationHint: 'Usar como protótipo de referência; esta versão separa dados, estado, fontes, link checker e DSC.',
    notes: ['O protótipo já continha 9 módulos, chat simulado, paleta e projeto editorial.']
  },
  {
    id: 'HISTORICO_UFG',
    title: 'Histórico acadêmico — pasta 12 - Érica Fernanda',
    fileName: 'historico_2024100455-2.pdf',
    kind: 'conferencia',
    status: 'anexada',
    confidentiality: 'sensivel',
    useIn: ['conferência de dados acadêmicos', 'folha de rosto', 'linha de pesquisa'],
    citationHint: 'Usar somente para conferir dados acadêmicos. Não expor CPF, RG, nascimento ou outros dados pessoais em prompts.',
    notes: [
      'Campos úteis não sensíveis: programa, área de concentração, linha de pesquisa, orientador e situação acadêmica.',
      'Dados pessoais devem permanecer fora do chat e da exportação pública.'
    ],
    mustAskErica: ['Autorização explícita antes de mostrar dados pessoais', 'Confirmação dos dados acadêmicos que irão para a folha de rosto']
  },
  {
    id: 'DOC_VIDEO',
    title: 'Justiça Restaurativa — Documentário institucional NUCJUR/TJGO',
    fileName: 'Justiça Restaurativa - Documetário.mp4',
    kind: 'audiovisual',
    status: 'pendente',
    confidentiality: 'temporaria',
    useIn: ['metodologia', 'DSC', 'referência audiovisual', 'apresentação HTML'],
    citationHint: 'Enquanto não publicado no YouTube/TJGO, tratar como material institucional em produção e evitar referência formal definitiva.',
    notes: [
      'Arquivo não acompanha este pacote; há espaço para inserir URL institucional quando publicado.',
      'Depoimentos de Rodrigo, Marta e Carlos devem ser fundidos em DSC com dissolução de identificadores.'
    ],
    mustAskErica: ['URL final no YouTube institucional', 'título oficial', 'duração', 'data de publicação', 'termos de autorização dos participantes']
  },
  {
    id: 'SIBI_BDTD',
    title: 'SIBI/UFG — Procedimentos para envio de teses e dissertações à BDTD',
    kind: 'institucional_ufg',
    status: 'externa',
    confidentiality: 'publica',
    useIn: ['versão final aprovada', 'depósito', 'metadados', 'TECA', 'embargo'],
    link: 'https://bc.ufg.br/n/33055-procedimentos-para-envio-das-teses-e-dissertacoes-para-publicacao-na-bdtd',
    citationHint: 'Usar no checklist final de depósito; verificar novamente antes do envio.',
    notes: ['O app inclui checklist baseado nas orientações públicas do SIBI/UFG; links devem ser retestados no dia do depósito.']
  }
];

export const academicConferenceSafeFields = [
  { label: 'Nome acadêmico', value: 'Érica Fernanda Teixeira Santos', sourceId: 'HISTORICO_UFG' },
  { label: 'Programa', value: 'Programa de Pós-Graduação em Direitos Humanos — Mestrado Acadêmico', sourceId: 'HISTORICO_UFG' },
  { label: 'Área de concentração', value: 'Direitos Humanos', sourceId: 'HISTORICO_UFG' },
  { label: 'Linha de pesquisa', value: 'Alteridade, Estigma e Educação em Direitos Humanos', sourceId: 'HISTORICO_UFG' },
  { label: 'Orientador', value: 'Prof. Dr. Elson Santos Silva', sourceId: 'HISTORICO_UFG' },
  { label: 'Situação acadêmica', value: 'Vínculo ativo; currículo em integralização', sourceId: 'HISTORICO_UFG' }
];
