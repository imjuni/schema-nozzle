import type ISchemaExportInfo from '#/modules/interfaces/ISchemaExportInfo';
import type ISchemaImportInfo from '#/modules/interfaces/ISchemaImportInfo';
import type { AnySchemaObject } from 'ajv';

export default interface IDatabaseItem {
  id: string;
  schema: string | AnySchemaObject;
  filePath?: string;
  dependency: {
    import: ISchemaImportInfo;
    export: ISchemaExportInfo;
  };
}
