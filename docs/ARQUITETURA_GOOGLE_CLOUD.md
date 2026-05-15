# Arquitetura Google Cloud institucional

## Decisao recomendada

Cloud Run e o melhor ponto de partida porque o projeto e um web app stateless em React/Vite com um backend Node simples. Ele escala para zero, reduz manutencao e permite manter o endpoint `/chat` no servidor, sem expor credenciais no navegador.

## Componentes

1. Cloud Run service: `labirintos-revisor`.
2. Artifact Registry: `labirintos-containers`.
3. Cloud Build trigger: compila e implanta a cada commit.
4. Service Account: `labirintos-run-sa`.
5. Vertex AI Gemini: provedor institucional padrao.
6. Secret Manager: apenas para chaves externas opcionais.
7. Cloud Logging: logs de execucao e auditoria basica.
8. Cloud Storage privado: futuro repositorio de documentos e transcricoes, sem exposicao publica.

## Controle de acesso

Padrao: `--no-allow-unauthenticated`.

Para validacao por Erica, conceder `roles/run.invoker` ao usuario ou grupo institucional. Para uso amplo com login Google e dominio institucional, avaliar Load Balancer HTTPS + IAP.

## Dados e privacidade

O app foi projetado para evitar redistribuir fontes sensiveis. O manifesto registra as fontes, mas documentos pessoais, normas pagas, transcricoes brutas e videos devem permanecer em repositorios restritos.

## Evolucao futura

- Persistencia controlada em Firestore para estados de revisao aprovados.
- Cloud Storage privado para fontes enviadas por Erica.
- Job Cloud Run para transcricao offline de video institucional.
- Pub/Sub ou Cloud Tasks para checagem de links em lote.
- BigQuery opcional para indicadores anonimizados de uso, sem conteudo textual sensivel.
