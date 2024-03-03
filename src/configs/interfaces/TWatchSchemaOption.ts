import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import type { Config } from 'ts-json-schema-generator';

interface IWatchSchemaOption {
  $kind: 'watch-schema';

  /** specify the root folder within your schema path */
  rootDir?: string;

  /** watch debounce time: default 500ms */
  debounceTime: number;

  /** ts-json-schema-generator option file path */
  generatorOption?: string | Config;

  /** ts-json-schema-generator timeout: default 90 seconds */
  generatorTimeout: number;
}

export type TWatchSchemaBaseOption = IWatchSchemaOption & IBaseOption;

export type TWatchSchemaOption = IWatchSchemaOption &
  IBaseOption &
  IResolvedPaths & { generatorOptionObject: Config; files: string[] };
