import { BasePulseOpsPage } from './BasePulseOpsPage';

/**
 * ConfigurationPage - Page Object de la configuración de umbrales.
 *
 * Selecciona exclusivamente por `data-testid` (contexto `configuration`); sin
 * selectores por texto ni CSS. La edición es un wizard de 4 pasos: el umbral de
 * AFLUENCIA vive en el paso 2; tras editarlo se avanza hasta el paso 4 y se guarda.
 */
export class ConfigurationPage extends BasePulseOpsPage {
  constructor() {
    super('configuration');
  }

  visit(): this {
    cy.visit('/configuration');
    cy.get(this.sel('edit'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  enterEdit(): this {
    cy.getButton(this.sel('edit')).click();
    return this;
  }

  next(): this {
    cy.getButton(this.sel('next')).click();
    return this;
  }

  /** Edita el umbral mínimo de AFLUENCIA (paso 2 del wizard) y guarda. */
  editAfluenciaThresholdAndSave(value: number): this {
    this.enterEdit();
    this.next(); // paso 1 → 2
    // Selecciona todo el contenido y lo reemplaza (robusto para input numérico).
    cy.getInput(this.sel('threshold', 'afluencia-min'))
      .should('be.visible')
      .focus()
      .type('{selectall}', { force: true })
      .type(String(value), { force: true })
      .blur();
    cy.getInput(this.sel('threshold', 'afluencia-min')).should('have.value', String(value));
    this.next(); // 2 → 3
    this.next(); // 3 → 4
    cy.getButton(this.sel('save')).click();
    return this;
  }

  // --- Aserciones ---

  /** El resumen de AFLUENCIA (modo vista) muestra el valor dado. */
  shouldShowAfluenciaThreshold(value: number): this {
    cy.get(this.sel('summary', 'afluencia'), { timeout: 15000 }).should('contain', `${value}%`);
    return this;
  }

  shouldShowSummary(condition: string): this {
    cy.get(this.sel('summary', condition), { timeout: 15000 }).should('be.visible');
    return this;
  }

  shouldShowToast(text?: string): this {
    const toast = cy.get(this.selRaw('toast')).should('be.visible');
    if (text) toast.and('contain', text);
    return this;
  }
}
