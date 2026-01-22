/**
 * 🎓 EJEMPLOS DE USO - Widgets y TestTags
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar los widgets personalizados
 * y el sistema de TestTags en tus pruebas de Cypress.
 */

// ==========================================
// 📌 EJEMPLO 1: Uso Básico de Widgets
// ==========================================

import { ButtonWidget, InputWidget, CheckboxWidget } from '../support/widgets';

describe('Ejemplo 1: Widgets Básicos', () => {
  it('Debería usar widgets para interactuar con elementos', () => {
    cy.visit('https://example.cypress.io/commands/actions');

    // InputWidget - Escribir en un campo de texto
    const emailInput = new InputWidget('email-input');
    emailInput.type('test@example.com');
    emailInput.shouldHaveValue('test@example.com');

    // ButtonWidget - Hacer clic en un botón
    const submitButton = new ButtonWidget('submit-button');
    submitButton.shouldBeEnabled();
    submitButton.click();

    // CheckboxWidget - Marcar un checkbox
    const termsCheckbox = new CheckboxWidget('terms-checkbox');
    termsCheckbox.check();
    termsCheckbox.shouldBeChecked();
  });
});

// ==========================================
// 📌 EJEMPLO 2: TestTags Básicos
// ==========================================

import { TestTags } from '../support/utils/testTags';

describe('Ejemplo 2: TestTags Básicos', () => {
  it('Debería generar data-testids consistentes', () => {
    // Crear tags base
    const formTags = TestTags.create('login-form');

    // Generar IDs para elementos hijos
    const emailId = formTags.child('email').create();
    // Resultado: 'cy-login-form-email'

    const passwordId = formTags.child('password').create();
    // Resultado: 'cy-login-form-password'

    const submitId = formTags.child('submit-button').create();
    // Resultado: 'cy-login-form-submit-button'

    // Usar los IDs generados
    cy.get(`[data-testid="${emailId}"]`).type('user@example.com');
    cy.get(`[data-testid="${passwordId}"]`).type('password123');
    cy.get(`[data-testid="${submitId}"]`).click();
  });
});

// ==========================================
// 📌 EJEMPLO 3: TestTags Recursivos
// ==========================================

describe('Ejemplo 3: TestTags Recursivos', () => {
  it('Debería crear jerarquías anidadas de IDs', () => {
    const dashboardTags = TestTags.create('dashboard');

    // Crear tags anidados
    const sidebarTags = dashboardTags.child('sidebar');
    const navTags = sidebarTags.child('navigation');

    // Método recursivo - más limpio
    const menuItemId = navTags.recursive(['menu', 'item', 'home']);
    // Resultado: 'cy-dashboard-sidebar-navigation-menu-item-home'

    // Equivalente a:
    // dashboardTags.child('sidebar').child('navigation').child('menu').child('item').child('home').create()

    cy.get(`[data-testid="${menuItemId}"]`).click();
  });
});

// ==========================================
// 📌 EJEMPLO 4: TestTags con Estado
// ==========================================

describe('Ejemplo 4: TestTags con Estado', () => {
  it('Debería agregar estados a los IDs', () => {
    const buttonTags = TestTags.create('submit-button');

    // Estados del botón
    const normalState = buttonTags.create();
    // Resultado: 'cy-submit-button'

    const loadingState = buttonTags.withState('loading');
    // Resultado: 'cy-submit-button--loading'

    const disabledState = buttonTags.withState('disabled');
    // Resultado: 'cy-submit-button--disabled'

    const errorState = buttonTags.withState('error');
    // Resultado: 'cy-submit-button--error'

    // Verificar estados
    cy.get(`[data-testid="${normalState}"]`).should('be.visible');
    cy.get(`[data-testid="${loadingState}"]`).should('not.exist');
  });
});

// ==========================================
// 📌 EJEMPLO 5: TestTags Indexados (Listas)
// ==========================================

describe('Ejemplo 5: TestTags Indexados', () => {
  it('Debería manejar elementos en listas', () => {
    const listTags = TestTags.create('todo-list');

    // Generar IDs para ítems de lista
    const item0 = listTags.indexed('item', 0);
    // Resultado: 'cy-todo-list-item-0'

    const item1 = listTags.indexed('item', 1);
    // Resultado: 'cy-todo-list-item-1'

    const item2 = listTags.indexed('item', 2);
    // Resultado: 'cy-todo-list-item-2'

    // Iterar sobre ítems
    [0, 1, 2].forEach((index) => {
      const itemId = listTags.indexed('item', index);
      cy.get(`[data-testid="${itemId}"]`).should('be.visible');
    });
  });
});

// ==========================================
// 📌 EJEMPLO 6: Combinando Widgets y TestTags
// ==========================================

describe('Ejemplo 6: Widgets + TestTags Juntos', () => {
  it('Debería usar ambos para una experiencia óptima', () => {
    // Generar IDs con TestTags
    const formTags = TestTags.create('registration-form');
    const nameId = formTags.child('name-input').create();
    const emailId = formTags.child('email-input').create();
    const submitId = formTags.child('submit-button').create();

    // Usar Widgets con los IDs generados
    const nameInput = new InputWidget(nameId);
    const emailInput = new InputWidget(emailId);
    const submitButton = new ButtonWidget(submitId);

    // Interactuar
    nameInput.type('Juan Pérez');
    nameInput.shouldHaveValue('Juan Pérez');

    emailInput.type('juan@example.com');
    emailInput.shouldHaveValue('juan@example.com');

    submitButton.waitAndClick();
  });
});

// ==========================================
// 📌 EJEMPLO 7: Page Object con Widgets
// ==========================================

class LoginPage {
  private formTags = TestTags.create('login-form');

  visit() {
    cy.visit('/login');
  }

  fillEmail(email: string) {
    const emailInput = new InputWidget(this.formTags.child('email').create());
    emailInput.type(email);
  }

  fillPassword(password: string) {
    const passwordInput = new InputWidget(this.formTags.child('password').create());
    passwordInput.type(password);
  }

  rememberMe() {
    const rememberCheckbox = new CheckboxWidget(this.formTags.child('remember-me').create());
    rememberCheckbox.check();
  }

  submit() {
    const submitButton = new ButtonWidget(this.formTags.child('submit').create());
    submitButton.click();
  }

  login(email: string, password: string, remember = false) {
    this.fillEmail(email);
    this.fillPassword(password);
    if (remember) this.rememberMe();
    this.submit();
  }
}

describe('Ejemplo 7: Page Object Pattern', () => {
  it('Debería usar Page Object con widgets', () => {
    const loginPage = new LoginPage();
    loginPage.visit();
    loginPage.login('admin@example.com', 'password123', true);
  });
});

// ==========================================
// 📌 EJEMPLO 8: Métodos Avanzados de Widgets
// ==========================================

describe('Ejemplo 8: Métodos Avanzados', () => {
  it('InputWidget - Métodos avanzados', () => {
    const input = new InputWidget('advanced-input');

    // Escribir lentamente (como usuario real)
    input.typeSlowly('Hola Mundo', 100); // 100ms delay entre teclas

    // Presionar teclas especiales
    input.pressKey('enter');
    input.pressKey('backspace');
    input.pressKey('esc');

    // Focus y blur
    input.focus();
    input.shouldBeFocused();
    input.blur();
  });

  it('ButtonWidget - Métodos avanzados', () => {
    const button = new ButtonWidget('advanced-button');

    // Hacer clic solo si está habilitado
    button.clickIfEnabled();

    // Esperar a que esté habilitado y hacer clic
    button.waitAndClick(5000); // timeout de 5 segundos

    // Doble clic
    button.doubleClick();

    // Verificaciones
    button.shouldContainText('Enviar');
    button.shouldHaveText('Enviar Formulario');
  });

  it('CheckboxWidget - Métodos avanzados', () => {
    const checkbox = new CheckboxWidget('advanced-checkbox');

    // Marcar solo si no está marcado
    checkbox.checkIfNotChecked();

    // Alternar estado
    checkbox.toggle(); // desmarca
    checkbox.toggle(); // marca

    // Obtener estado actual
    checkbox.isChecked().then((isChecked) => {
      if (isChecked) {
        cy.log('✅ Checkbox está marcado');
      } else {
        cy.log('❌ Checkbox NO está marcado');
      }
    });
  });
});

// ==========================================
// 📌 EJEMPLO 9: TestTags con Configuración Personalizada
// ==========================================

describe('Ejemplo 9: Configuración Personalizada de TestTags', () => {
  it('Debería permitir prefijos y separadores personalizados', () => {
    // Configuración por defecto: prefix='cy', separator='-'
    const defaultTags = TestTags.create('button');
    defaultTags.create(); // 'cy-button'

    // Configuración personalizada
    const customTags = TestTags.create('button', 'test', '_');
    customTags.create(); // 'test_button'

    const qaMaticTags = TestTags.create('element', 'qa', '.');
    qaMaticTags.child('input').create(); // 'qa.element.input'
  });
});

// ==========================================
// 📌 EJEMPLO 10: Selectores CSS con TestTags
// ==========================================

describe('Ejemplo 10: Generar Selectores CSS', () => {
  it('Debería generar selectores CSS automáticamente', () => {
    const tags = TestTags.create('form');

    // Método selector() retorna el selector completo
    const emailSelector = tags.child('email').selector();
    // Resultado: '[data-testid="cy-form-email"]'

    // Usar directamente con cy.get()
    cy.get(emailSelector).type('test@example.com');

    // O con widgets
    const emailInput = new InputWidget('form-email');
    // Internamente usa: cy.get('[data-testid="cy-form-email"]')
  });
});

// ==========================================
// 📌 EJEMPLO 11: Data-Driven Testing con Fixtures
// ==========================================

describe('Ejemplo 11: Data-Driven Testing', () => {
  before(() => {
    cy.fixture('formData').as('testData');
  });

  it('Debería usar datos de fixture', function () {
    const { validUser } = this.testData;

    const formTags = TestTags.create('form');
    const nameInput = new InputWidget(formTags.child('name').create());
    const emailInput = new InputWidget(formTags.child('email').create());
    const ageInput = new InputWidget(formTags.child('age').create());

    nameInput.type(validUser.name);
    emailInput.type(validUser.email);
    ageInput.type(validUser.age);
  });

  it('Debería probar múltiples usuarios inválidos', function () {
    const { invalidUsers } = this.testData;

    invalidUsers.forEach((invalidUser, index) => {
      cy.log(`Probando usuario inválido #${index + 1}`);

      const emailInput = new InputWidget('email');
      emailInput.type(invalidUser.email);

      // Verificar error esperado
      cy.contains(invalidUser.expectedErrors.email).should('be.visible');
    });
  });
});

// ==========================================
// 📌 EJEMPLO 12: Composición de Widgets
// ==========================================

class FormWidget {
  private tags: TestTags;

  constructor(formId: string) {
    this.tags = TestTags.create(formId);
  }

  getInput(name: string) {
    return new InputWidget(this.tags.child(`${name}-input`).create());
  }

  getButton(name: string) {
    return new ButtonWidget(this.tags.child(`${name}-button`).create());
  }

  getCheckbox(name: string) {
    return new CheckboxWidget(this.tags.child(`${name}-checkbox`).create());
  }

  fillField(fieldName: string, value: string) {
    this.getInput(fieldName).type(value);
  }

  submit() {
    this.getButton('submit').click();
  }
}

describe('Ejemplo 12: Composición de Widgets', () => {
  it('Debería usar un FormWidget compuesto', () => {
    const registrationForm = new FormWidget('registration-form');

    registrationForm.fillField('name', 'Juan Pérez');
    registrationForm.fillField('email', 'juan@example.com');
    registrationForm.fillField('age', '30');
    registrationForm.getCheckbox('terms').check();
    registrationForm.submit();
  });
});

// ==========================================
// 💡 CONSEJOS Y MEJORES PRÁCTICAS
// ==========================================

/**
 * ✅ DO's (Hacer):
 * 
 * 1. Usar TestTags para generar IDs consistentes
 * 2. Usar Widgets para encapsular interacciones
 * 3. Crear Page Objects para abstraer páginas
 * 4. Combinar Widgets + TestTags + Page Objects
 * 5. Usar fixtures para datos de prueba
 * 6. Escribir IDs descriptivos y legibles
 * 7. Mantener jerarquías de IDs lógicas
 * 8. Reutilizar widgets en múltiples tests
 * 9. Documentar métodos personalizados
 * 10. Usar TypeScript para type safety
 * 
 * ❌ DON'Ts (Evitar):
 * 
 * 1. NO usar selectores CSS frágiles (.class-123)
 * 2. NO repetir lógica de interacción en cada test
 * 3. NO hardcodear IDs en múltiples lugares
 * 4. NO usar cy.wait() con tiempos fijos
 * 5. NO mezclar lógica de UI con lógica de test
 * 6. NO crear IDs demasiado largos o complejos
 * 7. NO olvidar assertions después de acciones
 * 8. NO usar selectores por estructura DOM
 * 9. NO ignorar errores de TypeScript
 * 10. NO saltarse validaciones en tests
 */

// ==========================================
// 🎯 PLANTILLA PARA NUEVOS TESTS
// ==========================================

/**
 * Plantilla recomendada para crear nuevos tests:
 */

/*
import { ButtonWidget, InputWidget, CheckboxWidget } from '../support/widgets';
import { TestTags } from '../support/utils/testTags';

describe('Nombre del Feature', () => {
  const pageTags = TestTags.create('page-name');

  beforeEach(() => {
    cy.visit('/url');
  });

  it('Debería realizar acción específica', () => {
    // Arrange (Preparar)
    const inputWidget = new InputWidget(pageTags.child('input').create());
    const buttonWidget = new ButtonWidget(pageTags.child('button').create());

    // Act (Actuar)
    inputWidget.type('valor');
    buttonWidget.click();

    // Assert (Verificar)
    inputWidget.shouldHaveValue('valor');
    cy.url().should('include', '/success');
  });
});
*/

export {};
