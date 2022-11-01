import getTsProject from '@compilers/getTsProject';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import readGeneratorOption from '@configs/readGeneratorOption';
import createJSONSchema from '@modules/createJSONSchema';
import createSchemaRecord from '@modules/createSchemaRecord';
import IFileWithType from '@modules/interfaces/IFileWithType';
import TChildToParentData from '@workers/interfaces/TChildToParentData';
import TParentToChildData from '@workers/interfaces/TParentToChildData';
import { isError } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import path from 'path';
import { AsyncReturnType } from 'type-fest';

export default async function worker() {
  const typeInfos: IFileWithType[] = [];
  let resolvedPaths: IResolvedPaths;
  let generatorOption: AsyncReturnType<typeof readGeneratorOption>;
  let option: IAddSchemaOption | IRefreshSchemaOption;

  process.on('SIGTERM', () => {
    process.exit();
  });

  process.on('message', async (payload: TParentToChildData) => {
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
        const basePath = await getDirname(resolvedPaths.project);
        const project = await getTsProject({
          tsConfigFilePath: resolvedPaths.project,
          skipAddingFilesFromTsConfig: false,
          skipFileDependencyResolution: true,
          skipLoadingLibFiles: true,
        });

        if (project.type === 'fail') process.exit(1);

        for (let i = 0; i < typeInfos.length; i += 1) {
          const schema = createJSONSchema({
            option,
            schemaConfig: generatorOption,
            filePath: typeInfos[i].filePath,
            typeName: typeInfos[i].typeName,
          });

          if (schema.type === 'pass') {
            // eslint-disable-next-line
            const record = await createSchemaRecord({
              option,
              project: project.pass,
              resolvedPaths,
              metadata: schema.pass,
            });
            const records = [record.record, ...(record.definitions ?? [])];

            const postMessage: TChildToParentData = { command: 'record', data: records };
            const message: TChildToParentData = {
              command: 'message',
              data: `Success: ${schema.pass.typeName} - ${path.relative(
                basePath,
                schema.pass.filePath,
              )}`,
            };
            process.send?.(postMessage);
            process.send?.(message);
          } else {
            const message: TChildToParentData = {
              command: 'message',
              data: `Error: ${typeInfos[i].typeName} - ${schema.fail.message}`,
              channel: 'fail',
            };

            process.send?.(message);
          }

          process.exit(1);
        }
      } catch (catched) {
        const err = isError(catched) ?? new Error('unknown error raised');
        console.log(err.message);
        console.log(err.stack);
      }
    }
  });
}
