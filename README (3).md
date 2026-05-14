# Decisões de implementação

## 1. Por que aprimorar o JSX original

O arquivo `revisor_dissertacao_nucjur.jsx` funcionava como protótipo visual para módulos e prompts. A nova implementação separa dados, fontes, serviços e utilitários, permitindo continuidade do trabalho, exportação, teste de links e inclusão de documentos por Érica.

## 2. Fontes integradas

O app integra as fontes como manifesto operacional, não como cópia dos arquivos. Isso evita redistribuir normas ABNT e protege documentos sensíveis.

## 3. Fluxo de validação

O sistema não bloqueia a consulta de módulos futuros, mas avisa quando o fluxo formal ainda depende de validação anterior. O botão “Aprovar módulo” registra a validação.

## 4. Documentário e DSC

O documentário ainda é tratado como fonte temporária. A referência definitiva depende de título oficial, duração, URL institucional, data de publicação e teste do link. Rodrigo, Marta e Carlos são tratados como pseudônimos operacionais a serem fundidos por DSC.

## 5. Links

O navegador pode sofrer bloqueios CORS; por isso há um script Node para relatório formal.

## 6. Periódicos

O módulo de periódicos não fixa uma lista fechada porque chamadas e dossiês mudam. Ele entrega matriz de triagem e exige busca atualizada, link testado e checagem de integridade editorial.
