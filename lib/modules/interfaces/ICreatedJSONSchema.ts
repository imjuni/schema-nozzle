import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import { JSONSchema7 } from 'json-schema';

export default interface ICreatedJSONSchema {
  filePath: string;
  type: TEXPORTED_TYPE;
  schema: JSONSchema7;
  typeName: string;
}
