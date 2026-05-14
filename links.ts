import type { ReviewModule } from '../data/modules';
import type { ProjectSource } from '../data/sources';
import type { AgentId } from '../data/agents';
import { masterSystemPrompt } from '../data/promptCore';

export interface AgenticRequest {
  workflowId: string;
  task: string;
  activeModule?: ReviewModule;
  sources: ProjectSource[];
  selectedText?: string;
  dsc?: {
    rodrigo?: string;
    marta?: string;
    carlos?: string;
    videoTitle?: string;
    videoUrl?: string;
    videoDuration?: string;
  };
}

export interface AgenticStep {
  agentId: AgentId | string;
  agentName: string;
  status: 'ok' | 'warning' | 'blocked' | 'skipped';
  summary: string;
  output: string;
  startedAt?: string;
  completedAt?: string;
  provider?: string;
}

export interface AgenticResponse {
  ok: boolean;
  workflowId: string;
  workflowTitle: string;
  mode: 'agentic' | 'local';
  provider?: string;
  steps: AgenticStep[];
  final: string;
  warnings: string[];
}

export async function runAgenticWorkflow(request: AgenticRequest): Promise<AgenticResponse> {
  const res = await fetch('/api/agentic/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: masterSystemPrompt,
      ...request
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Agentes responderam ${res.status}: ${text}`);
  }
  return res.json();
}
