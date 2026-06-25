import { BasePulseOpsPage } from './BasePulseOpsPage';

/**
 * ProfilePage - Page Object del perfil de usuario.
 *
 * Selecciona exclusivamente por `data-testid` (contexto `profile`); sin
 * selectores por texto ni CSS. La edición es en línea: botón Editar → campos →
 * Guardar; en modo lectura el nombre/email se exponen como `*-value`.
 */
export class ProfilePage extends BasePulseOpsPage {
  constructor() {
    super('profile');
  }

  visit(): this {
    cy.visit('/profile');
    // El perfil hace fetch del usuario antes de renderizar; espera el botón Editar.
    cy.get(this.sel('edit'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  enterEdit(): this {
    cy.getButton(this.sel('edit')).click();
    return this;
  }

  updateName(name: string): this {
    cy.getInput(this.sel('name')).clear().type(name);
    return this;
  }

  save(): this {
    cy.getButton(this.sel('save')).click();
    return this;
  }

  /** Edita el nombre y guarda en un solo paso. */
  editName(name: string): this {
    return this.enterEdit().updateName(name).save();
  }

  // --- Aserciones ---

  /** El nombre en modo lectura coincide con el valor dado. */
  shouldShowName(name: string): this {
    cy.get(this.sel('name-value')).should('contain', name);
    return this;
  }

  shouldShowEmail(email: string): this {
    cy.get(this.sel('email-value')).should('contain', email);
    return this;
  }

  shouldShowToast(text?: string): this {
    const toast = cy.get(this.selRaw('toast')).should('be.visible');
    if (text) toast.and('contain', text);
    return this;
  }
}
