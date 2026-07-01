import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Firma/valida el `state` de OAuth (anti-CSRF y anti-replay). El callback de GitHub llega
 * sin nuestro JWT, así que el `userId` viaja dentro del state firmado con HMAC-SHA256.
 *
 * Puro y testeable: recibe el secreto y (opcional) el reloj por parámetro. Formato compacto
 * `base64url(payload).base64url(hmac)`.
 *
 * ponytail: stateless (sin tabla de states en DB), expira por timestamp. Ceiling: no soporta
 * rotación de secreto a mitad de flujo → upgrade = store de states de un solo uso.
 */
export const STATE_TTL_MS = 10 * 60 * 1000;

export function signOauthState(
  userId: string,
  secret: string,
  now: number = Date.now(),
): string {
  const payload = Buffer.from(JSON.stringify({ userId, ts: now })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/**
 * Devuelve el `userId` si el state es auténtico y no expiró; `null` si la firma no coincide,
 * el formato es inválido o pasó el TTL.
 */
export function verifyOauthState(
  state: string,
  secret: string,
  now: number = Date.now(),
): string | null {
  const [payload, sig] = state.split('.');
  if (!payload || !sig) return null;

  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const { userId, ts } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof ts !== 'number' || now - ts > STATE_TTL_MS) return null;
    return typeof userId === 'string' ? userId : null;
  } catch {
    return null;
  }
}
