import { BasePulseOpsPage } from './BasePulseOpsPage';
import { testTags } from '../../utils/testTags';
import type { ResourceInput } from '../../factories/resourceFactory';

/**
 * ResourcesPage - Page Object del CRUD de Recursos.
 *
 * Selecciona exclusivamente por `data-testid` (contextos `resources` y
 * `resource-form`); sin selectores por texto ni CSS. Delega en Widgets.
 */
export class ResourcesPage extends BasePulseOpsPage {
  constructor() {
    super('resources');
  }

  /** Selector dentro del formulario de recurso. */
  private form(...segments: string[]): string {
    return testTags.child('resource-form').selector(segments.join('-'));
  }

  visit(): this {
    cy.visit('/resources');
    // Espera a que la página cargue (el botón crear es estable y siempre presente).
    cy.get(this.sel('create'), { timeout: 20000 }).should('be.visible');
    return this;
  }

  openCreate(): this {
    cy.getButton(this.sel('create')).click();
    // Espera a que el formulario del modal esté listo antes de interactuar.
    cy.getInput(this.form('name')).should('be.visible');
    return this;
  }

  fillForm(data: Partial<ResourceInput>): this {
    if (data.name !== undefined) cy.getInput(this.form('name')).clear().type(data.name);
    if (data.roleType !== undefined) cy.getSelect(this.form('role-type')).select(data.roleType);
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

  cancel(): this {
    cy.getButton(this.form('cancel')).click();
    return this;
  }

  create(data: ResourceInput): this {
    return this.openCreate().fillForm(data).saveAndExpectToast();
  }

  search(term: string): this {
    // force: un toast transitorio puede solaparse momentáneamente con la búsqueda.
    cy.getInput(this.sel('search')).clear({ force: true }).type(term, { force: true });
    return this;
  }

  /** Selector de filas por prefijo de testid (independiente del id concreto). */
  private anyRow(): string {
    return '[data-testid^="cy-resources-row-"]';
  }

  /** Edita la primera fila visible (úsese tras `search` para acotar a una). */
  editFirstVisible(data: Partial<ResourceInput>): this {
    cy.get(this.anyRow()).first().find('[data-testid$="-edit"]').click();
    cy.getInput(this.form('name')).should('be.visible');
    this.fillForm(data);
    return this.saveAndExpectToast();
  }

  /** Elimina la primera fila visible (úsese tras `search` para acotar a una). */
  deleteFirstVisible(): this {
    cy.get(this.anyRow()).first().find('[data-testid$="-delete"]').click();
    cy.getButton(this.selRaw('confirm', 'accept')).click();
    return this;
  }

  editById(id: string, data: Partial<ResourceInput>): this {
    cy.getButton(this.sel('row', id, 'edit')).click();
    this.fillForm(data);
    return this.save();
  }

  deleteById(id: string): this {
    cy.getButton(this.sel('row', id, 'delete')).click();
    cy.getButton(this.selRaw('confirm', 'accept')).click();
    return this;
  }

  // --- Aserciones de alto nivel ---

  shouldShowInList(name: string): this {
    cy.get(this.sel('list'), { timeout: 15000 }).should('contain', name);
    return this;
  }

  /** Busca por nombre y verifica que aparece en el listado (acota a 1 fila). */
  searchAndShouldShow(name: string): this {
    return this.search(name).shouldShowInList(name);
  }

  shouldNotShowInList(name: string): this {
    // Tras eliminar el único match, la tabla puede no renderizarse (estado vacío).
    // Aserción robusta: ninguna fila contiene el nombre buscado.
    cy.contains('[data-testid^="cy-resources-row-"]', name).should('not.exist');
    return this;
  }

  shouldShowRow(id: string): this {
    cy.get(this.sel('row', id)).should('exist');
    return this;
  }

  shouldNotShowRow(id: string): this {
    cy.get(this.sel('row', id)).should('not.exist');
    return this;
  }

  shouldShowToast(text?: string): this {
    const toast = cy.get(this.selRaw('toast')).should('be.visible');
    if (text) toast.and('contain', text);
    return this;
  }

  shouldShowFormError(): this {
    cy.get(this.form('name-error')).should('be.visible');
    return this;
  }
}
