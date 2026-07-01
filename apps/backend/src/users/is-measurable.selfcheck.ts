/**
 * Self-check de isMeasurableUser (sin framework).
 * Corre con: npx ts-node src/users/is-measurable.selfcheck.ts
 */
import * as assert from 'assert';
import { UserRole } from './schemas/user.schema';
import { isMeasurableUser } from './is-measurable';

// user sin flag → medible por defecto
assert.strictEqual(isMeasurableUser({ role: UserRole.USER }), true, 'user default medible');
// admin sin flag → no medible
assert.strictEqual(isMeasurableUser({ role: UserRole.ADMIN }), false, 'admin default no medible');
// admin con flag true → medible (override)
assert.strictEqual(
  isMeasurableUser({ role: UserRole.ADMIN, resourceProfile: { isMeasurable: true } }),
  true,
  'admin con flag es medible',
);
// user con flag false → NO medible (override explícito)
assert.strictEqual(
  isMeasurableUser({ role: UserRole.USER, resourceProfile: { isMeasurable: false } }),
  false,
  'user con flag false deja de ser medible',
);
// resourceProfile ausente/null no rompe
assert.strictEqual(isMeasurableUser({ role: UserRole.USER, resourceProfile: null }), true);

console.log('is-measurable.selfcheck OK ✓');
