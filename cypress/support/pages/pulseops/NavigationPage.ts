import { BasePulseOpsPage } from './BasePulseOpsPage';

/** Módulos navegables desde el menú principal (mapean a su ruta). */
export type NavModule = 'dashboard' | 'resources' | 'metrics' | 'records' | 'configuration' | 'users';

/** Ruta de cada módulo navegable (el dashboard vive en la raíz). */
const MODULE_URL: Record<NavModule, string> = {
  dashboard: '/',
  resources: '/resources',
  metrics: '/metrics',
  records: '/records',
  configuration: '/configuration',
  users: '/users',
};

/**
 * NavigationPage - Page Object de la navegación global de PulseOps.
 *
 * Encapsula el menú de 3 puntos (módulos) y el menú de avatar (perfil/logout)
 * del `Header`. Selecciona exclusivamente por `data-testid` globales (`cy-nav-*`);
 * sin selectores por texto ni CSS. Todos los items de navegación son `<button>`,
 * por lo que se usa `cy.getButton`.
 *
 * ponytail: un único POM enfocado, reutilizado por los steps de todos los módulos.
 */
export class NavigationPage extends BasePulseOpsPage {
  constructor() {
    super('nav');
  }

  /** Abre el menú de módulos (3 puntos). */
  openMenu(): this {
    cy.getButton(this.sel('menu-toggle')).click();
    return this;
  }

  /** Abre el menú de usuario (avatar). */
  openUserMenu(): this {
    cy.getButton(this.sel('user-toggle')).click();
    return this;
  }

  /** Navega a un módulo abriendo el menú y verifica que la URL refleja la ruta. */
  goTo(module: NavModule): this {
    this.openMenu();
    cy.getButton(this.sel(module)).click();
    cy.url().should('include', MODULE_URL[module]);
    return this;
  }

  /** Verifica que la URL actual corresponde al módulo dado. */
  shouldBeOn(module: NavModule): this {
    cy.url().should('include', MODULE_URL[module]);
    return this;
  }

  /** Abre el perfil desde el menú de usuario. */
  goToProfile(): this {
    this.openUserMenu();
    cy.getButton(this.sel('profile')).click();
    cy.url().should('include', '/profile');
    return this;
  }

  /** Cierra sesión desde el menú de usuario y espera la vista de login (Req 3.5). */
  logout(): this {
    this.openUserMenu();
    cy.getButton(this.sel('logout')).click();
    cy.url({ timeout: 20000 }).should('include', '/login');
    return this;
  }
}
