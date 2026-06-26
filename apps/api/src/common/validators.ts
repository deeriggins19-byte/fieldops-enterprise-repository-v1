export function requiredString(input: any, field: string) {
  const value = input?.[field];
  if (!value || typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

export function optionalString(input: any, field: string) {
  const value = input?.[field];
  if (value === undefined || value === null || value === '') return undefined;
  return String(value).trim();
}

export function optionalNumber(input: any, field: string, fallback = 0) {
  const value = input?.[field];
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) throw new Error(`${field} must be a number`);
  return parsed;
}
