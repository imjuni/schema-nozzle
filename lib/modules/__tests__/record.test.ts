import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import createJSONSchema from '@modules/createJSONSchema';
import createSchemaRecord from '@modules/createSchemaRecord';
import getAddFiles from '@modules/getAddFiles';
import getAddTypes from '@modules/getAddTypes';
import getTargetTypes from '@modules/getTargetTypes';
import fs from 'fs';
import 'jest';
import { parse } from 'jsonc-parser';
import type { TPickIPass } from 'my-only-either';
import path from 'path';
import * as env from './env';

test('T001-create-schema-record', async () => {
  const expectation = parse(
    (await fs.promises.readFile(path.join(__dirname, 'data', '002.json'))).toString(),
  );

  const nullableOption = {
    ...env.addCmdOption,
    project: path.join(__dirname, '../../../examples/tsconfig.json'),
  };
  const resolvedPaths = getResolvedPaths(nullableOption);

  const project = await getTsProject({
    tsConfigFilePath: resolvedPaths.project,
  });
  if (project.type === 'fail') throw project.fail;

  const files = await getAddFiles({
    resolvedPaths,
    option: { ...nullableOption, files: ['IProfessorDto.ts'] },
  });
  if (files.type === 'fail') throw files.fail;

  const types = await getAddTypes({
    project: project.pass,
    option: { ...nullableOption, files: files.pass, types: ['IProfessorDto'] },
  });
  if (types.type === 'fail') throw types.fail;

  const option: IAddSchemaOption = {
    ...nullableOption,
    files: files.pass,
    types: types.pass.map((typeName) => typeName.typeName),
  };
  const targetTypes = getTargetTypes({ project: project.pass, option });

  const schemas = targetTypes.exportedTypes.map((targetType) =>
    createJSONSchema({
      option: nullableOption,
      schemaConfig: undefined,
      filePath: targetType.filePath,
      typeName: targetType.identifier,
    }),
  );

  const records = await Promise.all(
    schemas
      .filter(
        (schema): schema is TPickIPass<ReturnType<typeof createJSONSchema>> =>
          schema.type === 'pass',
      )
      .map((schema) => schema.pass)
      .map(async (schema) =>
        createSchemaRecord({ option, project: project.pass, resolvedPaths, metadata: schema }),
      ),
  );

  expect(records).toEqual(expectation);
});
