import type { AnySchemaObject } from 'ajv';

export function getDefs(schema: AnySchemaObject) {
  const definitions = schema.definitions as AnySchemaObject | null | undefined;

  if (definitions != null) {
    const schemas = Object.entries<AnySchemaObject>(definitions).map(([key, value]) => ({
      key,
      value,
    }));

    return schemas.length > 0 ? schemas : undefined;
  }

  const defs = schema.$defs as AnySchemaObject | null | undefined;

  if (defs != null) {
    const schemas = Object.entries<AnySchemaObject>(defs).map(([key, value]) => ({
      key,
      value,
    }));

    return schemas.length > 0 ? schemas : undefined;
  }

  return undefined;
}
