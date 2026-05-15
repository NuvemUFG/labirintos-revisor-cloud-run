# Labirintos Revisor - Google Cloud Run

Projeto configurado para o Google Cloud institucional `sei-ufg-nuvem-ndh`.

## Caminho recomendado

Use Cloud Run com implantacao continua a partir de repositorio Git. O link recebido pelo projeto ja aponta para a tela de criacao do Cloud Run em modo `deploymentType=repository`, que e adequada para conectar GitHub por Cloud Build ou Developer Connect.

Arquivos adicionados:

- `Dockerfile`: imagem Node 20 com build React/Vite e servidor HTTP.
- `cloudbuild.yaml`: build, push para Artifact Registry e deploy no Cloud Run.
- `server/cloud-run-server.mjs`: servidor Cloud Run com `/chat`, `/api/check-url`, `/health` e suporte a Vertex AI.
- `infra/bootstrap-gcloud.sh`: habilita APIs, cria Artifact Registry e conta de servico.
- `infra/deploy-source.sh`: deploy direto a partir da pasta local, sem configurar trigger.
- `infra/grant-invoker.sh`: concede acesso Cloud Run Invoker a usuario ou grupo.
- `.gcloudignore` e `.dockerignore`: evitam envio de PDFs, DOCX, MP4, zips e `.env`.

## Arquitetura

Navegador da Erica -> Cloud Run -> Vertex AI Gemini / proxy institucional / OpenAI opcional.

O padrao desta versao e Vertex AI, sem chave de API no navegador:

```text
AI_PROVIDER=vertex
GOOGLE_CLOUD_PROJECT=sei-ufg-nuvem-ndh
GOOGLE_CLOUD_LOCATION=global
VERTEX_MODEL=gemini-2.5-pro
```

## Passo 1 - Preparar o projeto

No Cloud Shell ou em maquina com `gcloud` autenticado:

```bash
cd labirintos-revisor-react
PROJECT_ID=sei-ufg-nuvem-ndh REGION=southamerica-east1 ./infra/bootstrap-gcloud.sh
```

## Passo 2A - Deploy rapido por fonte

```bash
PROJECT_ID=sei-ufg-nuvem-ndh REGION=southamerica-east1 ./infra/deploy-source.sh
```

Este caminho usa `gcloud run deploy --source .` e o Dockerfile presente no repositorio.

## Passo 2B - Deploy continuo pelo console

Na tela Cloud Run > Criar servico > Conectar repositorio:

1. Escolha Cloud Build para GitHub, ou Developer Connect se o repositorio estiver no GitLab/Bitbucket.
2. Repositorio: selecione o repositorio do projeto.
3. Branch: `^main$` ou a branch institucional.
4. Tipo de build: Cloud Build configuration file.
5. Arquivo: `cloudbuild.yaml`.
6. Service name: `labirintos-revisor`.
7. Region: `southamerica-east1`.
8. Authentication: exigir autenticacao.

## Passo 3 - Conceder acesso a Erica

Substitua pelo e-mail institucional ou grupo correto:

```bash
PROJECT_ID=sei-ufg-nuvem-ndh REGION=southamerica-east1 MEMBER=user:erica@ufg.br ./infra/grant-invoker.sh
```

Para grupo:

```bash
MEMBER=group:ndh@ufg.br ./infra/grant-invoker.sh
```

## Passo 4 - Testar

```bash
curl -I https://URL_DO_CLOUD_RUN/
curl https://URL_DO_CLOUD_RUN/health
```

No app, abra Configuracoes e deixe a URL do proxy como `/chat`.

## Seguranca e dados sensiveis

- Nao publique PDFs normativos ABNT, historico academico, transcricoes brutas ou MP4 em pasta publica.
- Use Cloud Storage privado para documentos de trabalho, se necessario.
- Use Secret Manager para chaves externas.
- O deploy padrao nao permite acesso anonimo.
- O app limita o corpo da requisicao a 2 MB por padrao.
- O endpoint `/chat` envia ao modelo apenas o contexto que Erica colar ou selecionar no app.

## OpenAI opcional via Secret Manager

Se a instituicao optar por OpenAI alem de Vertex AI:

```bash
printf "%s" "$OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=-
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:labirintos-run-sa@sei-ufg-nuvem-ndh.iam.gserviceaccount.com" \
  --role=roles/secretmanager.secretAccessor
```

Atualize o deploy com:

```bash
gcloud run services update labirintos-revisor \
  --region southamerica-east1 \
  --update-secrets OPENAI_API_KEY=openai-api-key:latest \
  --set-env-vars AI_PROVIDER=openai,OPENAI_MODEL=gpt-5.2
```

## Modo agêntico

A versão atual inclui modo agêntico na interface e no servidor Cloud Run.

Endpoint principal:

```text
POST /api/agentic/review
```

Workflows:

```text
trecho-completo
documentario-dsc
referencias-links
versao-final
artigos-periodicos
```

Variáveis de ambiente já configuradas no `cloudbuild.yaml`:

```text
AGENTIC_MULTI_CALLS=true
AGENTIC_MAX_STEPS=8
```

Para reduzir custo/latência em testes:

```bash
gcloud run services update labirintos-revisor \
  --region southamerica-east1 \
  --set-env-vars AGENTIC_MULTI_CALLS=false,AGENTIC_MAX_STEPS=6
```

Documentação interna: `docs/MODO_AGENTICO_GOOGLE_CLOUD.md`.
