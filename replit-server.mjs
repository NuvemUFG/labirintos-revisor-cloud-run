import { useEffect, useMemo, useRef, useState } from 'react';
import { reviewModules, getSourcesForModule, type ReviewModule } from './data/modules';
import { academicConferenceSafeFields, projectSources, type ProjectSource } from './data/sources';
import { aiDeclarationTemplate, documentaryReferenceTemplate, dscProtocol, masterSystemPrompt, nucjurPalette, ufGFinalChecklist } from './data/promptCore';
import { agentSpecs, agentWorkflows, buildAgenticUserPrompt, getWorkflow } from './data/agents';
import { runAgenticWorkflow, type AgenticResponse } from './services/agentClient';
import { checkUrl, extractUrls, linkResultsToCsv, type LinkCheckResult } from './utils/links';
import { anonymizeDraft, scanSensitiveText } from './utils/privacy';
import { downloadTextFile, nowStamp, toMarkdownTable } from './utils/exporters';
import { sendChat, type ChatMessage } from './services/chatClient';

type Tab = 'chat' | 'fontes' | 'trecho' | 'documentario' | 'agentes' | 'links' | 'ufg' | 'periodicos' | 'exportar' | 'config';

type CustomSource = ProjectSource & { preview?: string };

type ReviewState = {
  completedModules: number[];
  notesByModule: Record<number, string>;
  selectedSourceIds: string[];
  customSources: CustomSource[];
  currentExcerpt: string;
  dsc: {
    rodrigo: string;
    marta: string;
    carlos: string;
    collective: string;
    videoTitle: string;
    videoUrl: string;
    videoDuration: string;
  };
};

const storageKey = 'labirintos.revisor.state.v1';
const messageStorageKey = 'labirintos.revisor.messages.v1';

const initialState: ReviewState = {
  completedModules: [],
  notesByModule: {},
  selectedSourceIds: [],
  customSources: [],
  currentExcerpt: '',
  dsc: {
    rodrigo: '',
    marta: '',
    carlos: '',
    collective: '',
    videoTitle: '',
    videoUrl: '',
    videoDuration: ''
  }
};

function loadState(): ReviewState {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

function newMessage(role: ChatMessage['role'], text: string, moduleId?: number): ChatMessage {
  return { id: crypto.randomUUID(), role, text, moduleId, createdAt: new Date().toISOString() };
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(messageStorageKey);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    newMessage(
      'assistant',
      'Olá, Érica. Este ambiente está configurado para revisar a dissertação em módulos com validação obrigatória. Escolha o Módulo 1 para começar ou cole um trecho na aba “Trecho em revisão”.'
    )
  ];
}

function classByColor(color: ReviewModule['color']) {
  return `tone-${color}`;
}

function canStartModule(module: ReviewModule, completed: number[]) {
  if (module.id === 1) return true;
  return completed.includes(module.id - 1) || completed.includes(module.id);
}

export default function App() {
  const [state, setState] = useState<ReviewState>(() => loadState());
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [tab, setTab] = useState<Tab>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [linkResults, setLinkResults] = useState<LinkCheckResult[]>([]);
  const [proxyUrl, setProxyUrl] = useState(() => localStorage.getItem('labirintos.proxyUrl') ?? '/chat');
  const [copyNotice, setCopyNotice] = useState('');
  const [agentWorkflowId, setAgentWorkflowId] = useState(agentWorkflows[0].id);
  const [agentTask, setAgentTask] = useState('');
  const [agentRun, setAgentRun] = useState<AgenticResponse | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const allSources = useMemo(() => [...projectSources, ...state.customSources], [state.customSources]);
  const activeModule = reviewModules.find((m) => m.id === activeModuleId) ?? reviewModules[0];
  const activeSources = getSourcesForModule(activeModule, allSources);
  const privacyFindings = scanSensitiveText(state.currentExcerpt);
  const completedCount = state.completedModules.length;
  const progress = Math.round((completedCount / reviewModules.length) * 100);
  const selectedAgentWorkflow = getWorkflow(agentWorkflowId);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(messageStorageKey, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function updateState(patch: Partial<ReviewState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function chooseModule(module: ReviewModule) {
    setActiveModuleId(module.id);
    setTab('chat');
    if (!canStartModule(module, state.completedModules)) {
      setMessages((prev) => [
        ...prev,
        newMessage('assistant', `Para preservar o fluxo de validação, conclua primeiro o Módulo ${module.id - 1}. Você pode consultar este módulo, mas a revisão formal só deve começar após a validação anterior.`, module.id)
      ]);
      return;
    }
    const moduleSources = getSourcesForModule(module, allSources);
    setMessages((prev) => [
      ...prev,
      newMessage('assistant', `Módulo ${module.id} selecionado: ${module.title}. Fontes ativas: ${moduleSources.map((s) => s.title).join('; ')}.`, module.id),
      newMessage('system', module.prompt, module.id)
    ]);
  }

  function approveActiveModule() {
    setState((prev) => ({
      ...prev,
      completedModules: Array.from(new Set([...prev.completedModules, activeModule.id])).sort((a, b) => a - b)
    }));
    const next = reviewModules.find((m) => m.id === activeModule.id + 1);
    setMessages((prev) => [
      ...prev,
      newMessage('assistant', next ? `Módulo ${activeModule.id} aprovado. O próximo passo é o Módulo ${next.id}: ${next.title}.` : 'Todos os módulos foram aprovados. Agora use Exportar para salvar o estado, os prompts e o relatório final.', activeModule.id)
    ]);
  }

  async function handleChatSend(text = chatInput) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg = newMessage('user', trimmed, activeModule.id);
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setChatInput('');
    setIsSending(true);
    try {
      const response = await sendChat({
        messages: nextMessages,
        activeModule,
        sources: activeSources,
        selectedText: state.currentExcerpt
      });
      setMessages((prev) => [...prev, newMessage('assistant', response.text, activeModule.id)]);
    } catch (error) {
      setMessages((prev) => [...prev, newMessage('assistant', `Não consegui consultar o proxy configurado. Detalhe: ${error instanceof Error ? error.message : String(error)}. O modo local continua disponível.`, activeModule.id)]);
    } finally {
      setIsSending(false);
    }
  }

  async function copy(text: string, label = 'Copiado') {
    await navigator.clipboard.writeText(text);
    setCopyNotice(label);
    window.setTimeout(() => setCopyNotice(''), 1600);
  }

  function exportPromptPack() {
    const sourceRows = allSources.map((s) => ({
      ID: s.id,
      Fonte: s.title,
      Arquivo: s.fileName ?? s.link ?? '',
      Uso: s.useIn.join('; '),
      Confidencialidade: s.confidentiality
    }));
    const moduleBlocks = reviewModules.map((m) => `## Módulo ${m.id} — ${m.title}\n\nFontes: ${m.sourceIds.join(', ')}\n\n${m.prompt}`).join('\n\n---\n\n');
    const agentRows = agentSpecs.map((agent) => ({ Agente: agent.name, Papel: agent.role, Entrega: agent.output }));
    const workflowRows = agentWorkflows.map((workflow) => ({ Workflow: workflow.title, Agentes: workflow.agentIds.join(' → '), Uso: workflow.recommendedFor }));
    const md = `# Pacote de Prompts — Labirintos de Punição e Rodas de Cura\n\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\n## System Prompt\n\n${masterSystemPrompt}\n\n## Fontes\n\n${toMarkdownTable(sourceRows)}\n\n## Workflows agênticos\n\n${toMarkdownTable(workflowRows)}\n\n## Agentes\n\n${toMarkdownTable(agentRows)}\n\n${moduleBlocks}\n\n## Protocolo DSC\n\n${dscProtocol}\n\n## Declaração de IA\n\n${aiDeclarationTemplate}\n`;
    downloadTextFile(`labirintos-prompt-pack-${nowStamp()}.md`, md, 'text/markdown;charset=utf-8');
  }

  function exportState() {
    downloadTextFile(`labirintos-estado-${nowStamp()}.json`, JSON.stringify({ state, messages, allSources }, null, 2), 'application/json;charset=utf-8');
  }

  function exportLinkReport() {
    downloadTextFile(`labirintos-link-check-${nowStamp()}.csv`, linkResultsToCsv(linkResults), 'text/csv;charset=utf-8');
  }

  async function addCustomFiles(files: FileList | null) {
    if (!files?.length) return;
    const additions: CustomSource[] = [];
    for (const file of Array.from(files)) {
      let preview = '';
      if (/text|json|csv|markdown|xml|html/.test(file.type) || /\.(txt|md|csv|json|xml|html)$/i.test(file.name)) {
        preview = await file.text();
        preview = preview.slice(0, 15000);
      }
      additions.push({
        id: `USER_${Date.now()}_${Math.round(Math.random() * 100000)}`,
        title: file.name,
        fileName: file.name,
        kind: 'usuario',
        status: 'usuario',
        confidentiality: 'restrita',
        useIn: ['fonte adicional indicada por Érica'],
        citationHint: 'Fonte adicionada pela autora; conferir autoria, data, URL e autorização antes de usar.',
        notes: preview ? ['Prévia textual carregada localmente no navegador.'] : ['Arquivo binário registrado por metadados; extração textual deve ser feita fora do navegador.'],
        preview
      });
    }
    setState((prev) => ({ ...prev, customSources: [...prev.customSources, ...additions] }));
  }

  function buildExcerptPrompt() {
    const safeText = anonymizeDraft(state.currentExcerpt);
    return `Analise o trecho abaixo da dissertação matriz, usando o Módulo ${activeModule.id} — ${activeModule.title}.\n\nRegras: conferir com as fontes anexadas; não inventar dados; apontar dúvidas; preservar voz autoral; sugerir reescrita ABNT e metodologicamente consistente; destacar riscos éticos e de identificação.\n\nTrecho anonimizado/preparado:\n\n${safeText}\n\nEntregue: 1) diagnóstico; 2) reescrita sugerida; 3) fontes necessárias; 4) perguntas para Érica; 5) pergunta de validação.`;
  }

  function buildDscPrompt() {
    return `${dscProtocol}\n\nTítulo provisório do vídeo: ${state.dsc.videoTitle || '[confirmar]'}\nURL institucional: ${state.dsc.videoUrl || '[pendente]'}\nDuração: ${state.dsc.videoDuration || '[confirmar]'}\n\nDepoimento A/Rodrigo — uso interno, anonimizar:\n${state.dsc.rodrigo || '[colar transcrição]'}\n\nDepoimento B/Marta — uso interno, anonimizar:\n${state.dsc.marta || '[colar transcrição]'}\n\nDepoimento C/Carlos — uso interno, anonimizar:\n${state.dsc.carlos || '[colar transcrição]'}\n\nProduza matriz DSC com expressões-chave, ideias centrais, ancoragens, riscos de identificação e discurso coletivo final. Pergunte a Érica antes de integrar à dissertação.`;
  }

  async function runBrowserLinkCheck() {
    const urls = extractUrls(linkInput);
    setLinkResults([]);
    for (const url of urls) {
      const result = await checkUrl(url);
      setLinkResults((prev) => [...prev, result]);
    }
  }

  async function runAgenticAnalysis() {
    const task = agentTask.trim() || `Executar ${selectedAgentWorkflow.title} no Módulo ${activeModule.id}: ${activeModule.title}.`;
    setIsAgentRunning(true);
    setAgentRun(null);
    try {
      const response = await runAgenticWorkflow({
        workflowId: selectedAgentWorkflow.id,
        task,
        activeModule,
        sources: activeSources,
        selectedText: state.currentExcerpt,
        dsc: state.dsc
      });
      setAgentRun(response);
      setMessages((prev) => [
        ...prev,
        newMessage('assistant', `Modo agêntico concluído: ${response.workflowTitle}. Revise a síntese na aba “Modo agêntico” e valide antes de aplicar alterações.`, activeModule.id)
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setAgentRun({
        ok: false,
        workflowId: selectedAgentWorkflow.id,
        workflowTitle: selectedAgentWorkflow.title,
        mode: 'local',
        steps: [],
        warnings: [detail],
        final: `Não consegui executar o endpoint agêntico. Detalhe: ${detail}`
      });
    } finally {
      setIsAgentRunning(false);
    }
  }

  function saveProxy() {
    if (proxyUrl.trim()) localStorage.setItem('labirintos.proxyUrl', proxyUrl.trim());
    else localStorage.removeItem('labirintos.proxyUrl');
    setCopyNotice('Configuração salva');
    window.setTimeout(() => setCopyNotice(''), 1600);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-mark" aria-hidden="true">
          <span className="ring ring-a" />
          <span className="ring ring-b" />
          <span className="ring ring-c" />
        </div>
        <div>
          <p className="eyebrow">NUCJUR/TJGO · PPGIDH/UFG</p>
          <h1>Labirintos — Revisor Interativo</h1>
          <p className="hero-subtitle">Chat, fontes, validação por Érica, DSC do documentário, teste de links, entrega UFG/BDTD e ambiente de artigos.</p>
        </div>
        <div className="progress-card">
          <strong>{completedCount}/{reviewModules.length}</strong>
          <span>módulos validados</span>
          <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-section-title">Fluxo de revisão</div>
          <div className="module-list">
            {reviewModules.map((module) => {
              const active = module.id === activeModule.id;
              const done = state.completedModules.includes(module.id);
              const locked = !canStartModule(module, state.completedModules);
              return (
                <button key={module.id} className={`module-button ${active ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''} ${classByColor(module.color)}`} onClick={() => chooseModule(module)}>
                  <span className="module-index">{done ? '✓' : module.id}</span>
                  <span>
                    <strong>{module.shortTitle}</strong>
                    <small>{module.stage}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sidebar-section-title">Área de trabalho</div>
          <nav className="nav-list">
            {([
              ['chat', 'Chat'],
              ['fontes', 'Fontes'],
              ['trecho', 'Trecho em revisão'],
              ['documentario', 'Documentário + DSC'],
              ['agentes', 'Modo agêntico'],
              ['links', 'Teste de links'],
              ['ufg', 'UFG/BDTD'],
              ['periodicos', 'Periódicos'],
              ['exportar', 'Exportar'],
              ['config', 'Configurações']
            ] as Array<[Tab, string]>).map(([id, label]) => (
              <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{label}</button>
            ))}
          </nav>
        </aside>

        <main className="panel">
          {copyNotice && <div className="copy-toast">{copyNotice}</div>}
          <section className="module-summary">
            <div>
              <p className="eyebrow">Módulo ativo</p>
              <h2>{activeModule.id}. {activeModule.title}</h2>
              <p>{activeModule.goals.join(' ')}</p>
            </div>
            <button className="primary" onClick={approveActiveModule}>Aprovar módulo</button>
          </section>

          {tab === 'chat' && (
            <section className="tab-grid chat-grid">
              <div className="card chat-card">
                <div className="messages">
                  {messages.map((message) => (
                    <article key={message.id} className={`message ${message.role}`}>
                      <div className="message-meta">{message.role === 'user' ? 'Érica' : message.role === 'system' ? 'Prompt do módulo' : 'Revisor'} · {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                      <p>{message.text}</p>
                      {message.role === 'system' && <button className="text-button" onClick={() => copy(message.text, 'Prompt copiado')}>Copiar prompt</button>}
                    </article>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-row">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} placeholder="Escreva a validação, dúvida ou comando..." />
                  <button className="primary" onClick={() => handleChatSend()} disabled={isSending}>{isSending ? 'Enviando...' : 'Enviar'}</button>
                </div>
                <div className="quick-actions">
                  {['Aprovo este módulo', 'Quero ajustar algo', 'Como citar o documentário?', 'Gerar checklist de fontes', 'Preparar artigo'].map((text) => (
                    <button key={text} onClick={() => handleChatSend(text)}>{text}</button>
                  ))}
                </div>
              </div>

              <div className="card module-card">
                <h3>Checklist obrigatório</h3>
                <ul className="check-list">
                  {activeModule.requiredChecks.map((check) => <li key={check}>{check}</li>)}
                </ul>
                <h3>Fontes ativas</h3>
                <div className="source-chip-list">
                  {activeSources.map((source) => <span key={source.id} className={`source-chip ${source.confidentiality}`}>{source.title}</span>)}
                </div>
                <button className="secondary" onClick={() => copy(activeModule.prompt, 'Prompt do módulo copiado')}>Copiar prompt do módulo</button>
              </div>
            </section>
          )}

          {tab === 'fontes' && (
            <section className="tab-grid sources-grid">
              <div className="card wide">
                <div className="card-header">
                  <div>
                    <h3>Fontes anexadas e referências operacionais</h3>
                    <p>O manifesto evita redistribuir PDFs protegidos e marca confidencialidade, uso e pendências de validação.</p>
                  </div>
                  <label className="file-button">
                    Adicionar documento
                    <input type="file" multiple onChange={(e) => addCustomFiles(e.target.files)} />
                  </label>
                </div>
                <div className="source-table">
                  {allSources.map((source) => (
                    <article key={source.id} className="source-row">
                      <div>
                        <strong>{source.title}</strong>
                        <small>{source.fileName ?? source.link ?? source.kind}</small>
                      </div>
                      <span className={`badge ${source.confidentiality}`}>{source.confidentiality}</span>
                      <p>{source.citationHint}</p>
                      <button className="text-button" onClick={() => copy(`${source.title}\n${source.fileName ?? source.link ?? ''}\nUso: ${source.useIn.join('; ')}\nNota: ${source.citationHint}`, 'Fonte copiada')}>Copiar ficha</button>
                    </article>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>Conferência acadêmica segura</h3>
                <p>Campos extraídos para conferência sem expor CPF, RG, nascimento ou dados pessoais.</p>
                <ul className="fact-list">
                  {academicConferenceSafeFields.map((field) => <li key={field.label}><strong>{field.label}:</strong> {field.value}</li>)}
                </ul>
                <p className="warning">O histórico contém dados pessoais. Eles não devem ser enviados ao chat nem aparecer na versão pública.</p>
              </div>
            </section>
          )}

          {tab === 'trecho' && (
            <section className="tab-grid excerpt-grid">
              <div className="card wide">
                <h3>Trecho em revisão</h3>
                <p>Cole aqui cada trecho da dissertação matriz. O scanner aponta riscos e gera um prompt rastreável por módulo.</p>
                <textarea className="large-textarea" value={state.currentExcerpt} onChange={(e) => updateState({ currentExcerpt: e.target.value })} placeholder="Cole o trecho, indicando capítulo, página e seção..." />
                <div className="button-row">
                  <button className="secondary" onClick={() => updateState({ currentExcerpt: anonymizeDraft(state.currentExcerpt) })}>Anonimizar rascunho</button>
                  <button className="primary" onClick={() => copy(buildExcerptPrompt(), 'Prompt do trecho copiado')}>Copiar prompt do trecho</button>
                  <button className="secondary" onClick={() => setChatInput(buildExcerptPrompt())}>Enviar ao chat</button>
                </div>
              </div>
              <div className="card">
                <h3>Riscos detectados</h3>
                {privacyFindings.length ? (
                  <ul className="finding-list">
                    {privacyFindings.map((finding, index) => <li key={`${finding.label}-${index}`} className={finding.severity}><strong>{finding.label}</strong>{finding.match ? `: ${finding.match}` : ''}<span>{finding.suggestion}</span></li>)}
                  </ul>
                ) : <p>Nenhum risco automático detectado. Ainda assim, Érica deve validar casos e fontes.</p>}
                <h3>Notas do módulo</h3>
                <textarea value={state.notesByModule[activeModule.id] ?? ''} onChange={(e) => setState((prev) => ({ ...prev, notesByModule: { ...prev.notesByModule, [activeModule.id]: e.target.value } }))} placeholder="Notas, dúvidas e decisões validadas por Érica..." />
              </div>
            </section>
          )}

          {tab === 'documentario' && (
            <section className="tab-grid documentary-grid">
              <div className="card wide">
                <h3>Documentário e DSC protetivo</h3>
                <p>Use esta área para preparar a transcrição temporária, o protocolo de citação e a fusão de depoimentos em Discurso do Sujeito Coletivo.</p>
                <div className="form-grid">
                  <label>Título oficial ou provisório<input value={state.dsc.videoTitle} onChange={(e) => setState((prev) => ({ ...prev, dsc: { ...prev.dsc, videoTitle: e.target.value } }))} /></label>
                  <label>URL institucional/YouTube TJGO<input value={state.dsc.videoUrl} onChange={(e) => setState((prev) => ({ ...prev, dsc: { ...prev.dsc, videoUrl: e.target.value } }))} /></label>
                  <label>Duração<input value={state.dsc.videoDuration} onChange={(e) => setState((prev) => ({ ...prev, dsc: { ...prev.dsc, videoDuration: e.target.value } }))} /></label>
                </div>
                <div className="three-columns">
                  <label>Depoimento Rodrigo<textarea value={state.dsc.rodrigo} onChange={(e) => setState((prev) => ({ ...prev, dsc: { ...prev.dsc, rodrigo: e.target.value } }))} placeholder="Transcrição com timestamps, sem dados reais..." /></label>
                  <label>Depoimento Marta<textarea value={state.dsc.marta} onChange={(e) => setState((prev) => ({ ...prev, dsc: { ...prev.dsc, marta: e.target.value } }))} placeholder="Transcrição com timestamps, sem dados reais..." /></label>
                  <label>Depoimento Carlos<textarea value={state.dsc.carlos} onChange={(e) => setState((prev) => ({ ...prev, dsc: { ...prev.dsc, carlos: e.target.value } }))} placeholder="Transcrição com timestamps, sem dados reais..." /></label>
                </div>
                <div className="button-row">
                  <button className="primary" onClick={() => copy(buildDscPrompt(), 'Prompt DSC copiado')}>Copiar prompt DSC</button>
                  <button className="secondary" onClick={() => copy(documentaryReferenceTemplate, 'Modelo de referência copiado')}>Copiar referência audiovisual</button>
                </div>
              </div>
              <div className="card">
                <h3>Protocolo metodológico</h3>
                <pre className="small-pre">{dscProtocol}</pre>
                <h3>Modelo de referência</h3>
                <p className="mono">{documentaryReferenceTemplate}</p>
                <p className="warning">Só use referência definitiva após publicação institucional, teste de link e validação de Érica.</p>
              </div>
            </section>
          )}


          {tab === 'agentes' && (
            <section className="tab-grid agent-grid">
              <div className="card wide">
                <div className="card-header">
                  <div>
                    <h3>Modo agêntico institucional</h3>
                    <p>Orquestra agentes especializados para revisar trechos, documentário, referências, versão final e artigos. O resultado continua dependente de validação explícita de Érica.</p>
                  </div>
                  <span className="badge restrita">human-in-the-loop</span>
                </div>

                <div className="workflow-grid">
                  {agentWorkflows.map((workflow) => (
                    <button key={workflow.id} className={workflow.id === agentWorkflowId ? 'workflow-card selected' : 'workflow-card'} onClick={() => setAgentWorkflowId(workflow.id)}>
                      <strong>{workflow.title}</strong>
                      <span>{workflow.description}</span>
                      <small>{workflow.recommendedFor}</small>
                    </button>
                  ))}
                </div>

                <h3>Tarefa para os agentes</h3>
                <textarea className="large-textarea agent-textarea" value={agentTask} onChange={(e) => setAgentTask(e.target.value)} placeholder="Ex.: Analise este trecho do Capítulo 2, proteja dados de Marta, corrija citações e proponha reescrita metodologicamente segura..." />
                <div className="button-row">
                  <button className="primary" onClick={runAgenticAnalysis} disabled={isAgentRunning}>{isAgentRunning ? 'Agentes em execução...' : 'Executar agentes'}</button>
                  <button className="secondary" onClick={() => copy(buildAgenticUserPrompt({ workflow: selectedAgentWorkflow, module: activeModule, sources: activeSources, task: agentTask, excerpt: state.currentExcerpt }), 'Prompt agêntico copiado')}>Copiar prompt agêntico</button>
                  {agentRun && <button className="secondary" onClick={() => copy(agentRun.final, 'Síntese copiada')}>Copiar síntese</button>}
                </div>

                {agentRun && (
                  <div className="agent-output">
                    <div className="agent-run-header">
                      <div>
                        <h3>Resultado: {agentRun.workflowTitle}</h3>
                        <p>Modo: {agentRun.mode} {agentRun.provider ? `· provedor: ${agentRun.provider}` : ''}</p>
                      </div>
                      <span className={agentRun.ok ? 'status-ok' : 'status-warn'}>{agentRun.ok ? 'concluído' : 'revisar'}</span>
                    </div>
                    {agentRun.warnings.length > 0 && (
                      <div className="warning">
                        {agentRun.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                      </div>
                    )}
                    <pre className="agent-final">{agentRun.final}</pre>
                    <h3>Trilha de agentes</h3>
                    <div className="agent-timeline">
                      {agentRun.steps.map((step, index) => (
                        <article key={`${step.agentId}-${index}`} className={`agent-step ${step.status}`}>
                          <strong>{step.agentName}</strong>
                          <small>{step.status}{step.provider ? ` · ${step.provider}` : ''}</small>
                          <p>{step.summary}</p>
                          <details>
                            <summary>Ver saída</summary>
                            <pre>{step.output}</pre>
                          </details>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="card">
                <h3>Agentes disponíveis</h3>
                <div className="agent-list">
                  {agentSpecs.map((agent) => (
                    <article key={agent.id} className={`mini-agent tone-${agent.color}`}>
                      <strong>{agent.shortName}</strong>
                      <p>{agent.role}</p>
                      <small>Entrega: {agent.output}</small>
                    </article>
                  ))}
                </div>
                <h3>Contexto enviado</h3>
                <ul className="check-list">
                  <li>Módulo ativo e fontes do manifesto.</li>
                  <li>Trecho colado na aba “Trecho em revisão”.</li>
                  <li>Campos do documentário/DSC, quando aplicável.</li>
                  <li>System prompt anti-alucinação e validação por Érica.</li>
                </ul>
                <p className="warning">Não envie ao modo agêntico documentos brutos com CPF, RG, processo, telefone, endereço ou transcrições não anonimizadas.</p>
              </div>
            </section>
          )}

          {tab === 'links' && (
            <section className="tab-grid links-grid">
              <div className="card wide">
                <h3>Teste de links</h3>
                <p>Cole referências ou URLs. O navegador testa quando possível; o relatório formal deve ser feito com o script Node para evitar bloqueios CORS.</p>
                <textarea className="large-textarea" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="Cole aqui referências, links do TJGO, YouTube, DOI, BDTD, Scielo..." />
                <div className="button-row">
                  <button className="primary" onClick={runBrowserLinkCheck}>Testar no navegador</button>
                  <button className="secondary" onClick={() => copy(extractUrls(linkInput).join('\n'), 'URLs copiadas')}>Extrair URLs</button>
                  <button className="secondary" onClick={exportLinkReport} disabled={!linkResults.length}>Exportar CSV</button>
                </div>
              </div>
              <div className="card">
                <h3>Resultados</h3>
                <div className="link-results">
                  {linkResults.map((result) => <article key={`${result.url}-${result.checkedAt}`} className={result.ok ? 'ok' : 'fail'}><strong>{result.ok ? 'OK' : 'Revisar'}</strong><span>{result.status ?? result.method}</span><p>{result.url}</p><small>{result.error ?? result.statusText}</small></article>)}
                </div>
                <p className="mono">Terminal: npm run linkcheck</p>
              </div>
            </section>
          )}

          {tab === 'ufg' && (
            <section className="tab-grid ufg-grid">
              <div className="card wide">
                <h3>Checklist final UFG/BDTD</h3>
                <p>Usar após a banca e antes do envio à Biblioteca Central/SIBI-UFG. Retestar procedimentos institucionais antes do depósito.</p>
                <ul className="check-list big">
                  {ufGFinalChecklist.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="card">
                <h3>Versões recomendadas</h3>
                <ol className="ordered-list">
                  <li><strong>Versão de trabalho:</strong> com comentários e controle de alterações.</li>
                  <li><strong>Versão final banca:</strong> sem comentários, com ajustes aprovados.</li>
                  <li><strong>Versão pública BDTD:</strong> sem anexos sensíveis e com autorizações.</li>
                  <li><strong>Arquivo restrito:</strong> documentos institucionais, termos e transcrições brutas.</li>
                </ol>
                <button className="secondary" onClick={() => copy(ufGFinalChecklist.map((i) => `- [ ] ${i}`).join('\n'), 'Checklist UFG copiado')}>Copiar checklist</button>
              </div>
            </section>
          )}

          {tab === 'periodicos' && (
            <section className="tab-grid periodicals-grid">
              <div className="card wide">
                <h3>Ambiente para adaptação em artigos</h3>
                <p>Este módulo não recomenda dossiês atuais sem busca web; ele estrutura recortes, critérios e ficha de avaliação para periódicos de alto impacto ou afinidade.</p>
                <div className="article-cards">
                  {[
                    ['PPR como prática restaurativa institucional', 'Sistematização do programa, limites, responsabilização ativa e reparação.'],
                    ['Autoetnografia, pesquisa-ação e justiça restaurativa', 'Lugar de fala, implicação, ética e documentação institucional.'],
                    ['Justiça restaurativa, colonialidade e Direitos Humanos', 'Fanon, Mignolo, Walsh, Spivak e crítica ao sistema penal.'],
                    ['Documentário e DSC como proteção de participantes', 'Metodologia audiovisual, DSC e dissolução de identificadores.']
                  ].map(([title, desc]) => <article key={title}><h4>{title}</h4><p>{desc}</p><button className="text-button" onClick={() => copy(`Artigo: ${title}\nRecorte: ${desc}\nCritérios para periódicos: escopo, indexação, chamada aberta, política de ética, APC, licença, prazo, link testado, aderência a Direitos Humanos/Justiça Restaurativa.`, 'Ficha de artigo copiada')}>Copiar ficha</button></article>)}
                </div>
              </div>
              <div className="card">
                <h3>Critérios de triagem</h3>
                <ul className="check-list">
                  <li>Escopo compatível com Direitos Humanos, justiça, criminologia, metodologias qualitativas ou decolonialidade.</li>
                  <li>Indexação e reputação conferidas no site oficial.</li>
                  <li>Chamada/dossiê atual com prazo vigente e link testado.</li>
                  <li>Política de ética, consentimento, imagem e dados sensíveis compatível com o estudo.</li>
                  <li>Sem submissão duplicada e sem fatiamento artificial.</li>
                </ul>
              </div>
            </section>
          )}

          {tab === 'exportar' && (
            <section className="tab-grid export-grid">
              <div className="card wide">
                <h3>Exportar artefatos do projeto</h3>
                <p>Salve estado, prompts, fontes, protocolo DSC e relatório para continuidade em outro ambiente.</p>
                <div className="export-buttons">
                  <button className="primary" onClick={exportPromptPack}>Baixar pacote de prompts (.md)</button>
                  <button className="secondary" onClick={exportState}>Baixar estado do app (.json)</button>
                  <button className="secondary" onClick={() => copy(masterSystemPrompt, 'System prompt copiado')}>Copiar system prompt</button>
                  <button className="secondary" onClick={() => copy(aiDeclarationTemplate, 'Declaração de IA copiada')}>Copiar declaração de IA</button>
                </div>
              </div>
              <div className="card">
                <h3>Resumo do progresso</h3>
                <p>{progress}% do fluxo validado.</p>
                <ul className="fact-list">
                  {reviewModules.map((m) => <li key={m.id}><strong>{m.id}. {m.shortTitle}:</strong> {state.completedModules.includes(m.id) ? 'validado' : 'pendente'}</li>)}
                </ul>
              </div>
            </section>
          )}

          {tab === 'config' && (
            <section className="tab-grid config-grid">
              <div className="card wide">
                <h3>Configuração do chat</h3>
                <p>Sem proxy, o chat funciona como guia local e gerador de prompts. Com proxy, envia contexto e recebe resposta de modelo em servidor próprio. Não coloque chaves de API no React.</p>
                <label>URL do proxy LLM<input value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)} placeholder="http://localhost:8787/chat" /></label>
                <div className="button-row"><button className="primary" onClick={saveProxy}>Salvar configuração</button><button className="secondary" onClick={() => { setProxyUrl(''); localStorage.removeItem('labirintos.proxyUrl'); }}>Desativar proxy</button></div>
                <h3>System prompt ativo</h3>
                <pre className="small-pre">{masterSystemPrompt}</pre>
              </div>
              <div className="card">
                <h3>Paleta NUCJUR</h3>
                <div className="palette-grid">
                  {nucjurPalette.map((color) => <button key={color.hex} onClick={() => copy(color.hex, `${color.hex} copiado`)}><span style={{ background: color.hex }} /><strong>{color.name}</strong><small>{color.hex}</small></button>)}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
