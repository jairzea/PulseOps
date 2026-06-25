// ponytail: helper de una línea por función; misma convención que cypress/support/utils/testTags.
// No importa desde cypress/ para no acoplar el build del frontend a la carpeta de tests.
const PREFIX = 'cy';
const norm = (s: string) =>
  s.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();

/** tid('login','email') => 'cy-login-email' */
export const tid = (...segments: string[]): string =>
  [PREFIX, ...segments.map(norm)].filter(Boolean).join('-');
