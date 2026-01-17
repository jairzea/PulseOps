/**
 * ToastDemo - Componente de demostración del sistema de toast
 * 
 * Este componente muestra cómo utilizar el hook useToast en diferentes escenarios.
 * Puedes importar este componente temporalmente en cualquier página para probar los toasts.
 */
import React from 'react';
import { useToast } from '../hooks/useToast';

export const ToastDemo: React.FC = () => {
    const { success, error, warning, info } = useToast();

    return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">
                Demo del Sistema de Toast
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => success('¡Operación completada exitosamente!')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                     transition-colors duration-200 font-medium"
                >
                    Mostrar Success
                </button>

                <button
                    onClick={() => error('Ha ocurrido un error al procesar la solicitud')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                     transition-colors duration-200 font-medium"
                >
                    Mostrar Error
                </button>

                <button
                    onClick={() => warning('Ten cuidado con esta acción')}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg 
                     transition-colors duration-200 font-medium"
                >
                    Mostrar Warning
                </button>

                <button
                    onClick={() => info('Esta es una notificación informativa')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     transition-colors duration-200 font-medium"
                >
                    Mostrar Info
                </button>

                <button
                    onClick={() => success('Este toast dura 10 segundos', 10000)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                     transition-colors duration-200 font-medium"
                >
                    Success (10s)
                </button>

                <button
                    onClick={() => {
                        success('Primera notificación');
                        setTimeout(() => error('Segunda notificación'), 200);
                        setTimeout(() => warning('Tercera notificación'), 400);
                        setTimeout(() => info('Cuarta notificación'), 600);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg 
                     transition-colors duration-200 font-medium"
                >
                    Múltiples Toasts
                </button>
            </div>

            <div className="mt-6 p-4 bg-gray-900/50 rounded border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    Ejemplo de uso en código:
                </h4>
                <pre className="text-xs text-gray-400 overflow-x-auto">
                    {`import { useToast } from '../hooks/useToast';

function MyComponent() {
  const { success, error } = useToast();
  
  const handleSubmit = async () => {
    try {
      await saveData();
      success('Datos guardados correctamente');
    } catch (err) {
      error('Error al guardar los datos');
    }
  };
  
  return <button onClick={handleSubmit}>Guardar</button>;
}`}
                </pre>
            </div>
        </div>
    );
};
