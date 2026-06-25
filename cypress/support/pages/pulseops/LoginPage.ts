import { BasePulseOpsPage } from './BasePulseOpsPage';

/**
 * LoginPage - Page Object de la vista de login de PulseOps.
 *
 * Construido sobre `BasePulseOpsPage` + Widgets. Selecciona exclusivamente por
 * `data-testid` (`cy-login-title`, `cy-login-email`, `cy-login-password`,
 * `cy-login-submit`, `cy-login-error`); sin selectores por texto ni CSS.
 */
export class LoginPage extends BasePulseOpsPage {
  constructor() {
    super('login');
  }

  /** Navega a la vista de login. */
  visit(): this {
    cy.visit('/login');
    return this;
  }

  /** Navega a la raíz de la app (ruta protegida → redirige a login si no hay sesión). */
  visitRoot(): this {
    cy.visit('/');
    return this;
  }

  fillEmail(email: string): this {
    cy.getInput(this.sel('email')).type(email);
    return this;
  }

  fillPassword(password: string): this {
    cy.getInput(this.sel('password')).type(password);
    return this;
  }

  clickLogin(): this {
    cy.getButton(this.sel('submit')).click();
    return this;
  }

  /** Rellena el formulario y lo envía con login real por UI. */
  submit(email: string, password: string): this {
    return this.fillEmail(email).fillPassword(password).clickLogin();
  }

  /** Login válido: envía credenciales y espera el dashboard. */
  login(email: string, password: string): this {
    this.submit(email, password);
    cy.url().should('include', '/dashboard');
    return this;
  }

  /** Login inválido: envía credenciales y espera permanecer en login con error. */
  loginInvalid(email: string, password: string): this {
    this.submit(email, password);
    return this.shouldShowError().shouldStayOnLogin();
  }

  /** Verifica que la vista de login está presente (título visible). */
  shouldShowTitle(): this {
    cy.get(this.sel('title')).should('be.visible');
    return this;
  }

  /** Verifica que el mensaje de error es visible. */
  shouldShowError(): this {
    cy.get(this.sel('error')).should('be.visible');
    return this;
  }

  /** Verifica que el campo email es inválido por validación nativa (required). */
  shouldHaveInvalidEmail(): this {
    cy.getInput(this.sel('email')).then(($el) => {
      const input = $el[0] as HTMLInputElement;
      expect(input.checkValidity(), 'email field validity').to.eq(false);
    });
    return this;
  }

  /** Verifica que la URL sigue en la vista de login. */
  shouldStayOnLogin(): this {
    cy.url().should('include', '/login');
    return this;
  }
}
