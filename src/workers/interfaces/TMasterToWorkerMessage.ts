import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';

type TMasterToWorkerMessage =
  | { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }
  | {
      command: typeof CE_WORKER_ACTION.OPTION_LOAD;
      data: {
        option: TAddSchemaOption | TRefreshSchemaOption | TWatchSchemaOption;
        resolvedPaths: IResolvedPaths;
      };
    }
  | { command: typeof CE_WORKER_ACTION.PROJECT_DIAGONOSTIC }
  | { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES }
  | { command: typeof CE_WORKER_ACTION.LOAD_DATABASE }
  | {
      command: typeof CE_WORKER_ACTION.SCHEMA_FILE_FILTER_UPDATE;
      data: { schemaFiles: { origin: string; refined: string }[] };
    }
  | { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES }
  | { command: typeof CE_WORKER_ACTION.GENERATOR_OPTION_LOAD }
  | {
      command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA;
      data: { filePath: string; exportedType: string };
    }
  | {
      command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK;
      data: { filePath: string; exportedType: string }[];
    }
  | { command: typeof CE_WORKER_ACTION.NOOP }
  | { command: typeof CE_WORKER_ACTION.TERMINATE };

export type TPickMasterToWorkerMessage<T extends CE_WORKER_ACTION> = Extract<
  TMasterToWorkerMessage,
  { command: T }
>;

export default TMasterToWorkerMessage;
