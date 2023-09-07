import type { JSONSchema7 } from 'json-schema';
import type ISchemaExportInfo from 'src/modules/interfaces/ISchemaExportInfo';
import type ISchemaImportInfo from 'src/modules/interfaces/ISchemaImportInfo';

export default interface IDatabaseItem {
  id: string;
  schema: string | JSONSchema7;
  filePath?: string;
  dependency: {
    import: ISchemaImportInfo;
    export: ISchemaExportInfo;
  };
}
