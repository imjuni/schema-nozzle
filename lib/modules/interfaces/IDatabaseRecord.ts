// import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import ISchemaExportInfo from '@modules/interfaces/ISchemaExportInfo';
import ISchemaImportInfo from '@modules/interfaces/ISchemaImportInfo';
import { JSONSchema7 } from 'json-schema';

export default interface IDatabaseRecord {
  id: string;
  schema: string;
  import: ISchemaImportInfo[];
  export: ISchemaExportInfo[];
  schemaobj: JSONSchema7;
  // type: TEXPORTED_TYPE;
  banner?: string;
}
