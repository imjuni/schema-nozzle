import type { AnySchemaObject } from 'ajv';

export interface IDatabaseItem {
  id: string;
  schema: string | AnySchemaObject;
  filePath?: string;
  $ref: string[];
}
