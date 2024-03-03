import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import type { Config } from 'ts-json-schema-generator';

export interface IDeleteSchemaOption extends IBaseOption {
  $kind: 'delete-schema';

  /** use checkbox with multiple selections */
  multiple: boolean;

  /** list of files to generate json-schema from */
  include: string[];

  /** List of files to exclude from the list of files to generate json-schema from */
  exclude: string[];

  /** ts-json-schema-generator option file path */
  generatorOption?: string | Config;
}

export type TDeleteSchemaOption = IDeleteSchemaOption &
  IBaseOption &
  IResolvedPaths & { generatorOptionObject: Config };
