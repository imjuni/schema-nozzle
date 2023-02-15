import type ISchemaExportInfo from '#modules/interfaces/ISchemaExportInfo';
import type ISchemaImportInfo from '#modules/interfaces/ISchemaImportInfo';
import type { JSONSchema7 } from 'json-schema';

export default interface IDatabaseItem {
  id: string;
  schema: string | JSONSchema7;
  filePath?: string;
  dependency: {
    import: ISchemaImportInfo;
    export: ISchemaExportInfo;
  };
}
