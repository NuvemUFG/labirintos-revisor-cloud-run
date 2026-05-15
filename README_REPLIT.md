# Execucao no Replit

Este pacote esta pronto para importacao por ZIP no Replit.

## 1. Importar

1. Abra `replit.com/import`.
2. Escolha `ZIP`.
3. Envie este arquivo ZIP.
4. Confirme a raiz do projeto `labirintos-revisor-react`.

## 2. Secrets

Em `Tools > Secrets`, adicione:

- `OPENAI_API_KEY`: chave da conta/projeto OpenAI autorizada.
- `OPENAI_MODEL`: opcional. Padrao: `gpt-5.2`.
- `OPENAI_MAX_OUTPUT_TOKENS`: opcional. Padrao: `2500`.

Nunca cole a chave no codigo, em `.env` versionado, no chat publico ou em arquivos exportados.

## 3. Rodar

O botao Run usa:

```bash
npm install && npm run build && npm start
```

O servidor abre a porta `3000` e expoe:

- `/` app React
- `/chat` chat seguro via servidor
- `/api/check-url` teste server-side de links
- `/health` diagnostico

## 4. Publicar

Use `Deployments`/`Publish` no Replit. A configuracao `.replit` ja define:

```toml
[deployment]
build = "npm install && npm run build"
run = "npm start"
```

## 5. Fontes sensiveis

O app traz manifesto e parametros de uso das fontes. Os PDFs normativos ABNT e documentos pessoais/sensiveis nao devem ficar em pasta publica do Replit. Quando Erica inserir novos documentos, use a aba `Fontes` para registrar metadados e a aba `Trecho` para analisar trechos, sem expor CPF, documentos, contatos ou dados identificatorios.
