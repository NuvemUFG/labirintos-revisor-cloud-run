import type { ProjectSource } from './sources';

export type Stage = 'revisao' | 'documentario' | 'finalizacao' | 'periodicos';

export interface ReviewModule {
  id: number;
  stage: Stage;
  title: string;
  shortTitle: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  sourceIds: string[];
  goals: string[];
  requiredChecks: string[];
  prompt: string;
  acceptanceQuestion: string;
}

const validationLine = 'Ao final, pergunte literalmente: "Érica, você aprova esta revisão? Deseja ajustar algo antes de prosseguirmos?" Não avance sem validação explícita.';

export const reviewModules: ReviewModule[] = [
  {
    id: 1,
    stage: 'revisao',
    title: 'Capa, folha de rosto e pré-textuais',
    shortTitle: 'Pré-textuais',
    color: 'blue',
    sourceIds: ['DIS_MATRIZ', 'NBR14724', 'HISTORICO_UFG', 'SISTEMA_PROMPT'],
    goals: [
      'Conferir identificação acadêmica sem expor dados sensíveis do histórico.',
      'Ajustar capa, folha de rosto, agradecimentos, resumo, abstract, listas e sumário na ordem adequada.',
      'Separar elementos obrigatórios, opcionais e pendentes.'
    ],
    requiredChecks: [
      'Folha de rosto com autora, título, natureza do trabalho, programa, linha, orientador, coorientação, local e ano.',
      'Folha de aprovação ou placeholder pós-defesa com data e banca.',
      'Dados pessoais não enviados ao modelo sem autorização.',
      'Ordem pré-textual validada segundo NBR 14724:2024.'
    ],
    prompt: `Iniciamos pelo Módulo 1 — Capa e pré-textuais. Use como base: documento matriz da dissertação, histórico acadêmico apenas para conferência segura e NBR 14724:2024. Verifique: (a) ordem dos elementos pré-textuais; (b) completude da folha de rosto; (c) existência ou pendência de folha de aprovação; (d) consistência entre nome da autora, programa, linha, orientação e coorientação; (e) ausência de dados pessoais sensíveis no texto final. Entregue: relatório de problemas, texto corrigido de cada elemento e lista de dúvidas para Érica. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova os elementos pré-textuais e os dados acadêmicos que irão para a versão final?'
  },
  {
    id: 2,
    stage: 'revisao',
    title: 'Resumo, Abstract e palavras-chave',
    shortTitle: 'Resumo',
    color: 'orange',
    sourceIds: ['DIS_MATRIZ', 'PARECER_INTEGRADO', 'NBR14724'],
    goals: [
      'Reformular resumo e abstract para refletir objetivo, método, resultados, limites e conclusão.',
      'Corrigir o erro "comitted" para "committed".',
      'Validar as palavras-chave sem inflar termos que não estejam sustentados no texto.'
    ],
    requiredChecks: [
      'Resumo em português sem citações e com linguagem acadêmica clara.',
      'Abstract fiel ao resumo, sem tradução mecânica inadequada.',
      'Limites e tensões do PPR mencionados de forma sintética.',
      'Palavras-chave coerentes com Justiça Restaurativa, responsabilização, reparação, sistema penal e decolonialidade.'
    ],
    prompt: `Módulo 2 — Resumo, Abstract e palavras-chave. Revise o Resumo e o Abstract do documento matriz. O parecer indica que o Abstract contém "comitted", que deve ser corrigido para "committed", e que o Resumo precisa mencionar limites e contradições do programa. Reescreva sem citações, com objetivo, metodologia, corpus/fontes, achados, limites e conclusão. Mantenha fidelidade ao que a dissertação efetivamente contém; quando faltar dado quantitativo ou número de casos, pergunte a Érica antes de afirmar. Entregue versões revisadas em português e inglês, mais justificativa das alterações. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova o resumo, o abstract e as palavras-chave revisadas?'
  },
  {
    id: 3,
    stage: 'revisao',
    title: 'Sumário, numeração e mapa da dissertação',
    shortTitle: 'Sumário',
    color: 'green',
    sourceIds: ['DIS_MATRIZ', 'NBR6027', 'NBR14724', 'PARECER_INTEGRADO'],
    goals: [
      'Corrigir duplicidades e saltos de numeração.',
      'Transformar o sumário em checklist de navegação por páginas.',
      'Garantir que referências, apêndices e anexos estejam tratados como pós-textuais.'
    ],
    requiredChecks: [
      'Segundo 2.9 renumerado, se confirmado no texto.',
      'Duplicação de 2.14 tratada.',
      'REFERÊNCIAS sem numeração de capítulo.',
      'Páginas do sumário conferidas após revisão final.'
    ],
    prompt: `Módulo 3 — Sumário e numeração. Use a NBR 6027:2012 e a NBR 14724:2024. Corrija a sequência do Capítulo 2 indicada no parecer: duplo 2.9, ausência de 2.10 e duplicação de 2.14. Garanta que "REFERÊNCIAS" apareça como elemento pós-textual sem numeração. Entregue: (1) diagnóstico de todos os problemas de hierarquia; (2) sumário corrigido; (3) itens pendentes que dependem da paginação final do .docx. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova a estrutura do sumário e a renumeração proposta?'
  },
  {
    id: 4,
    stage: 'revisao',
    title: 'Introdução e Capítulo 1 — problema, método e crise punitiva',
    shortTitle: 'Intro + Cap. 1',
    color: 'blue',
    sourceIds: ['DIS_MATRIZ', 'NBR10520', 'PARECER_INTEGRADO', 'CNPQ_INTEGRIDADE'],
    goals: [
      'Fortalecer problema, objetivos e justificativa.',
      'Corrigir marcadores abertos e citações órfãs.',
      'Garantir voz metodológica coerente em primeira pessoa quando apropriado.'
    ],
    requiredChecks: [
      'Foucault(XXX) e Mignolo(xxx) corrigidos ou marcados como pendência caso a referência não esteja confirmada.',
      'Trechos "a pesquisadora" convertidos para "eu" quando a voz autoetnográfica exigir.',
      'Nota sobre Direito Achado na Rua avaliada para incorporação no corpo.',
      'Afirmativas institucionais e estatísticas com fonte.'
    ],
    prompt: `Módulo 4 — Introdução e Capítulo 1. Revise problema de pesquisa, objetivo geral, objetivos específicos, justificativa, metodologia inicial e fundamentação sobre sistema penal. Corrija marcadores abertos como Foucault(XXX) e Mignolo(xxx) somente se a referência estiver presente; se não estiver, marque pendência e pergunte. Substitua "a pesquisadora" por "eu" quando o texto assumir pesquisa-ação/autoetnografia. Verifique a necessidade de fontes para ADPF 347, Pena Justa, encarceramento e reincidência. Entregue relatório, reescrita por trechos e dúvidas objetivas. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova a revisão da introdução e do Capítulo 1?'
  },
  {
    id: 5,
    stage: 'revisao',
    title: 'Capítulo 2 — casos, fundamentos e riscos de identificação',
    shortTitle: 'Cap. 2',
    color: 'orange',
    sourceIds: ['DIS_MATRIZ', 'NBR10520', 'PARECER_INTEGRADO', 'CNPQ_INTEGRIDADE'],
    goals: [
      'Revisar os casos narrativos sem vulnerar participantes.',
      'Corrigir Spivak, Elliot/Elioth, Jolo e apud Sinclair.',
      'Qualificar a ponte entre Justiça Restaurativa, decolonialidade e Direitos Humanos.'
    ],
    requiredChecks: [
      'Spivak(xxx) resolvido ou pendente.',
      'Elioth/Elliot padronizado conforme referência confirmada.',
      'Jolo (2013) identificado, corrigido ou removido.',
      'Caso Marta com detalhes geográficos reduzidos se houver risco de identificação.',
      'Citações e referências cruzadas.'
    ],
    prompt: `Módulo 5 — Capítulo 2. Revise os fundamentos da Justiça Restaurativa e as narrativas de Pedro, Rodrigo, Carlos, Marta e Roberto. Prioridade ética: reduzir detalhes identificatórios, especialmente quando houver combinação de cidade pequena, gênero, alfabetização, crime ou vínculo familiar. Corrija Spivak(xxx), padronize Elliot/Elioth, verifique Jolo (2013) e reformate o apud Sinclair(1994 apud ELLIOT, 2018, p.101), se a fonte efetivamente for essa. Entregue: relatório de riscos, reescrita protetiva e pendências para Érica validar. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova a revisão dos casos e a proteção metodológica dos participantes?'
  },
  {
    id: 6,
    stage: 'revisao',
    title: 'Capítulo 3 — PPR, instrumentos, dados e garantias',
    shortTitle: 'Cap. 3 / PPR',
    color: 'green',
    sourceIds: ['DIS_MATRIZ', 'PARECER_INTEGRADO', 'NBR14724', 'NBR10520'],
    goals: [
      'Sistematizar o Programa Plano de Reparação sem transformar prática em propaganda institucional.',
      'Corrigir inconsistências de tabela e anexos.',
      'Acrescentar salvaguardas de Direitos Humanos, voluntariedade e consentimentos inteligíveis.'
    ],
    requiredChecks: [
      '(FONTE) sobre Além das Penas resolvido.',
      '(anexo X) substituído por número real ou por frase sem remissão inexistente.',
      'Tabela de casos-piloto corrigida: 8 vs 15 ou dado validado por Érica.',
      'Grau de eficácia preenchido ou classificado como dado em apuração.',
      'Subitem de garantias de DH proposto após triagem.'
    ],
    prompt: `Módulo 6 — Capítulo 3. Revise a sistematização do PPR, critérios de elegibilidade, triagem, equipe, consentimentos, etapas e casos-piloto. Corrija os marcadores "(FONTE)" e "(anexo X)" apenas se a fonte real estiver disponível; caso contrário, pergunte. Verifique a inconsistência da tabela de casos-piloto: campo com 8 versus observação com 09 homens/06 mulheres. Proponha subitem "3.2.3.1 Critérios de Elegibilidade e Garantias de Direitos Humanos". Entregue diagnóstico, texto reestruturado e perguntas a Érica. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova a sistematização do PPR e os dados corrigidos?'
  },
  {
    id: 7,
    stage: 'documentario',
    title: 'Documentário, transcrição e DSC protetivo',
    shortTitle: 'Documentário + DSC',
    color: 'purple',
    sourceIds: ['DOC_VIDEO', 'PARECER_INTEGRADO', 'NBR6023', 'NBR10520', 'CNPQ_INTEGRIDADE'],
    goals: [
      'Orientar a transcrição de vídeo documental por cenas e timestamps.',
      'Fundir Rodrigo, Marta e Carlos em Discurso do Sujeito Coletivo, sem individualização.',
      'Definir como citar o documentário antes e depois da publicação institucional.'
    ],
    requiredChecks: [
      'Título oficial, duração, URL institucional e data de publicação pendentes até confirmação.',
      'Depoimentos de Rodrigo, Marta e Carlos anonimizados e fundidos em DSC.',
      'Dados identificatórios removidos ou generalizados.',
      'Autorização e termo de uso do documentário confirmados por Érica/NUCJUR.',
      'Citação formal só após URL institucional testada.'
    ],
    prompt: `Módulo 7 — Documentário, transcrição e Discurso do Sujeito Coletivo. O arquivo de vídeo é temporário e será referenciado formalmente apenas quando publicado em canal institucional. Oriente a transcrição por cena/timestamp, registro de contexto, fala, nota analítica e risco de identificação. Fundir os depoimentos de Rodrigo, Marta e Carlos por Análise do Discurso do Sujeito Coletivo: expressões-chave, ideias centrais, ancoragens e discurso-síntese em primeira pessoa plural ou sujeito coletivo, sem dados identificatórios. Não exponha nomes reais, locais, datas específicas, processos, parentescos raros ou combinações que reidentifiquem. Entregue: protocolo de transcrição, matriz DSC, modelo de parágrafo metodológico e modelo de referência audiovisual para quando houver URL. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova o protocolo de transcrição e a estratégia DSC para proteger Rodrigo, Marta e Carlos?'
  },
  {
    id: 8,
    stage: 'revisao',
    title: 'Conclusão — resposta ao problema e agenda futura',
    shortTitle: 'Conclusão',
    color: 'blue',
    sourceIds: ['DIS_MATRIZ', 'PARECER_INTEGRADO', 'CNPQ_INTEGRIDADE'],
    goals: [
      'Responder explicitamente ao problema de pesquisa.',
      'Retomar responsabilização, reparação e vínculos.',
      'Incluir limites, formação continuada e agenda futura.'
    ],
    requiredChecks: [
      'Objetivo geral retomado.',
      'Eixos analíticos conectados aos achados.',
      'Limites e risco de captura punitiva reconhecidos.',
      'Formação continuada incluída como salvaguarda.',
      'Fecho poético sem reduzir rigor acadêmico.'
    ],
    prompt: `Módulo 8 — Conclusão. Reestruture a conclusão com função clara por parágrafo: contexto, objetivo, responsabilização, reparação, vínculos, decolonialidade, limites, formação continuada, agenda futura e fechamento. Não acrescente números se eles não tiverem sido validados por Érica. Garanta que as recomendações derivem da análise e que o texto reconheça tensões institucionais. Entregue conclusão revisada e justificativa. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova a conclusão final?'
  },
  {
    id: 9,
    stage: 'finalizacao',
    title: 'Referências, citações órfãs e teste de links',
    shortTitle: 'Referências + links',
    color: 'orange',
    sourceIds: ['NBR6023', 'NBR10520', 'PARECER_INTEGRADO', 'DOC_VIDEO', 'SIBI_BDTD'],
    goals: [
      'Gerar lista única de referências em conformidade com ABNT NBR 6023:2025.',
      'Cruzar citações e referências.',
      'Testar links e registrar data de acesso.'
    ],
    requiredChecks: [
      'Título "REFERÊNCIAS" sem anotação "(reorganizar)".',
      'Fanon (2008) incluído se citado.',
      'Walsh unificada.',
      'Marshall sem nota editorial indevida.',
      'Documentário só com referência formal quando URL institucional estiver publicada e testada.',
      'Relatório de links exportado.'
    ],
    prompt: `Módulo 9 — Referências, citações e links. Revise a lista de referências segundo NBR 6023:2025 e as citações segundo NBR 10520:2023. Remova "(reorganizar)" do título, inclua Fanon (2008) se citado, unifique Walsh, remova notas editoriais indevidas e resolva citações órfãs. Para links: listar URL, status, data de acesso, tipo de problema e correção. Se o link do documentário ainda não existir, inserir nota metodológica provisória e não referência definitiva. Entregue relatório, lista de referências corrigida e relatório de links. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova as referências e o relatório de links?'
  },
  {
    id: 10,
    stage: 'finalizacao',
    title: 'Figuras, gráficos, declaração de IA e diagramação final',
    shortTitle: 'Figuras + IA',
    color: 'green',
    sourceIds: ['NBR14724', 'SISTEMA_PROMPT', 'REVISOR_SONNET', 'CNPQ_INTEGRIDADE'],
    goals: [
      'Padronizar gráficos com paleta NUCJUR.',
      'Evitar reprodução indevida de tabelas protegidas.',
      'Inserir declaração transparente de uso de IA.',
      'Preparar .docx final com estética fluida e elementos interagentes.'
    ],
    requiredChecks: [
      'Títulos de figuras/tabelas acima e fontes abaixo.',
      'Figura de Zehr transformada em elaboração própria com base no autor, se for o caso.',
      'Paleta NUCJUR aplicada: #1A6DB5, #F07D1A, #3BAA4A e variações.',
      'Declaração de IA validada por Érica.',
      'Projeto editorial alinhado às orientações UFG/BDTD.'
    ],
    prompt: `Módulo 10 — Figuras, gráficos, declaração de IA e diagramação final. Padronize elementos visuais segundo NBR 14724:2024 e paleta NUCJUR. Para tabelas reproduzidas de autores, transformar em "elaboração própria com base em..." quando cabível, sem copiar material protegido. Redigir declaração de uso de IA que explique revisão, estruturação e validação humana por Érica. Unir projeto editorial fluido com exigências acadêmicas: margens, fonte, espaçamento, citações longas, paginação, títulos e pós-textuais. Entregue checklist final, textos de declaração e instruções de exportação. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova figuras, gráficos, declaração de IA e diagramação final?'
  },
  {
    id: 11,
    stage: 'finalizacao',
    title: 'Versão aprovada, Biblioteca Central UFG e BDTD',
    shortTitle: 'UFG / BDTD',
    color: 'purple',
    sourceIds: ['SIBI_BDTD', 'NBR14724', 'NBR6023', 'NBR10520'],
    goals: [
      'Preparar checklist final pós-defesa.',
      'Conferir metadados, ficha catalográfica, autorização/embargo e nada consta.',
      'Separar versão pública, versão com embargo e anexos restritos.'
    ],
    requiredChecks: [
      'Arquivo final sem anexos sensíveis desnecessários.',
      'Metadados preenchidos.',
      'TECA/Autorização conforme instruções do SIBI/UFG.',
      'Declaração de direitos autorais e uso de imagem revisada.',
      'Links institucionais retestados no dia do envio.'
    ],
    prompt: `Módulo 11 — Versão aprovada e envio à UFG/BDTD. Gere checklist pós-defesa baseado nas orientações da Biblioteca Central/SIBI-UFG: versão final, metadados, autorização/TECA, eventual embargo, ficha catalográfica, nada consta e envio à secretaria/biblioteca conforme procedimento vigente. Não afirmar procedimento como definitivo sem testar os links institucionais no dia do depósito. Entregue checklist, riscos e documentos a separar. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova o checklist de depósito e versão pública?'
  },
  {
    id: 12,
    stage: 'periodicos',
    title: 'Ambiente pós-validação — artigos e periódicos',
    shortTitle: 'Periódicos',
    color: 'green',
    sourceIds: ['DIS_MATRIZ', 'CNPQ_INTEGRIDADE', 'SIBI_BDTD'],
    goals: [
      'Converter partes da dissertação em artigos sem salami slicing indevido.',
      'Montar matriz de periódicos e dossiês com links testados e escopo compatível.',
      'Registrar coautoria, autoria, originalidade, preprints e conflitos de interesse.'
    ],
    requiredChecks: [
      'Só iniciar após aprovação final da dissertação ou autorização de Érica/orientação.',
      'Cada artigo com contribuição original clara.',
      'Dossiês e chamadas atualizados por busca web no dia da decisão.',
      'Links, normas aos autores, APC e indexação testados.',
      'Evitar periódicos predatórios e submissão duplicada.'
    ],
    prompt: `Módulo 12 — Ambiente de periódicos. A partir da dissertação validada, proponha artigos autônomos sem fatiamento indevido: (1) PPR como prática restaurativa institucional; (2) metodologia autoetnográfica/pesquisa-ação; (3) justiça restaurativa e decolonialidade; (4) DSC e documentário como fonte protegida. Para cada artigo, indique tese, pergunta, corpus, recorte, possíveis periódicos/dossiês a pesquisar, critérios de escolha e checagem de integridade. Não recomendar chamadas abertas sem busca atual e link testado. Entregue matriz editorial. ${validationLine}`,
    acceptanceQuestion: 'Érica, você aprova a matriz de artigos e critérios para busca de periódicos?'
  }
];

export function getSourcesForModule(module: ReviewModule, sources: ProjectSource[]) {
  return module.sourceIds.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as ProjectSource[];
}
