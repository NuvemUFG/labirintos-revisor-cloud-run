# Labirintos — Revisor Interativo React

Aplicação React/Vite para apoiar a revisão da dissertação **“Labirintos de Punição e Rodas de Cura: ecoando vozes silenciadas no Plano de Reparação em Goiás”**, de Érica Fernanda Teixeira Santos, com fluxo de validação por módulos, fontes anexadas, protocolo de documentário/DSC, teste de links, checklist UFG/BDTD e ambiente pós-validação para artigos.

## O que foi implementado

- Fluxo com 12 módulos: 9 de revisão principal + documentário/DSC + finalização UFG/BDTD + periódicos.
- Chat interativo em dois modos:
  - **Modo local:** gera prompts, checklists e orientações sem chamar API.
  - **Modo proxy:** envia contexto para um servidor local/institucional, sem expor chaves no navegador.
- Manifesto das fontes anexadas: dissertação matriz, NBRs, CNPq, parecer, sistema prompt, JSX Sonnet, histórico acadêmico e documentário pendente.
- Validação explícita por Érica antes de avançar entre módulos.
- Scanner de dados sensíveis para trechos da dissertação.
- Área de transcrição do documentário e matriz DSC para Rodrigo, Marta e Carlos, sem exposição individualizante.
- Link checker no navegador e script Node para relatório CSV auditável.
- Checklist para versão final, Biblioteca Central/SIBI-UFG e BDTD.
- Módulo de artigos/periódicos sem recomendar chamadas desatualizadas: exige busca atual, teste de links e triagem de integridade.
- Exportação de estado JSON e pacote de prompts Markdown.

## Estrutura

```text
labirintos-revisor-react/
  src/
    App.tsx
    styles.css
    data/
      modules.ts
      sources.ts
      promptCore.ts
    services/
      chatClient.ts
    utils/
      exporters.ts
      links.ts
      privacy.ts
  server/
    llm-proxy.mjs
  scripts/
    check-links.mjs
  public/sources/README.md
```

## Instalação e execução

```bash
npm install
npm run dev
```

Acesse o endereço mostrado pelo Vite, geralmente `http://localhost:5173`.

## Chat com modelo de linguagem

Por segurança, a chave do provedor de IA não deve ser colocada no React. Use o proxy:

```bash
# terminal 1
npm run proxy

# terminal 2
npm run dev
```

No app, vá em **Configurações** e informe:

```text
http://localhost:8787/chat
```

O arquivo `server/llm-proxy.mjs` é genérico. Adapte `callProvider()` ao gateway institucional ou provedor escolhido.

## Uso recomendado

1. Abra **Fontes** e confira o manifesto.
2. No **Módulo 1**, copie o prompt ou envie pelo chat conectado.
3. Analise/revise um trecho por vez na aba **Trecho em revisão**.
4. Érica valida cada módulo; clique em **Aprovar módulo**.
5. Para o documentário, use **Documentário + DSC** e só gere referência definitiva quando houver URL institucional testada.
6. Rode **Teste de links** antes da versão final.
7. Use **UFG/BDTD** para o checklist pós-defesa.
8. Só depois da dissertação validada, use **Periódicos** para adaptar recortes em artigos.

## Link checker formal

Coloque URLs em `links.txt` e rode:

```bash
npm run linkcheck
```

O relatório será salvo como `link-check-report.csv`.

## Observações de integridade e privacidade

- Este pacote não redistribui PDFs da ABNT, histórico acadêmico ou vídeo documental.
- O histórico acadêmico é marcado como sensível: não expor CPF, RG, data de nascimento ou documento.
- Depoimentos do documentário devem ser fundidos em DSC e validados por Érica.
- A IA é ferramenta de apoio, nunca autora.
- Qualquer recomendação de periódico/dossiê deve ser atualizada por busca web no dia da decisão e ter link testado.

## Execução no Replit

Esta versão inclui arquivos prontos para Replit: `.replit`, `replit.nix`, `server/replit-server.mjs`, `README_REPLIT.md` e `replit.md`.

No Replit, importe o ZIP, adicione `OPENAI_API_KEY` em Secrets, clique em Run e use o link público gerado pela plataforma. O servidor de produção expõe o app React em `/`, o chat em `/chat`, diagnóstico em `/health` e teste server-side de links em `/api/check-url`.

## Google Cloud Run institucional

Esta versao tambem esta pronta para Cloud Run no projeto `sei-ufg-nuvem-ndh`.

Leia primeiro:

- `README_GOOGLE_CLOUD.md`
- `docs/ARQUITETURA_GOOGLE_CLOUD.md`
- `docs/OPERACAO_GOOGLE_CLOUD.md`

Deploy rapido:

```bash
PROJECT_ID=sei-ufg-nuvem-ndh REGION=southamerica-east1 ./infra/bootstrap-gcloud.sh
PROJECT_ID=sei-ufg-nuvem-ndh REGION=southamerica-east1 ./infra/deploy-source.sh
```

Deploy por repositorio: conectar o repositorio no Cloud Run e usar `cloudbuild.yaml` como arquivo de build.

## Modo agêntico Cloud Run

Esta edição inclui a aba **Modo agêntico** e o endpoint `POST /api/agentic/review`, com agentes para privacidade, fontes, ABNT/UFG, metodologia, documentário/DSC, links, edição, periódicos e síntese final com validação humana.

Para Cloud Run/Vertex AI, use as variáveis:

```text
AI_PROVIDER=vertex
GOOGLE_CLOUD_PROJECT=sei-ufg-nuvem-ndh
GOOGLE_CLOUD_LOCATION=global
VERTEX_MODEL=gemini-2.5-pro
AGENTIC_MULTI_CALLS=true
AGENTIC_MAX_STEPS=8
```

Mais detalhes em `docs/MODO_AGENTICO_GOOGLE_CLOUD.md`.
