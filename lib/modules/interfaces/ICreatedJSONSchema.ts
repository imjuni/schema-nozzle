import type { JSONSchema7 } from 'json-schema';

export default interface ICreatedJSONSchema {
  filePath: string;
  schema: JSONSchema7;
  typeName: string;
}
