/**
 * Composición pura del correo de notificación de condición. Sin I/O ni dependencias de
 * Nest, para poder verificarla con un assert simple.
 */
export interface ConditionEmailInput {
  name: string;
  condition: string;
  explanation?: string;
  playbookTitle: string;
  steps: string[];
  kind?: 'metric' | 'consolidated';
}

export interface ComposedEmail {
  subject: string;
  text: string;
  html: string;
}

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Compone asunto y cuerpo (texto + HTML) del correo a partir de la condición y su playbook.
 */
export function composeConditionEmail(input: ConditionEmailInput): ComposedEmail {
  const scope =
    input.kind === 'consolidated' ? 'condición de producción' : 'condición';
  const subject = `PulseOps — Tu ${scope} es ${input.condition}`;

  const stepsText = input.steps
    .map((s, i) => `  ${i + 1}. ${s}`)
    .join('\n');

  const text = [
    `Hola ${input.name},`,
    '',
    `Tu ${scope} evaluada es: ${input.condition}.`,
    ...(input.explanation ? ['', input.explanation] : []),
    '',
    `${input.playbookTitle}:`,
    stepsText,
    '',
    'Este mensaje fue revisado y enviado manualmente desde PulseOps.',
  ].join('\n');

  const stepsHtml = input.steps
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('');

  const html = [
    `<p>Hola ${escapeHtml(input.name)},</p>`,
    `<p>Tu ${scope} evaluada es: <strong>${escapeHtml(input.condition)}</strong>.</p>`,
    ...(input.explanation ? [`<p>${escapeHtml(input.explanation)}</p>`] : []),
    `<h3>${escapeHtml(input.playbookTitle)}</h3>`,
    `<ol>${stepsHtml}</ol>`,
    `<p style="color:#888;font-size:12px">Este mensaje fue revisado y enviado manualmente desde PulseOps.</p>`,
  ].join('');

  return { subject, text, html };
}
