import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type readGeneratorOption from '#configs/readGeneratorOption';
import type IFileWithType from '#modules/interfaces/IFileWithType';
import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { AsyncReturnType } from 'type-fest';

type TMasterToWorkerMessage =
  | {
      command: 'job';
      data: {
        resolvedPaths: IResolvedPaths;
        generatorOption: AsyncReturnType<typeof readGeneratorOption>;
        option: TAddSchemaOption | TRefreshSchemaOption;
        fileWithTypes: IFileWithType;
      };
    }
  | { command: typeof CE_WORKER_ACTION.PROJECT_LOAD; data: { project: string } }
  | { command: typeof CE_WORKER_ACTION.NOOP; data: undefined }
  | { command: 'start'; data: undefined }
  | { command: 'end'; data: undefined };

export default TMasterToWorkerMessage;
