import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import type { Config } from 'ts-json-schema-generator';

interface IRefreshSchemaOption {
  $kind: 'refresh-schema';

  /** list of files to generate json-schema from */
  include: string[];

  /** List of files to exclude from the list of files to generate json-schema from */
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
