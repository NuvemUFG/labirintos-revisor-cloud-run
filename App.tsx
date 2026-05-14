export interface PrivacyFinding {
  label: string;
  severity: 'baixo' | 'medio' | 'alto';
  suggestion: string;
  match?: string;
}

const patterns: Array<{ label: string; severity: PrivacyFinding['severity']; re: RegExp; suggestion: string }> = [
  { label: 'CPF possível', severity: 'alto', re: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, suggestion: 'Remover ou substituir por [CPF suprimido].' },
  { label: 'RG/documento possível', severity: 'alto', re: /\b(?:RG|Documento|Identidade)[:\s]+[A-Z0-9.\-\/]{4,}\b/gi, suggestion: 'Remover número de documento.' },
  { label: 'Telefone possível', severity: 'medio', re: /\b(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})[-\s]?\d{4}\b/g, suggestion: 'Remover ou generalizar contato pessoal.' },
  { label: 'E-mail possível', severity: 'medio', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, suggestion: 'Remover e-mail pessoal ou institucional se não for fonte pública.' },
  { label: 'Data específica', severity: 'baixo', re: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, suggestion: 'Verificar se a data pode identificar o caso; se sim, generalizar.' },
  { label: 'Número de processo possível', severity: 'alto', re: /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g, suggestion: 'Não enviar número de processo sem autorização expressa.' },
  { label: 'Marcador de fonte pendente', severity: 'medio', re: /\((?:xxx|fonte|anexo x|xxxx)\)/gi, suggestion: 'Resolver fonte antes de validar trecho.' }
];

const contextualTerms = [
  { term: 'Rodrigo', label: 'Pseudônimo de depoente', severity: 'medio' as const },
  { term: 'Marta', label: 'Pseudônimo de depoente', severity: 'medio' as const },
  { term: 'Carlos', label: 'Pseudônimo de depoente', severity: 'medio' as const },
  { term: 'cidade pequena', label: 'Risco contextual de reidentificação', severity: 'alto' as const },
  { term: 'não alfabetizada', label: 'Risco contextual de reidentificação', severity: 'alto' as const },
  { term: 'tornozeleira', label: 'Dado penal sensível', severity: 'medio' as const },
  { term: 'processo', label: 'Possível dado judicial', severity: 'medio' as const }
];

export function scanSensitiveText(text: string): PrivacyFinding[] {
  const findings: PrivacyFinding[] = [];
  patterns.forEach((pattern) => {
    const matches = text.match(pattern.re);
    if (matches) {
      matches.slice(0, 5).forEach((match) => findings.push({
        label: pattern.label,
        severity: pattern.severity,
        match,
        suggestion: pattern.suggestion
      }));
    }
  });

  const lower = text.toLowerCase();
  contextualTerms.forEach((item) => {
    if (lower.includes(item.term.toLowerCase())) {
      findings.push({
        label: item.label,
        severity: item.severity,
        match: item.term,
        suggestion: 'Avaliar se o termo deve virar categoria analítica agregada ou pseudônimo interno.'
      });
    }
  });

  return findings;
}

export function anonymizeDraft(text: string) {
  return text
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF suprimido]')
    .replace(/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g, '[processo suprimido]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[e-mail suprimido]')
    .replace(/\b(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})[-\s]?\d{4}\b/g, '[telefone suprimido]');
}
