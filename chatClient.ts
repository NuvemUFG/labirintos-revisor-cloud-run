export const nucjurPalette = [
  { name: 'Azul primário', hex: '#1A6DB5', use: 'Títulos, barras principais, bordas e botões primários' },
  { name: 'Laranja', hex: '#F07D1A', use: 'Alertas positivos, destaques e segunda categoria' },
  { name: 'Verde', hex: '#3BAA4A', use: 'Resultados, aprovação e terceira categoria' },
  { name: 'Azul claro', hex: '#5BA3D9', use: 'Hover, séries adicionais e planos de fundo suaves' },
  { name: 'Laranja claro', hex: '#F5A55A', use: 'Dados secundários e caixas de atenção' },
  { name: 'Verde claro', hex: '#6CC97A', use: 'Confirmações e microinterações' },
  { name: 'Cinza neutro', hex: '#6B7280', use: 'Eixos, legendas, rótulos e metadados' },
  { name: 'Fundo', hex: '#FFFFFF', use: 'Fundo dos gráficos e documentos' }
];

export const masterSystemPrompt = `Você é o Revisor Científico Especializado da dissertação de mestrado "Labirintos de Punição e Rodas de Cura: ecoando vozes silenciadas no Plano de Reparação em Goiás", de Érica Fernanda Teixeira Santos, no PPGIDH/UFG.

Papel: atuar como orientador acadêmico sênior, revisor ABNT, consultor editorial e guardião de integridade científica. Áreas: Justiça Restaurativa, Criminologia Crítica, Direitos Humanos, pesquisa qualitativa, autoetnografia, pesquisa-ação, Análise do Discurso do Sujeito Coletivo, epistemologias decoloniais e metodologia jurídica.

Regra de validação: nunca avance de módulo sem confirmação explícita de Érica. Ao terminar uma revisão, pergunte: "Érica, você aprova esta revisão? Deseja ajustar algo antes de prosseguirmos?".

Regra anti-alucinação: só afirme algo sobre a dissertação quando houver trecho, página, fonte ou confirmação de Érica. Quando houver ambiguidade, pergunte antes de concluir.

Regra de proteção: dados pessoais, dados processuais, detalhes raros de caso, nomes reais, documentos, cidades pequenas, datas específicas e vínculos familiares devem ser removidos ou generalizados, salvo autorização explícita e justificativa metodológica.

Regra de IA: a IA nunca é autora. Toda sugestão deve ser validada por Érica, com responsabilidade final humana. Declarações de uso de IA devem ser transparentes, proporcionais e compatíveis com integridade científica.

Regra de saída: cada módulo deve entregar relatório de alterações, texto revisado pronto para colar, dúvidas objetivas e pergunta de validação.`;

export const dscProtocol = `PROTOCOLO DSC — Documentário NUCJUR/TJGO
1. Transcrever por cenas: timestamp inicial/final, contexto visual, fala, emoção observável sem diagnóstico, observação ética e risco de identificação.
2. Não usar nomes reais; Rodrigo, Marta e Carlos podem ser pseudônimos operacionais apenas na planilha interna.
3. Extrair expressões-chave de cada depoimento sem copiar detalhes que reidentifiquem.
4. Agrupar ideias centrais: responsabilização, dor, reparação, vínculo, reconhecimento, mudança, medo, instituição, comunidade.
5. Identificar ancoragens discursivas: justiça como escuta, justiça como reparação, crítica ao punitivismo, dignidade, reconstrução.
6. Redigir Discurso do Sujeito Coletivo em primeira pessoa do plural ou sujeito coletivo, sem elementos individualizantes.
7. Inserir nota metodológica: o DSC protege participantes e evita exposição de narrativas sensíveis, preservando conteúdo socialmente relevante.
8. Submeter o DSC à validação de Érica antes de integrar à dissertação.`;

export const aiDeclarationTemplate = `Declaração de uso de inteligência artificial generativa

Durante a etapa de revisão e organização editorial desta dissertação, foram utilizadas ferramentas de inteligência artificial generativa como apoio à revisão gramatical, à identificação de inconsistências formais, à organização de checklists normativos e à sugestão de reestruturação textual. As ferramentas não produziram dados empíricos, não substituíram a análise da pesquisadora e não foram utilizadas como fonte autônoma de informação científica. Todas as sugestões foram criticamente avaliadas, revisadas e validadas pela autora, que assume integral responsabilidade pela autoria, pela originalidade, pela precisão das informações, pela proteção dos participantes e pela conformidade ética e normativa do trabalho.`;

export const documentaryReferenceTemplate = `TRIBUNAL DE JUSTIÇA DO ESTADO DE GOIÁS. [Título oficial do documentário]. Produção: Núcleo de Justiça Restaurativa do TJGO. Goiânia: TJGO, [ano]. 1 vídeo ([duração]), son., color. Disponível em: [URL institucional]. Acesso em: [dia mês ano].`;

export const ufGFinalChecklist = [
  'Confirmar versão final após defesa e após ajustes exigidos pela banca.',
  'Conferir ficha catalográfica, quando aplicável, segundo procedimento vigente do SIBI/UFG.',
  'Preencher formulário de metadados e conferir título, autora, orientador, programa, resumo, palavras-chave e área.',
  'Gerar ou conferir TECA/Termo de Ciência e Autorização conforme procedimento vigente.',
  'Definir publicação aberta, embargo ou não autorização pública, quando houver dados sensíveis, direitos de imagem ou restrições institucionais.',
  'Enviar dissertação e formulário de metadados pelo canal institucional indicado pela Biblioteca Central/SIBI-UFG e pela secretaria do programa.',
  'Testar links do documentário, BDTD, DOI/URLs de referências e anexos digitais na semana do depósito.',
  'Manter versão interna restrita com documentos sensíveis separada da versão pública.'
];
