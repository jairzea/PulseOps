/**
 * Self-check de la firma del App JWT (sin framework).
 * Corre con: npx ts-node src/repo-integration/providers/app-jwt.selfcheck.ts
 *
 * Genera un par RSA efímero, firma un JWT y verifica: estructura de 3 partes, claims
 * (iss/iat/exp con la ventana correcta) y que la firma sea válida contra la clave pública.
 */
import { generateKeyPairSync, createVerify } from 'crypto';
import * as assert from 'assert';
import { signAppJwt, normalizePem } from './app-jwt';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const now = 1_700_000_000;
const jwt = signAppJwt('123456', privateKey, now);

const parts = jwt.split('.');
assert.strictEqual(parts.length, 3, 'JWT debe tener 3 partes');

const decode = (s: string) =>
  JSON.parse(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());

const header = decode(parts[0]);
const payload = decode(parts[1]);
assert.strictEqual(header.alg, 'RS256', 'alg debe ser RS256');
assert.strictEqual(payload.iss, '123456', 'iss = App ID');
assert.strictEqual(payload.iat, now - 60, 'iat 60s en el pasado');
assert.strictEqual(payload.exp, now + 9 * 60, 'exp 9 min en el futuro (< 10)');

// La firma debe validar contra la clave pública.
const ok = createVerify('RSA-SHA256')
  .update(`${parts[0]}.${parts[1]}`)
  .verify(
    publicKey,
    Buffer.from(parts[2].replace(/-/g, '+').replace(/_/g, '/'), 'base64'),
  );
assert.ok(ok, 'la firma debe ser válida');

// normalizePem desescapa los \n de variables de entorno.
assert.ok(normalizePem('a\\nb').includes('\n'), 'normalizePem desescapa \\n');

console.log('app-jwt.selfcheck OK ✓');
