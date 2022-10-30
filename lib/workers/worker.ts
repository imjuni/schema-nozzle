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
import { AsyncReturnType } from 'type-fest';

export default async function worker() {
  const typeInfos: IFileWithType[] = [];
  let resolvedPaths: IResolvedPaths;
  let generatorOption: AsyncReturnType<typeof readGeneratorOption>;
  let option: IAddSchemaOption | IRefreshSchemaOption;

  process.on('message', async (payload: TParentToChildData) => {
    if (payload.command === 'job') {
      typeInfos.push(payload.data.fileWithTypes);
      generatorOption = payload.data.generatorOption;
      resolvedPaths = payload.data.resolvedPaths;
      option = payload.data.option;
    }

    if (payload.command === 'end') {
      process.exit(1);
    }

    if (payload.command === 'start') {
      try {
        const project = await getTsProject(resolvedPaths.project);

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
              project: project.pass,
              resolvedPaths,
              metadata: schema.pass,
            });
            const records = [record.record, ...(record.definitions ?? [])];

            const postMessage: TChildToParentData = { command: 'record', data: records };
            const message: TChildToParentData = {
              command: 'message',
              data: `Success: ${schema.pass.typeName} - ${schema.pass.filePath}`,
            };
            process.send?.(postMessage);
            process.send?.(message);
          }

          process.exit(1);
        }
      } catch (catched) {
        const err = isError(catched) ?? new Error('unk');
        console.log(err.message);
        console.log(err.stack);
      }
    }
  });
}
