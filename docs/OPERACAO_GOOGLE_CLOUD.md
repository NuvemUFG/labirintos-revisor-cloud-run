# Operacao

## Variaveis de ambiente principais

- `APP_ENV=production`
- `AI_PROVIDER=vertex`
- `GOOGLE_CLOUD_PROJECT=sei-ufg-nuvem-ndh`
- `GOOGLE_CLOUD_LOCATION=global`
- `VERTEX_MODEL=gemini-2.5-pro`
- `MAX_BODY_BYTES=2000000`
- `CORS_ORIGIN` opcional, apenas se houver frontend separado.

## Endpoints

- `/` app React.
- `/chat` revisao generativa.
- `/api/check-url` teste server-side de links.
- `/health` diagnostico basico.
- `/api/runtime-config` diagnostico sem segredos.

## Validacao apos deploy

1. Acessar `/health`.
2. Fazer login com conta autorizada.
3. Abrir Configuracoes e manter proxy `/chat`.
4. Selecionar Modulo 1 e enviar uma pergunta simples.
5. Testar uma URL institucional em Links.
6. Confirmar que logs nao registram CPF, RG, transcricoes integrais ou chaves.

## Rollback

No Cloud Run, use Revisions e direcione 100% do trafego para a revisao anterior. Em deploy por Git, reverta o commit e deixe o trigger executar novamente.
