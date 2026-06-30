import { createSign } from 'crypto';

/**
 * Firma el JWT de una GitHub App (RS256) usando `crypto` nativo de Node — sin dependencias
 * tipo `@octokit/auth-app` ni `jsonwebtoken`.
 *
 * El JWT identifica a la App ante GitHub para luego acuñar tokens de instalación. GitHub exige:
 * - `iss` = App ID
 * - `iat` ligeramente en el pasado (tolerancia de reloj)
 * - `exp` ≤ 10 minutos en el futuro
 *
 * ponytail: firma manual de JWS compacto (header.payload.firma) en vez de añadir una librería
 * de JWT. Ceiling: solo RS256 (el único alg que GitHub Apps acepta); no valida, solo firma.
 */
const base64url = (input: Buffer | string): string =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

/** Normaliza una PEM que pudo venir con `\n` escapados desde una variable de entorno. */
export function normalizePem(pem: string): string {
  return pem.includes('\\n') ? pem.replace(/\\n/g, '\n') : pem;
}

export function signAppJwt(
  appId: string,
  privateKeyPem: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iat: nowSeconds - 60, // 60s atrás por drift de reloj
    exp: nowSeconds + 9 * 60, // 9 min (< 10 que exige GitHub)
    iss: appId,
  };

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload),
  )}`;

  const signature = createSign('RSA-SHA256')
    .update(signingInput)
    .sign(normalizePem(privateKeyPem));

  return `${signingInput}.${base64url(signature)}`;
}
