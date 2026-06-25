import { BasePulseOpsPage } from './BasePulseOpsPage';

/**
 * DashboardPage - Page Object del dashboard de análisis.
 *
 * Selecciona exclusivamente por `data-testid` (contexto `dashboard`); sin
 * selectores por texto ni CSS. Los selectores de recurso/métrica son
 * `AutocompleteInfinite`: se escribe en el input y se elige la primera opción.
 */
export class DashboardPage extends BasePulseOpsPage {
  constructor() {
    super('dashboard');
  }

  visit(): this {
    cy.visit('/dashboard');
    cy.getInput(this.sel('resource-select'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  /** Selecciona un recurso por nombre exacto; el dashboard auto-analiza su 1ª métrica. */
  selectResource(name: string): this {
    // El dropdown monta un backdrop fixed que puede cubrir el input → force.
    cy.getInput(this.sel('resource-select')).click({ force: true });
    cy.getInput(this.sel('resource-select')).clear({ force: true }).type(name, { force: true });
    // Elige la opción cuyo texto contiene el nombre (los nombres del seed son únicos).
    cy.contains('[data-testid^="cy-dashboard-resource-select-option-"]', name, {
      timeout: 20000,
    }).click({ force: true });
    return this;
  }

  /** Selecciona la primera métrica del recurso (abre el dropdown y elige la 1ª opción). */
  selectFirstMetric(): this {
    cy.getInput(this.sel('metric-select')).click({ force: true });
    cy.get('[data-testid^="cy-dashboard-metric-select-option-"]', { timeout: 20000 })
      .first()
      .click({ force: true });
    return this;
  }

  shouldShowChart(): this {
    cy.get(this.sel('chart'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  /** La condición operativa resultante está visible (señal estable del análisis). */
  shouldShowCondition(): this {
    cy.get(this.sel('chart'), { timeout: 30000 }).should('be.visible');
    cy.get(this.sel('analysis-condition'), { timeout: 40000 }).should('exist');
    return this;
  }

  /** La condición resultante coincide con la esperada (atributo data-condition). */
  shouldShowConditionEqual(condition: string): this {
    cy.get(this.sel('chart'), { timeout: 30000 }).should('be.visible');
    cy.get(this.sel('analysis-condition'), { timeout: 40000 })
      .should('have.attr', 'data-condition', condition);
    return this;
  }
}
