import type { AnySchemaObject } from 'ajv';

export interface ISchemaRecord {
  /** sha256 hash. hash generated from filePath with typeName */
  id: string;

  /** json-schema */
  schema: AnySchemaObject;

  /** TypeScript type name that was used to generate schema */
  typeName: string;

  /** file path where schema was generated */
  filePath?: string;

  relativePath?: string;
}
