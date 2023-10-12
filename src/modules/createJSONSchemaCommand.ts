import logger from '#/tools/logger';
import { CE_WORKER_ACTION } from '#/workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#/workers/interfaces/TMasterToWorkerMessage';
import type { TPickPassWorkerToMasterTaskComplete } from '#/workers/interfaces/TWorkerToMasterMessage';
import { chunk } from 'my-easy-fp';

const log = logger();

export default function createJSONSchemaCommand(
  size: number,
  exportedTypes: TPickPassWorkerToMasterTaskComplete<
    typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES
  >['data'],
) {
  log.trace(`worker-size: ${size}/ data-size: ${exportedTypes.length}`);

  // use `CREATE_JSON_SCHEMA` command
  if (size * 2 > exportedTypes.length) {
    log.trace(`using command > ${CE_WORKER_ACTION.CREATE_JSON_SCHEMA}`);

    return exportedTypes.map((exportedType) => {
      return {
        command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
        data: { exportedType: exportedType.identifier, filePath: exportedType.filePath },
      } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>;
    });
  }

  log.trace(`using command > ${CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK}`);

  // use `CREATE_JSON_SCHEMA_BULK` command
  const chunkSize = Math.ceil(exportedTypes.length / size);
  const exportedTypesChunks = chunk(exportedTypes, chunkSize);

  return exportedTypesChunks.map((exportedTypesChunk) => {
    return {
      command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK,
      data: exportedTypesChunk.map((exportedType) => ({
        exportedType: exportedType.identifier,
        filePath: exportedType.filePath,
      })),
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK>;
  });
}
