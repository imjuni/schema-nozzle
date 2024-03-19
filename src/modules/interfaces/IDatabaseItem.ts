import type { AnySchemaObject } from 'ajv';

export interface IDatabaseItem {
  id: string;
  schema: string | AnySchemaObject;
  rawSchema: string;
  typeName: string;
  filePath?: string;
  $ref: string[];
}
