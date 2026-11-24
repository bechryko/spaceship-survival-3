export type Schema =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | { [key: string]: Schema }
  | [Schema]
  | unknown[];

export function validateJSON(json: string, schema: Schema): boolean {
  try {
    return validate(JSON.parse(json), schema);
  } catch (error) {
    console.warn('Failed parsing JSON', error);
    return false;
  }
}

function validate(value: unknown, schema: Schema): boolean {
  if (typeof schema === 'string') {
    switch (schema) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && Number.isFinite(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return value !== null && typeof value === 'object' && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
    }
  }

  if (Array.isArray(schema)) {
    // Array schema: [itemSchema]
    if (schema.length === 1) {
      return Array.isArray(value) && schema.length === 1 && value.every(item => validate(item, schema[0] as Schema));
    }

    // Permitted values schema: unknown[]
    return (schema as unknown[]).includes(value);
  }

  // Object schema
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (Object.keys(obj).some(key => !(key in schema))) {
    return false;
  }

  for (const key in schema) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }

    if (!validate(obj[key], schema[key])) {
      return false;
    }
  }

  return true;
}
