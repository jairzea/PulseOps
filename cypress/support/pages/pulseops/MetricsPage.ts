import { BasePulseOpsPage } from './BasePulseOpsPage';
import { testTags } from '../../utils/testTags';
import type { MetricInput } from '../../factories/metricFactory';

/**
 * MetricsPage - Page Object del CRUD de Métricas.
 *
 * Selecciona exclusivamente por `data-testid` (contextos `metrics` y
 * `metric-form`); sin selectores por texto ni CSS. Delega en Widgets.
 *
 * Nota de dominio: el formulario de métrica exige asociar ≥ 1 recurso
 * (autocomplete). `pickFirstResource()` elige la primera opción disponible.
 */
export class MetricsPage extends BasePulseOpsPage {
  constructor() {
    super('metrics');
  }

  private form(...segments: string[]): string {
    return testTags.child('metric-form').selector(segments.join('-'));
  }

  visit(): this {
    cy.visit('/metrics');
    cy.get(this.sel('create'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  openCreate(): this {
    cy.getButton(this.sel('create')).click();
    cy.getInput(this.form('key')).should('be.visible');
    return this;
  }

  fillForm(data: Partial<MetricInput>): this {
    if (data.key !== undefined) cy.getInput(this.form('key')).clear().type(data.key);
    if (data.label !== undefined) cy.getInput(this.form('label')).clear().type(data.label);
    if (data.unit !== undefined) cy.getInput(this.form('unit')).clear().type(data.unit);
    return this;
  }

  /** Abre el autocomplete, escribe un término y elige la primera opción de recurso. */
  pickFirstResource(): this {
    // El dropdown monta un backdrop fixed que cubre el input → usar force.
    // Recurso del seed NO asertado por el dashboard (evita contaminar PODER/PELIGRO).
    cy.getInput(this.form('resource-search')).click({ force: true });
    cy.getInput(this.form('resource-search')).type('E2E Inexistencia', { force: true });
    cy.get('[data-testid^="cy-metric-form-resource-option-"]', { timeout: 20000 })
      .first()
      .click({ force: true });
    // Confirma que el recurso quedó asociado (chip visible) antes de continuar.
    cy.get(this.form('resource-chip'), { timeout: 10000 }).should('be.visible');
    return this;
  }

  save(): this {
    cy.getButton(this.form('save')).click();
    return this;
  }

  /** Guarda y captura el toast de éxito en vivo (efímero tras la recarga). */
  saveAndExpectToast(): this {
    cy.getButton(this.form('save')).click();
    cy.get(this.selRaw('toast'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  /** Crea una métrica: campos + recurso + guardar. El POST persiste (201); la UI de
   *  éxito (toast/cierre de modal) puede tardar bajo carga, por eso la verificación
   *  posterior recarga la página en vez de depender del toast efímero. */
  create(data: MetricInput): this {
    this.openCreate();
    this.fillForm(data);
    this.pickFirstResource();
    cy.getButton(this.form('save')).click();
    // Da margen a que el POST se complete (no bloquea en el toast efímero).
    cy.wait(2000);
    return this;
  }

  search(term: string): this {
    cy.getInput(this.sel('search')).clear({ force: true }).type(term, { force: true });
    return this;
  }

  /** Recarga la página y busca (evita depender de que el modal se cierre tras crear). */
  reloadAndSearch(term: string): this {
    this.visit();
    return this.search(term);
  }

  private anyRow(): string {
    return '[data-testid^="cy-metrics-row-"]';
  }

  editFirstVisible(data: { unit?: string }): this {
    cy.get(this.anyRow(), { timeout: 20000 }).should('exist');
    cy.get(this.anyRow()).first().find('[data-testid$="-edit"]').click();
    cy.getInput(this.form('key')).should('be.visible');
    if (data.unit !== undefined) cy.getInput(this.form('unit')).clear().type(data.unit);
    return this.save();
  }

  /** Edita la fila que contiene el texto dado (seguro: solo esa fila). */
  editByText(text: string, data: { unit?: string }): this {
    cy.contains('[data-testid^="cy-metrics-row-"]', text, { timeout: 20000 })
      .find('[data-testid$="-edit"]')
      .click();
    cy.getInput(this.form('key')).should('be.visible');
    if (data.unit !== undefined) cy.getInput(this.form('unit')).clear().type(data.unit);
    return this.save();
  }

  deleteFirstVisible(): this {
    cy.get(this.anyRow(), { timeout: 15000 }).should('exist');
    cy.get(this.anyRow()).first().find('[data-testid$="-delete"]').click();
    cy.getButton(this.selRaw('confirm', 'accept')).click();
    return this;
  }

  /** Elimina la fila que contiene el texto dado (seguro: solo esa fila). */
  deleteByText(text: string): this {
    cy.contains('[data-testid^="cy-metrics-row-"]', text, { timeout: 20000 })
      .find('[data-testid$="-delete"]')
      .click();
    cy.getButton(this.selRaw('confirm', 'accept')).click();
    return this;
  }

  // --- Aserciones ---

  shouldShowInList(text: string): this {
    // Espera la fila que contiene el texto (robusto ante el estado vacío transitorio).
    cy.contains('[data-testid^="cy-metrics-row-"]', text, { timeout: 20000 }).should('exist');
    return this;
  }

  shouldNotShowInList(text: string): this {
    cy.contains('[data-testid^="cy-metrics-row-"]', text).should('not.exist');
    return this;
  }

  shouldShowToast(text?: string): this {
    const toast = cy.get(this.selRaw('toast')).should('be.visible');
    if (text) toast.and('contain', text);
    return this;
  }

  shouldShowFormError(): this {
    cy.get(this.form('key-error')).should('be.visible');
    return this;
  }
}
