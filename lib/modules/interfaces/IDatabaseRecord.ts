import type ISchemaExportInfo from '@modules/interfaces/ISchemaExportInfo';
import type ISchemaImportInfo from '@modules/interfaces/ISchemaImportInfo';
import type { JSONSchema7 } from 'json-schema';

export default interface IDatabaseRecord {
  id: string;
  schema: string | JSONSchema7;
  filePath?: string;
  import: ISchemaImportInfo;
  export: ISchemaExportInfo;
  dto: boolean | string | string[];
}
