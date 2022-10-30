// import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import ISchemaExportInfo from '@modules/interfaces/ISchemaExportInfo';
import ISchemaImportInfo from '@modules/interfaces/ISchemaImportInfo';

export default interface IDatabaseRecord {
  id: string;
  schema: string;
  filePath: string;
  import: ISchemaImportInfo;
  export: ISchemaExportInfo;
  dto: boolean;
  // type: TEXPORTED_TYPE;
}
