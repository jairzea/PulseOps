import type {
  AnalysisConfiguration,
  BusinessRule,
  ConditionThresholds,
} from '@pulseops/shared-types';

const API_URL = 'http://localhost:3000';

/**
 * Servicio para gestión de configuraciones de análisis
 */
export const configurationApi = {
  // ==================== CONFIGURACIONES ====================

  /**
   * Crear nueva configuración de análisis
   */
  async createConfiguration(data: {
    name: string;
    description?: string;
    thresholds: ConditionThresholds;
    isActive?: boolean;
  }): Promise<AnalysisConfiguration> {
    try {
      const response = await fetch(`${API_URL}/configuration/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener todas las configuraciones
   */
  async getAllConfigurations(): Promise<AnalysisConfiguration[]> {
    try {
      const response = await fetch(`${API_URL}/configuration/analysis`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener configuración activa
   */
  async getActiveConfiguration(): Promise<AnalysisConfiguration> {
    try {
      const response = await fetch(`${API_URL}/configuration/analysis/active`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener configuración por ID
   */
  async getConfigurationById(id: string): Promise<AnalysisConfiguration> {
    try {
      const response = await fetch(`${API_URL}/configuration/analysis/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar configuración
   */
  async updateConfiguration(
    id: string,
    data: {
      name?: string;
      description?: string;
      thresholds?: ConditionThresholds;
      isActive?: boolean;
    },
  ): Promise<AnalysisConfiguration> {
    try {
      const response = await fetch(`${API_URL}/configuration/analysis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar configuración
   */
  async deleteConfiguration(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/configuration/analysis/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Activar configuración específica
   */
  async activateConfiguration(id: string): Promise<AnalysisConfiguration> {
    try {
      const response = await fetch(
        `${API_URL}/configuration/analysis/${id}/activate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  // ==================== REGLAS ====================

  /**
   * Crear nueva regla de negocio
   */
  async createRule(data: Partial<BusinessRule>): Promise<BusinessRule> {
    try {
      const response = await fetch(`${API_URL}/configuration/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener todas las reglas
   */
  async getAllRules(): Promise<BusinessRule[]> {
    try {
      const response = await fetch(`${API_URL}/configuration/rules`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener solo reglas activas
   */
  async getActiveRules(): Promise<BusinessRule[]> {
    try {
      const response = await fetch(`${API_URL}/configuration/rules/active`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener regla por ID
   */
  async getRuleById(id: string): Promise<BusinessRule> {
    try {
      const response = await fetch(`${API_URL}/configuration/rules/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener historial de versiones de una regla
   */
  async getRuleVersions(id: string): Promise<BusinessRule[]> {
    try {
      const response = await fetch(
        `${API_URL}/configuration/rules/${id}/versions`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar regla (crea nueva versión)
   */
  async updateRule(
    id: string,
    data: Partial<BusinessRule>,
  ): Promise<BusinessRule> {
    try {
      const response = await fetch(`${API_URL}/configuration/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar regla (soft delete)
   */
  async deleteRule(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/configuration/rules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar permanentemente
   */
  async permanentlyDeleteRule(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_URL}/configuration/rules/${id}/permanent`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Activar/desactivar regla
   */
  async toggleRuleStatus(id: string, isActive: boolean): Promise<BusinessRule> {
    try {
      const response = await fetch(
        `${API_URL}/configuration/rules/${id}/toggle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },
};
