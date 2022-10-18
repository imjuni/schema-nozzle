import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import openDatabase from '@databases/openDatabase';
import saveDatabase from '@databases/saveDatabase';
import createJSONSchema from '@modules/createJSONSchema';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import fastSafeStringify from 'fast-safe-stringify';
import { getDirname } from 'my-node-fp';
import { TPickIPass } from 'my-only-either';
import path from 'path';

export default async function saveScheams(
  option: IDatabaseOption,
  resolvedPaths: IResolvedPaths,
  ...schemas: ReturnType<typeof createJSONSchema>[]
) {
  const db = await openDatabase(option);

  const records = await Promise.all(
    schemas
      .filter(
        (schema): schema is TPickIPass<ReturnType<typeof createJSONSchema>> =>
          schema.type === 'pass',
      )
      .map((schema) => schema.pass)
      .map(async (schema) => {
        const relativePath = path.relative(
          await getDirname(resolvedPaths.project),
          schema.filePath,
        );
        const key = ['file://', path.posix.join(relativePath, schema.typeName)].join('');

        const record: IDatabaseRecord = {
          id: key,
          type: schema.type,
          schema: fastSafeStringify(schema.schema),
          banner: schema.banner,
        };

        return record;
      }),
  );

  const newDb = records.reduce((aggregation, record) => {
    return { ...aggregation, [record.id]: record };
  }, db);

  await saveDatabase(option, newDb);
}
