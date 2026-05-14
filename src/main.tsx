import React, { useState } from 'react';
import './App.css';

export function App() {
    const [workflowId, setWorkflowId] = useState('trecho-completo');
    const [task, setTask] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [status, setStatus] = useState('idle');
    const [consolidatedOutput, setConsolidatedOutput] = useState('');

  const workflows = [
    { id: 'trecho-completo', title: 'Análise de Trecho Completo' },
    { id: 'documentario-dsc', title: 'Documentário e DSC' },
    { id: 'referencias-links', title: 'Referências e Links' },
    { id: 'versao-final', title: 'Versão Final' },
    { id: 'artigos-periodicos', title: 'Artigos Periódicos' },
      ];

  const handleStart = async () => {
        setStatus('running');
        try {
                const res = await fetch('/api/agentic/review', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                                      workflowId,
                                      task,
                                      selectedText,
                                      currentStep: 1,
                                      maxSteps: 8,
                          }),
                });
                const data = await res.json();
                if (data.ok) {
                          setConsolidatedOutput(data.consolidatedOutput);
                          setStatus('completed');
                }
        } catch (err) {
                setStatus('error');
        }
  };

  return (
        <div className="app-container">
              <h1>Labirintos Revisor - Agêntico</h1>h1>
              <select value={workflowId} onChange={e => setWorkflowId(e.target.value)}>
                {workflows.map(w => <option key={w.id} value={w.id}>{w.title}</option>option>)}
              </select>select>
              <textarea value={task} onChange={e => setTask(e.target.value)} placeholder="Tarefa..." />
              <textarea value={selectedText} onChange={e => setSelectedText(e.target.value)} placeholder="Texto..." />
              <button onClick={handleStart} disabled={status === 'running'}>
                {status === 'running' ? 'Processando...' : 'Iniciar'}
              </button>button>
          {status === 'error' && <p style={{color: 'red'}}>Erro ao processar</p>p>}
          {consolidatedOutput && (
                  <div>
                            <h2>Resultado</h2>h2>
                            <pre>{consolidatedOutput}</pre>pre>
                            <button onClick={() => navigator.clipboard.writeText(consolidatedOutput)}>Copiar</button>button>
                  </div>div>
              )}
        </div>div>
      );
}

export default App;</div>
