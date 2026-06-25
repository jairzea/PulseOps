import { faker } from '@faker-js/faker'; // prerequisito: npm i -D @faker-js/faker

export interface MetricInput {
  key: string;
  label: string;
  unit: string;
  periodType: 'weekly';
}

export const makeMetric = (over: Partial<MetricInput> = {}): MetricInput => {
  const suffix = faker.string.alphanumeric(5).toLowerCase(); // sufijo único por corrida
  return {
    key: `metric_${suffix}`, // clave válida: minúsculas + guion bajo
    label: `${faker.commerce.productName()} ${suffix}`,
    unit: 'count',
    periodType: 'weekly',
    ...over,
  };
};
