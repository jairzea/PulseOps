import { BasePulseOpsPage } from './BasePulseOpsPage';
import { testTags } from '../../utils/testTags';
import type { UserInput } from '../../factories/userFactory';

/**
 * UsersPage - Page Object del CRUD de Usuarios.
 *
 * Selecciona exclusivamente por `data-testid` (contextos `users` y `user-form`);
 * sin selectores por texto ni CSS. Delega en Widgets.
 *
 * Notas de dominio: el borrado usa `window.confirm` nativo (Cypress lo acepta
 * automáticamente); no hay modal de edición (solo crear / activar / eliminar).
 */
export class UsersPage extends BasePulseOpsPage {
  constructor() {
    super('users');
  }

  private form(...segments: string[]): string {
    return testTags.child('user-form').selector(segments.join('-'));
  }

  visit(): this {
    cy.visit('/users');
    cy.get(this.sel('create'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  openCreate(): this {
    cy.getButton(this.sel('create')).click();
    cy.getInput(this.form('name')).should('be.visible');
    return this;
  }

  fillForm(data: Partial<UserInput>): this {
    if (data.name !== undefined) cy.getInput(this.form('name')).type(data.name);
    if (data.email !== undefined) cy.getInput(this.form('email')).type(data.email);
    if (data.password !== undefined) cy.getInput(this.form('password')).type(data.password);
    if (data.role !== undefined) cy.getSelect(this.form('role')).select(data.role);
    return this;
  }

  save(): this {
    cy.getButton(this.form('save')).click();
    return this;
  }

  create(data: UserInput): this {
    return this.openCreate().fillForm(data).save();
  }

  search(term: string): this {
    cy.getInput(this.sel('search')).clear({ force: true }).type(term, { force: true });
    return this;
  }

  private anyRow(): string {
    return '[data-testid^="cy-users-row-"]';
  }

  /** Elimina la fila que contiene el texto dado (seguro: nunca toca otras filas). */
  deleteByText(text: string): this {
    // Confirma que la búsqueda acotó el listado antes de borrar.
    cy.get(this.sel('list'), { timeout: 15000 }).should('contain', text);
    cy.contains(this.anyRow(), text).find('[data-testid$="-delete"]').click();
    return this;
  }

  // --- Aserciones ---

  shouldShowInList(text: string): this {
    cy.get(this.sel('list'), { timeout: 15000 }).should('contain', text);
    return this;
  }

  shouldNotShowInList(text: string): this {
    cy.contains('[data-testid^="cy-users-row-"]', text).should('not.exist');
    return this;
  }

  shouldShowToast(text?: string): this {
    const toast = cy.get(this.selRaw('toast')).should('be.visible');
    if (text) toast.and('contain', text);
    return this;
  }

  /** El formulario de creación sigue visible (validación nativa bloqueó submit). */
  shouldKeepFormOpen(): this {
    cy.get(this.form('email')).should('be.visible');
    return this;
  }
}
