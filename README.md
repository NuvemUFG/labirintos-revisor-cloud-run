# Labirintos Revisor - Modo Agêntico

Aplicação React/Vite + Node.js para revisão agêntica de documentos com IA Vertex. Deploy em Cloud Run com suporte a múltiplos workflows e agentes de análise.

## Recursos

- **UI Agêntica Completa**: Seleção de workflows, agentes ativos, progresso por etapa, histórico de execução
- - **Backend Robusto**: Express.js com endpoints estruturados para processamento agêntico
  - - **Vertex AI**: Integração nativa com Google Cloud Vertex AI (Gemini 2.5 Pro)
    - - **Cloud Run Ready**: Deploy containerizado com Dockerfile e Cloud Build
      - - **TypeScript**: Type-safe em frontend e backend
       
        - ## Estrutura do Projeto
       
        - ```
          labirintos-revisor-cloud-run/
          ├── src/
          │   ├── main.tsx          # Componente React principal
          │   └── App.css           # Estilos da UI agêntica
          ├── server/
          │   └── cloud-run-server.mjs  # Servidor Node.js/Express
          ├── index.html            # Ponto de entrada
          ├── package.json          # Dependências
          ├── vite.config.ts        # Configuração Vite
          ├── tsconfig.json         # Configuração TypeScript
          ├── Dockerfile            # Build para Cloud Run
          ├── cloudbuild.yaml       # Pipeline Cloud Build
          └── .env.example          # Variáveis de ambiente
          ```

          ## Instalação Local

          ```bash
          # Instalar dependências
          npm install

          # Desenvolvimento
          npm run dev

          # Build
          npm run build

          # Produção local
          npm start
          ```

          ## Cloud Run Deployment

          ### Configuração GCP

          ```bash
          export PROJECT_ID=sei-ufg-nuvem-ndh
          export REGION=southamerica-east1
          export SERVICE=labirintos-revisor
          export IMAGE=labirintos-revisor

          # Build com Cloud Build
          gcloud builds submit \
            --config cloudbuild.yaml \
            --project=$PROJECT_ID
          ```

          ### Variáveis de Produção

          Configurar no Cloud Run via Secret Manager:

          - `APP_ENV=production`
          - - `AI_PROVIDER=vertex`
            - - `GOOGLE_CLOUD_PROJECT=sei-ufg-nuvem-ndh`
              - - `VERTEX_MODEL=gemini-2.5-pro`
                - - `VERTEX_MAX_OUTPUT_TOKENS=4096`
                  - - `AGENTIC_MAX_STEPS=8`
                   
                    - ## Endpoints API
                   
                    - - `GET /health` - Health check
                      - - `GET /api/runtime-config` - Configuração de runtime
                        - - `POST /api/agentic/review` - Processamento agêntico (payload estruturado)
                         
                          - ### Payload POST /api/agentic/review
                         
                          - ```json
                            {
                              "workflowId": "trecho-completo",
                              "task": "Revisar trecho de documento",
                              "selectedText": "Texto para análise...",
                              "sources": ["fonte1", "fonte2"],
                              "activeModule": "privacy",
                              "currentStep": 1,
                              "maxSteps": 8,
                              "humanValidation": false
                            }
                            ```

                            ## Workflows Suportados

                            - `trecho-completo` - Análise de Trecho Completo
                            - - `documentario-dsc` - Documentário e DSC
                              - - `referencias-links` - Referências e Links
                                - - `versao-final` - Versão Final
                                  - - `artigos-periodicos` - Artigos Periódicos
                                   
                                    - ## Agentes Disponíveis
                                   
                                    - - orquestrador, privacidade, fontes, normativo, metodologico
                                      - - dsc, links, editorial, periodicos, sintese
                                       
                                        - ## Variáveis de Ambiente
                                       
                                        - Copiar `.env.example` para `.env` e configurar:
                                       
                                        - ```bash
                                          APP_ENV=development
                                          AI_PROVIDER=vertex
                                          GOOGLE_CLOUD_PROJECT=seu-projeto-gcp
                                          VERTEX_MODEL=gemini-2.5-pro
                                          PORT=8080
                                          ```

                                          ## Build e Testes

                                          ```bash
                                          # Instalar
                                          npm install

                                          # Build
                                          npm run build

                                          # Verificar saúde
                                          npm run health
                                          ```

                                          ## Licença

                                          Proprietary - SEI/UFG

                                          ## Contato

                                          Nuvem UFG - sei-ufg-nuvem-ndh
