import { testTags } from '../../utils/testTags';

/**
 * Base de los Page Objects de PulseOps.
 *
 * Centraliza la construcción de selectores `data-testid` vía `testTags`, de modo
 * que el contrato frontend↔cypress sea único: `sel('create')` produce
 * `[data-testid="cy-<ctx>-create"]`, idéntico al `tid(ctx,'create')` del frontend.
 */
export abstract class BasePulseOpsPage {
  protected ctx: string; // ej. 'resources'

  constructor(ctx: string) {
    this.ctx = ctx;
  }

  /** sel('row','abc','edit') => '[data-testid="cy-<ctx>-row-abc-edit"]' */
  protected sel(...segments: string[]): string {
    return testTags.child(this.ctx).selector(segments.join('-'));
  }

  /** selRaw('login','email') ignora ctx, para selectores globales (nav, toast, confirm) */
  protected selRaw(...segments: string[]): string {
    return testTags.selector(segments.join('-'));
  }
}
