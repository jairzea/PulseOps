/**
 * Self-check del state de OAuth (sin framework).
 * Corre con: npx ts-node src/repo-integration/oauth-state.selfcheck.ts
 *
 * Cubre: round-trip válido, rechazo por firma alterada, por secreto distinto, por expiración,
 * y por formato inválido. Es la garantía de que el anti-CSRF/anti-replay no se rompe en silencio.
 */
import * as assert from 'assert';
import { signOauthState, verifyOauthState, STATE_TTL_MS } from './oauth-state';

const SECRET = 'test-secret';
const t0 = 1_700_000_000_000;

// 1) Round-trip: firma y valida el mismo userId.
const s = signOauthState('user-123', SECRET, t0);
assert.strictEqual(verifyOauthState(s, SECRET, t0), 'user-123', 'round-trip debe devolver el userId');

// 2) Dentro del TTL sigue válido; justo después, no.
assert.strictEqual(verifyOauthState(s, SECRET, t0 + STATE_TTL_MS - 1), 'user-123', 'válido dentro del TTL');
assert.strictEqual(verifyOauthState(s, SECRET, t0 + STATE_TTL_MS + 1), null, 'expira pasado el TTL');

// 3) Firma alterada → null.
const tampered = s.slice(0, -2) + (s.endsWith('aa') ? 'bb' : 'aa');
assert.strictEqual(verifyOauthState(tampered, SECRET, t0), null, 'firma alterada se rechaza');

// 4) Secreto distinto → null (no se puede forjar sin el secreto).
assert.strictEqual(verifyOauthState(s, 'otro-secreto', t0), null, 'secreto distinto se rechaza');

// 5) Payload manipulado (otro userId) invalida la firma.
const forgedPayload = Buffer.from(JSON.stringify({ userId: 'attacker', ts: t0 })).toString('base64url');
const forged = `${forgedPayload}.${s.split('.')[1]}`;
assert.strictEqual(verifyOauthState(forged, SECRET, t0), null, 'payload manipulado se rechaza');

// 6) Formatos inválidos.
assert.strictEqual(verifyOauthState('', SECRET, t0), null, 'vacío');
assert.strictEqual(verifyOauthState('sinpunto', SECRET, t0), null, 'sin separador');

console.log('oauth-state.selfcheck OK ✓');
