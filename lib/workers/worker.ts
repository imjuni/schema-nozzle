/* eslint-disable @typescript-eslint/no-misused-promises */
import getTsProject from '#compilers/getTsProject';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type readGeneratorOption from '#configs/readGeneratorOption';
import createJSONSchema from '#modules/createJSONSchema';
import createSchemaRecord from '#modules/createSchemaRecord';
import type IFileWithType from '#modules/interfaces/IFileWithType';
import logger from '#tools/logger';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import NozzleEmitter from '#workers/NozzleEmitter';
import { isError } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import path from 'path';
import type { AsyncReturnType } from 'type-fest';

const log = logger();

export default async function worker2() {
  const typeInfos: IFileWithType[] = [];
  const emitter: NozzleEmitter = new NozzleEmitter();

  let resolvedPaths: IResolvedPaths;
  let generatorOption: AsyncReturnType<typeof readGeneratorOption>;
  let option: TAddSchemaOption | TRefreshSchemaOption;

  process.on('SIGTERM', () => process.exit(0));

  process.on('message', async (payload: TMasterToWorkerMessage) => {
    emitter.emit(payload.command, payload.data);

    if (payload.command === 'job') {
      typeInfos.push(payload.data.fileWithTypes);
      generatorOption = payload.data.generatorOption;
      resolvedPaths = payload.data.resolvedPaths;
      option = payload.data.option;
    }

    if (payload.command === 'end') {
      process.exit();
    }

    if (payload.command === 'start') {
      try {
        const killmeUpload: TWorkerToMasterMessage = { command: 'kill-me' };

        if (typeInfos.length <= 0) {
          process.send?.(killmeUpload);
          return;
        }

        const basePath = await getDirname(resolvedPaths.project);
        const project = await getTsProject({
          tsConfigFilePath: resolvedPaths.project,
          skipAddingFilesFromTsConfig: false,
          skipFileDependencyResolution: true,
          skipLoadingLibFiles: true,
        });

        if (project.type === 'fail') {
          process.send?.(killmeUpload);
          return;
        }

        await Promise.all(
          typeInfos.map(async (typeInfo) => {
            const schema = createJSONSchema({
              option,
              schemaConfig: generatorOption,
              filePath: typeInfo.filePath,
              typeName: typeInfo.typeName,
            });

            if (schema.type === 'fail') {
              const message: TWorkerToMasterMessage = {
                command: 'message',
                data: `Error: ${typeInfo.typeName} - ${schema.fail.message}`,
                channel: 'fail',
              };

              process.send?.(message);
              return;
            }

            const record = await createSchemaRecord({
              option,
              project: project.pass,
              resolvedPaths,
              metadata: schema.pass,
            });

            const records = [record.record, ...(record.definitions ?? [])];

            const recordsUpload: TWorkerToMasterMessage = { command: 'record', data: records };
            const messageUpload: TWorkerToMasterMessage = {
              command: 'message',
              data: `Success: ${schema.pass.typeName} - ${path.relative(
                basePath,
                schema.pass.filePath,
              )}`,
            };

            process.send?.(recordsUpload);
            process.send?.(messageUpload);
          }),
        );

        process.send?.(killmeUpload);
      } catch (catched) {
        const err = isError(catched, new Error('unknown error raised'));

        log.error(err.message);
        log.error(err.stack);
      }
    }
  });
}
