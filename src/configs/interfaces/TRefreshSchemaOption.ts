import type { CE_OUTPUT_FORMAT } from '#/configs/const-enum/CE_OUTPUT_FORMAT';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import type { Config } from 'ts-json-schema-generator';

interface IRefreshSchemaOption {
  discriminator: 'refresh-schema';

  /**
   * json-schema save format
   *
   * * json: json object
   * * string: plain string
   * * base64: plain string > base64
   * */
  format: CE_OUTPUT_FORMAT;

  include: string[];
  exclude: string[];

  /** specify the root folder within your schema path */
  rootDir?: string;

  /** Specify whether to include the DTO path in the schema ID */
  includePath?: boolean;

  /** ts-json-schema-generator option file path */
  generatorOption?: string | Config;

  /** truncate previous database file */
  truncate?: boolean;
}

export type TRefreshSchemaBaseOption = IRefreshSchemaOption & IBaseOption;

export type TRefreshSchemaOption = IRefreshSchemaOption &
  IBaseOption &
  IResolvedPaths & { generatorOptionObject: Config; files: string[] };
