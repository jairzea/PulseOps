/**
 * User interface para requests autenticados
 */
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}
