import type { CE_OUTPUT_FORMAT } from '#configs/interfaces/CE_OUTPUT_FORMAT';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type * as tjsg from 'ts-json-schema-generator';

export interface IAddSchemaOption {
  discriminator: 'add-schema';

  /** input filename */
  files: string[];

  /** use checkbox with multiple selections */
  multiple: boolean;

  /** ts-json-schema-generator option file path */
  generatorOption?: string | tjsg.Config;

  /** target list filename */
  listFile?: string;

  /**
   * json-schema save format
   * * json: json object
   * * string: plain string
   * * base64: plain string > base64
   * */
  format: CE_OUTPUT_FORMAT;
}

export type TAddSchemaBaseOption = IAddSchemaOption & IBaseOption;

type TAddSchemaOption = IAddSchemaOption &
  IBaseOption &
  IResolvedPaths & { generatorOptionObject: tjsg.Config };

export default TAddSchemaOption;
