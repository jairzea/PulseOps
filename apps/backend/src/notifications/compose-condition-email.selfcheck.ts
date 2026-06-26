/**
 * Self-check de composeConditionEmail (sin framework). No envía correo: solo verifica
 * que la composición incluye condición, pasos numerados y escapa HTML.
 *
 * Ejecutar: npx ts-node src/notifications/compose-condition-email.selfcheck.ts
 *           (desde apps/backend)
 */
import assert from 'node:assert';
import { composeConditionEmail } from './compose-condition-email';

let failures = 0;
const check = (name: string, cond: boolean) => {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.error(`  ✗ ${name}`);
  }
};

console.log('Self-check composeConditionEmail:');

const email = composeConditionEmail({
  name: 'Helena Vargas',
  condition: 'EMERGENCIA',
  explanation: 'Nivel 30% sobre 2 métricas.',
  playbookTitle: 'Fórmula de Emergencia',
  steps: ['Promociona', 'Cambia tu forma de actuar', 'Economiza'],
  kind: 'consolidated',
});

check('asunto incluye la condición', email.subject.includes('EMERGENCIA'));
check('asunto refleja consolidado', email.subject.includes('producción'));
check('texto saluda por nombre', email.text.includes('Helena Vargas'));
check('texto incluye la explicación', email.text.includes('Nivel 30%'));
check('texto numera los pasos', email.text.includes('1. Promociona') && email.text.includes('3. Economiza'));
check('html lista los pasos en <ol>', email.html.includes('<ol>') && email.html.includes('<li>Promociona</li>'));
check('html incluye el título del playbook', email.html.includes('Fórmula de Emergencia'));

// Escape HTML: un paso con caracteres peligrosos no debe inyectar markup.
const xss = composeConditionEmail({
  name: 'Test <b>x</b>',
  condition: 'NORMAL',
  playbookTitle: 'T',
  steps: ['<script>alert(1)</script>'],
});
check('escapa HTML en nombre', !xss.html.includes('<b>x</b>') && xss.html.includes('&lt;b&gt;'));
check('escapa HTML en pasos', !xss.html.includes('<script>') && xss.html.includes('&lt;script&gt;'));

// Sin explicación: no rompe y no agrega línea vacía de más relevante.
const noExpl = composeConditionEmail({
  name: 'Ana',
  condition: 'PODER',
  playbookTitle: 'Fórmula de Poder',
  steps: ['No te desconectes'],
});
check('funciona sin explicación', noExpl.subject.includes('PODER') && noExpl.text.includes('Ana'));

if (failures > 0) {
  console.error(`\n❌ Self-check falló: ${failures} caso(s).`);
  process.exit(1);
}
console.log('\n✅ Self-check de composición OK.');
