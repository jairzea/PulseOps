import { faker } from '@faker-js/faker'; // prerequisito: npm i -D @faker-js/faker

export interface ResourceInput {
  name: string;
  roleType: 'DEV' | 'TL' | 'OTHER';
}

export const makeResource = (over: Partial<ResourceInput> = {}): ResourceInput => ({
  name: `${faker.person.fullName()} ${faker.string.alphanumeric(5)}`, // sufijo único por corrida
  roleType: faker.helpers.arrayElement(['DEV', 'TL', 'OTHER']),
  ...over,
});
