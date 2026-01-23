/**
 * 🏷️ TestTags Utility - Sistema Recursivo de Identificación de Elementos
 * 
 * Este utility proporciona un sistema robusto y recursivo para generar y gestionar
 * data-testid en elementos HTML/React, facilitando la identificación única de elementos
 * en pruebas E2E con Cypress.
 * 
 * Características:
 * - Generación recursiva de test IDs para jerarquías de componentes
 * - Nomenclatura consistente y legible
 * - Soporte para componentes dinámicos y anidados
 * - Type-safe con TypeScript
 * 
 * @module TestTags
 */

export type TestTagConfig = {
  prefix?: string;
  separator?: string;
  caseSensitive?: boolean;
};

const DEFAULT_CONFIG: Required<TestTagConfig> = {
  prefix: 'cy',
  separator: '-',
  caseSensitive: false,
};

/**
 * Clase principal para gestionar TestTags de forma recursiva
 */
export class TestTags {
  private config: Required<TestTagConfig>;
  private parentPath: string[];

  constructor(config: TestTagConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.parentPath = [];
  }

  /**
   * Normaliza un string para usarlo como test ID
   */
  private normalize(value: string): string {
    const normalized = value
      .trim()
      .replace(/\s+/g, this.config.separator)
      .replace(/[^a-zA-Z0-9-_]/g, '');
    
    return this.config.caseSensitive ? normalized : normalized.toLowerCase();
  }

  /**
   * Construye el path completo del test ID
   */
  private buildPath(segments: string[]): string {
    const allSegments = [this.config.prefix, ...this.parentPath, ...segments];
    return allSegments.filter(Boolean).join(this.config.separator);
  }

  /**
   * Genera un test ID simple
   * 
   * @example
   * testTags.create('submit-button')
   * // => 'cy-submit-button'
   */
  create(name: string): string {
    return this.buildPath([this.normalize(name)]);
  }

  /**
   * Crea un contexto anidado (child) para generación recursiva de test IDs
   * 
   * @example
   * const formTags = testTags.child('login-form');
   * formTags.create('email-input') // => 'cy-login-form-email-input'
   */
  child(contextName: string): TestTags {
    const child = new TestTags(this.config);
    child.parentPath = [...this.parentPath, this.normalize(contextName)];
    return child;
  }

  /**
   * Genera test IDs para un array de elementos
   * 
   * @example
   * testTags.list('menu-item', 3)
   * // => ['cy-menu-item-0', 'cy-menu-item-1', 'cy-menu-item-2']
   */
  list(baseName: string, count: number): string[] {
    const normalized = this.normalize(baseName);
    return Array.from({ length: count }, (_, i) => 
      this.buildPath([normalized, String(i)])
    );
  }

  /**
   * Genera un test ID con estado
   * 
   * @example
   * testTags.withState('checkbox', 'checked')
   * // => 'cy-checkbox-checked'
   */
  withState(elementName: string, state: string): string {
    return this.buildPath([
      this.normalize(elementName),
      this.normalize(state)
    ]);
  }

  /**
   * Genera un test ID para un elemento con índice
   * 
   * @example
   * testTags.indexed('item', 0)
   * // => 'cy-item-0'
   */
  indexed(baseName: string, index: number): string {
    return this.buildPath([this.normalize(baseName), String(index)]);
  }

  /**
   * Crea un selector Cypress a partir de un test ID
   * 
   * @example
   * testTags.selector('submit-button')
   * // => '[data-testid="cy-submit-button"]'
   */
  selector(name: string): string {
    return `[data-testid="${this.create(name)}"]`;
  }

  /**
   * Retorna el test ID actual completo (útil para debugging)
   */
  getCurrentPath(): string {
    return this.buildPath([]);
  }

  /**
   * Genera un objeto con test IDs para múltiples elementos
   * 
   * @example
   * testTags.group({
   *   submit: 'submit-button',
   *   cancel: 'cancel-button'
   * })
   * // => { submit: 'cy-submit-button', cancel: 'cy-cancel-button' }
   */
  group<T extends Record<string, string>>(elements: T): Record<keyof T, string> {
    const result: any = {};
    for (const [key, value] of Object.entries(elements)) {
      result[key] = this.create(value);
    }
    return result;
  }

  /**
   * Método recursivo para generar estructura completa de test IDs
   * Útil para componentes complejos con múltiples niveles de anidamiento
   * 
   * @example
   * testTags.recursive({
   *   name: 'form',
   *   children: {
   *     email: 'email-input',
   *     password: 'password-input',
   *     actions: {
   *       name: 'actions',
   *       children: {
   *         submit: 'submit-btn',
   *         cancel: 'cancel-btn'
   *       }
   *     }
   *   }
   * })
   * // =>
   * // {
   * //   form: 'cy-form',
   * //   'form.email': 'cy-form-email-input',
   * //   'form.password': 'cy-form-password-input',
   * //   'form.actions': 'cy-form-actions',
   * //   'form.actions.submit': 'cy-form-actions-submit-btn',
   * //   'form.actions.cancel': 'cy-form-actions-cancel-btn'
   * // }
   */
  recursive(
    structure: {
      name: string;
      children?: Record<string, string | any>;
    },
    parentKey: string = ''
  ): Record<string, string> {
    const result: Record<string, string> = {};
    const currentKey = parentKey ? `${parentKey}.${structure.name}` : structure.name;
    
    // Add current element
    const childContext = parentKey ? this.child(structure.name) : this;
    result[currentKey] = childContext.create(structure.name);
    
    // Process children recursively
    if (structure.children) {
      for (const [childKey, childValue] of Object.entries(structure.children)) {
        if (typeof childValue === 'string') {
          // Simple child
          result[`${currentKey}.${childKey}`] = childContext.create(childValue);
        } else if (childValue && typeof childValue === 'object' && childValue.name) {
          // Nested structure
          const nestedResults = childContext.recursive(childValue, currentKey);
          Object.assign(result, nestedResults);
        }
      }
    }
    
    return result;
  }
}

/**
 * Instancia global de TestTags con configuración por defecto
 */
export const testTags = new TestTags();

/**
 * Helper para crear test IDs con prefijo personalizado
 */
export const createTestTags = (prefix: string): TestTags => {
  return new TestTags({ prefix });
};

/**
 * Decorator para añadir automáticamente data-testid a componentes React
 * 
 * @example
 * @WithTestId('submit-button')
 * class SubmitButton extends React.Component { ... }
 */
export function WithTestId(testId: string) {
  return function (target: any) {
    const originalRender = target.prototype.render;
    target.prototype.render = function (...args: any[]) {
      const element = originalRender.apply(this, args);
      if (element && element.props) {
        return {
          ...element,
          props: {
            ...element.props,
            'data-testid': testId,
          },
        };
      }
      return element;
    };
    return target;
  };
}

export default testTags;
