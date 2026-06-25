/**
 * Resuelve JWT_SECRET con fail-fast.
 *
 * Recibe los valores ya leídos por ConfigService (en runtime, con el .env
 * cargado) para garantizar que la firma (AuthModule) y la validación
 * (JwtStrategy) usen SIEMPRE el mismo secreto.
 *
 * - En producción es obligatorio: si falta, lanza y aborta el arranque.
 * - Fuera de producción permite un fallback de desarrollo explícito.
 */
export function resolveJwtSecret(secret?: string, nodeEnv?: string): string {
  if (secret) return secret;

  if (nodeEnv === 'production') {
    throw new Error(
      'JWT_SECRET es obligatorio en producción y no está definido. Aborta el arranque.',
    );
  }

  return 'pulseops-dev-only-secret';
}
