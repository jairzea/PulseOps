import { faker } from '@faker-js/faker'; // prerequisito: npm i -D @faker-js/faker

export interface RecordInput {
  resourceId: string;
  metricKey: string;
  week: string;
  value: number;
}

export const makeRecord = (over: Partial<RecordInput> = {}): RecordInput => ({
  resourceId: '', // se asocia en tiempo de test
  metricKey: '', // se asocia en tiempo de test
  week: `2026-W${faker.number.int({ min: 10, max: 52 })}`, // ISO week plausible
  value: faker.number.int({ min: 1, max: 1000 }),
  ...over,
});
