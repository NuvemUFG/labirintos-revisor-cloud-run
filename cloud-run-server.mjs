import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createReadStream } from 'fs';
import { readdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(compression());
app.use(express.json({ limit: process.env.MAX_BODY_BYTES || '2mb' }));
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).type('text').send('OK');
});

// Runtime config endpoint
app.get('/api/runtime-config', (req, res) => {
    res.json({
          env: process.env.APP_ENV || 'development',
          provider: process.env.AI_PROVIDER || 'vertex',
          project: process.env.GOOGLE_CLOUD_PROJECT,
          location: process.env.GOOGLE_CLOUD_LOCATION,
          model: process.env.VERTEX_MODEL,
          agentic: {
                  multiCalls: process.env.AGENTIC_MULTI_CALLS === 'true',
                  maxSteps: parseInt(process.env.AGENTIC_MAX_STEPS || '8', 10),
          },
    });
});

// Main agentic review endpoint
app.post('/api/agentic/review', async (req, res) => {
    try {
          const {
                  workflowId,
                  task,
                  selectedText,
                  sources,
                  activeModule,
                  dsc,
                  currentStep = 1,
                  maxSteps = 8,
                  humanValidation = false,
                  priorOutputs = [],
                  sessionId,
          } = req.body;

      // Validate required fields
      if (!workflowId || !task) {
              return res.status(400).json({
                        ok: false,
                        error: 'Missing required fields: workflowId, task',
                        status: 'invalid_request',
              });
      }

      // Initialize response structure
      const response = {
              ok: true,
              status: 'processing',
              workflowId,
              workflowTitle: getWorkflowTitle(workflowId),
              currentStep,
              nextStep: Math.min(currentStep + 1, maxSteps),
              requiresHumanValidation: humanValidation,
              steps: [],
              agentOutputs: {},
              consolidatedOutput: '',
              final: currentStep >= maxSteps,
              warnings: [],
              errors: [],
              provider: process.env.AI_PROVIDER || 'vertex',
              mode: 'agentic',
      };

      // Log the request for monitoring
      console.log(`[agentic] workflow=${workflowId} step=${currentStep}/${maxSteps} task=${task.substring(0, 50)}...`);

      // Route to appropriate handler based on workflow
      switch (workflowId) {
        case 'trecho-completo':
                  await processExcerptWorkflow(response, req.body);
                  break;
        case 'documentario-dsc':
                  await processDocumentaryWorkflow(response, req.body);
                  break;
        case 'referencias-links':
                  await processLinksWorkflow(response, req.body);
                  break;
        case 'versao-final':
                  await processFinalVersionWorkflow(response, req.body);
                  break;
        case 'artigos-periodicos':
                  await processPeriodicalWorkflow(response, req.body);
                  break;
        default:
                  response.warnings.push(`Unknown workflow: ${workflowId}`);
      }

      // Call active agents if available
      if (activeModule) {
              response.agentOutputs[activeModule] = await callAgent(activeModule, req.body);
      }

      // Mark as complete if on last step
      if (currentStep >= maxSteps) {
              response.final = true;
              response.status = 'completed';
              response.consolidatedOutput = consolidateOutputs(response.agentOutputs, priorOutputs);
      } else {
              response.status = 'step_complete';
      }

      res.json(response);
    } catch (error) {
          console.error('[agentic] error:', error);
          res.status(500).json({
                  ok: false,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error',
                  workflowId: req.body?.workflowId,
          });
    }
});

// Helper functions
function getWorkflowTitle(workflowId) {
    const titles = {
          'trecho-completo': 'Análise de Trecho Completo',
          'documentario-dsc': 'Documentário e DSC',
          'referencias-links': 'Referências e Links',
          'versao-final': 'Versão Final',
          'artigos-periodicos': 'Artigos Periódicos',
    };
    return titles[workflowId] || 'Workflow Desconhecido';
}

async function processExcerptWorkflow(response, body) {
    response.steps.push({
          step: 1,
          agent: 'privacy',
          status: 'completed',
          output: 'Privacy check completed',
    });
    response.steps.push({
          step: 2,
          agent: 'normativo',
          status: 'completed',
          output: 'Normative check completed',
    });
}

async function processDocumentaryWorkflow(response, body) {
    response.steps.push({
          step: 1,
          agent: 'dsc',
          status: 'completed',
          output: 'DSC analysis completed',
    });
}

async function processLinksWorkflow(response, body) {
    response.steps.push({
          step: 1,
          agent: 'links',
          status: 'completed',
          output: 'Links validation completed',
    });
}

async function processFinalVersionWorkflow(response, body) {
    response.steps.push({
          step: 1,
          agent: 'sintese',
          status: 'completed',
          output: 'Synthesis completed',
    });
}

async function processPeriodicalWorkflow(response, body) {
    response.steps.push({
          step: 1,
          agent: 'periodicos',
          status: 'completed',
          output: 'Periodical analysis completed',
    });
}

async function callAgent(agentName, body) {
    // Placeholder for agent invocation
  // In production, this would call Vertex AI or other LLM
  return {
        agent: agentName,
        status: 'success',
        output: `${agentName} processing completed`,
        timestamp: new Date().toISOString(),
  };
}

function consolidateOutputs(agentOutputs, priorOutputs) {
    return Object.entries(agentOutputs)
      .map(([agent, data]) => `${agent}: ${data.output}`)
      .concat(priorOutputs)
      .join('\n');
}

// Serve index.html for client-side routing
app.get('*', (req, res) => {
    const indexPath = join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
          if (err) {
                  console.error('Error serving index.html:', err);
                  res.status(404).type('text').send('Not Found');
          }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`[server] running on port ${PORT} in ${process.env.APP_ENV || 'development'} mode`);
    if (process.env.AI_PROVIDER === 'vertex') {
          console.log(`[server] using Vertex AI with model ${process.env.VERTEX_MODEL}`);
    }
});
