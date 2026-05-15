# Modo agêntico institucional - Google Cloud

Esta versão adiciona uma camada agêntica ao revisor React/Cloud Run. O objetivo é permitir que a Érica acione fluxos especializados para revisão da dissertação, documentário/DSC, referências, versão final UFG/BDTD e artigos derivados, mantendo validação humana obrigatória.

## Endpoints

- `GET /health`: diagnóstico do serviço, provedor de IA e configuração agêntica.
- `POST /chat`: chat padrão do revisor.
- `POST /api/agentic/review`: execução de workflow agêntico.
- `POST /api/check-url`: teste server-side de URL.

## Workflows disponíveis

1. `trecho-completo`: revisão agêntica de trecho, com orquestração, privacidade, fontes, ABNT, método, edição e síntese.
2. `documentario-dsc`: transcrição e Discurso do Sujeito Coletivo para Rodrigo, Marta e Carlos.
3. `referencias-links`: lista de referências, citações órfãs, URLs e datas de acesso.
4. `versao-final`: fechamento UFG/BDTD, versão pública, anexos restritos e declaração de IA.
5. `artigos-periodicos`: recortes para artigos e triagem de periódicos/dossiês.

## Agentes

- Orquestrador acadêmico
- Guardião de privacidade e ética
- Curador de fontes e rastreabilidade
- Revisor ABNT e UFG/BDTD
- Revisor metodológico
- Especialista em documentário e DSC
- Auditor de links e referências online
- Editor de fluidez e diagramação
- Estrategista de periódicos
- Síntese final e validação humana

## Variáveis de ambiente

```text
AI_PROVIDER=vertex
GOOGLE_CLOUD_PROJECT=sei-ufg-nuvem-ndh
GOOGLE_CLOUD_LOCATION=global
VERTEX_MODEL=gemini-2.5-pro
AGENTIC_MULTI_CALLS=true
AGENTIC_MAX_STEPS=8
MAX_BODY_BYTES=2000000
```

`AGENTIC_MULTI_CALLS=true` executa uma chamada por agente generativo. Para reduzir custo e latência, use `AGENTIC_MULTI_CALLS=false`; nesse modo o servidor executa agentes determinísticos e concentra a síntese em uma chamada única, quando houver provedor configurado.

## Segurança

- O app não publica PDFs ABNT, histórico acadêmico, MP4, transcrições brutas ou documentos pessoais.
- O endpoint agêntico recebe apenas o que Érica inserir no app ou o manifesto de fontes do módulo ativo.
- O scanner determinístico detecta CPF, e-mail, telefone, processo, datas, marcadores pendentes e nomes operacionais sensíveis.
- A resposta final sempre deve terminar com validação humana: “Érica, você aprova esta revisão? Deseja ajustar algo antes de prosseguirmos?”.

## Uso na interface

1. Abra a aba `Modo agêntico`.
2. Escolha o workflow.
3. Cole a tarefa ou use o trecho já informado em `Trecho em revisão`.
4. Clique em `Executar agentes`.
5. Revise a trilha de agentes e a síntese final.
6. Aplique alterações apenas após validação de Érica.

## Implantação

O `cloudbuild.yaml` já define as variáveis agênticas no deploy Cloud Run. O template `infra/service.cloudrun.template.yaml` também foi atualizado.

## Evolução recomendada

- Persistir trilhas de agentes no Firestore com hash de versão do trecho.
- Armazenar documentos de trabalho em Cloud Storage privado.
- Conectar Vertex AI Search/RAG quando houver autorização institucional para indexar fontes restritas.
- Avaliar Vertex AI Agent Engine/ADK se a instituição quiser separar agentes em runtime gerenciado próprio.
