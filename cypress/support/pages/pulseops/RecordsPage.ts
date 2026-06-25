import { BasePulseOpsPage } from './BasePulseOpsPage';
import { testTags } from '../../utils/testTags';

/**
 * RecordsPage - Page Object del CRUD de Registros.
 *
 * Selecciona exclusivamente por `data-testid` (contextos `records` y
 * `record-form`); sin selectores por texto ni CSS. Delega en Widgets.
 *
 * Notas de dominio:
 * - El listado solo aparece tras elegir recurso + métrica en los filtros
 *   (autocompletes `records-filter-resource` / `records-filter-metric`).
 * - El formulario asocia recurso (autocomplete) y muestra un input por cada
 *   métrica del recurso; `value-<metricKey>`. Se rellena el primero disponible.
 */
export class RecordsPage extends BasePulseOpsPage {
  constructor() {
    super('records');
  }

  private form(...segments: string[]): string {
    return testTags.child('record-form').selector(segments.join('-'));
  }

  visit(): this {
    cy.visit('/records');
    cy.get(this.sel('create'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  /** Abre un autocomplete, escribe un término y elige la primera opción. */
  private pickOption(baseTestId: string, term?: string): void {
    cy.get(`[data-testid="${baseTestId}"]`, { timeout: 20000 }).click({ force: true });
    if (term) cy.get(`[data-testid="${baseTestId}"]`).type(term, { force: true });
    cy.get(`[data-testid^="${baseTestId}-option-"]`, { timeout: 20000 }).first().click({ force: true });
  }

  /** Filtra por un recurso del seed (con métricas) y su primera métrica. */
  filterFirstResourceAndMetric(): this {
    this.pickOption('cy-records-filter-resource', 'E2E Poder');
    // El selector de métrica se habilita al elegir recurso; espera a que sea usable.
    cy.get('[data-testid="cy-records-filter-metric"]', { timeout: 20000 }).should('not.be.disabled');
    this.pickOption('cy-records-filter-metric');
    return this;
  }

  openCreate(): this {
    cy.getButton(this.sel('create')).click();
    cy.get(this.form('resource'), { timeout: 15000 }).should('be.visible');
    return this;
  }

  /** Crea un registro para un recurso del seed (que tiene métricas asociadas). */
  create(value: number, date = '2026-02-09'): this {
    this.openCreate();
    this.pickOption('cy-record-form-resource', 'E2E Poder');
    cy.getInput(this.form('date')).clear({ force: true }).type(date, { force: true });
    // Los inputs de valor aparecen tras cargar las métricas del recurso elegido.
    cy.get('[data-testid^="cy-record-form-value-"]', { timeout: 30000 })
      .first()
      .clear({ force: true })
      .type(String(value), { force: true });
    cy.getButton(this.form('save')).click();
    return this;
  }

  private anyRow(): string {
    return '[data-testid^="cy-records-row-"]';
  }

  deleteFirstVisible(): this {
    cy.get(this.anyRow()).first().find('[data-testid$="-delete"]').click();
    cy.getButton(this.selRaw('confirm', 'accept')).click();
    return this;
  }

  // --- Aserciones ---

  shouldShowList(): this {
    cy.get(this.sel('list'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  shouldShowToast(text?: string): this {
    const toast = cy.get(this.selRaw('toast')).should('be.visible');
    if (text) toast.and('contain', text);
    return this;
  }

  /** El formulario de creación queda visible (validación bloqueó el submit). */
  shouldKeepFormOpen(): this {
    cy.get(this.form('resource')).should('be.visible');
    return this;
  }
}
