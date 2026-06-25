import { faker } from '@faker-js/faker'; // prerequisito: npm i -D @faker-js/faker

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export const makeUser = (over: Partial<UserInput> = {}): UserInput => {
  const suffix = faker.string.alphanumeric(8).toLowerCase(); // sufijo único por corrida
  return {
    name: `${faker.person.fullName()} ${suffix}`,
    email: `e2e.${suffix}@pulseops.test`,
    password: 'Test1234!',
    role: 'user',
    ...over,
  };
};
