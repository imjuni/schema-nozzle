import getTsProject from '@compilers/getTsProject';
import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import getResolvedPaths from '@configs/getResolvedPaths';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import createJSONSchema from '@modules/createJSONSchema';
import createSchemaRecord from '@modules/createSchemaRecord';
import getAddFiles from '@modules/getAddFiles';
import getAddTypes from '@modules/getAddTypes';
import getTargetTypes from '@modules/getTargetTypes';
import fs from 'fs';
import 'jest';
import { parse } from 'jsonc-parser';
import { TPickIPass } from 'my-only-either';
import path from 'path';
import * as env from './env';

test('T001-create-schema-record', async () => {
  const expectation = parse(
    (await fs.promises.readFile(path.join(__dirname, 'data', '001.json'))).toString(),
  );

  const record = createSchemaRecord({
    schemaMetadata: {
      filePath: '/home/user/project/college/TStudentDto.ts',
      typeName: 'TStudentDto',
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
          major: {
            $ref: 'TMAJOR',
          },
        },
        required: ['id', 'name', 'age', 'major'],
        additionalProperties: false,
        definitions: {
          TMAJOR: {
            type: 'string',
            enum: ['computer science', 'electrical'],
          },
        },
      },
      type: TEXPORTED_TYPE.INTERFACE,
      banner: '',
    },
  });

  expect(record).toEqual(expectation);
});

test('T002-create-schema-record', async () => {
  const expectation = parse(
    (await fs.promises.readFile(path.join(__dirname, 'data', '002.json'))).toString(),
  );

  const nullableOption = {
    ...env.addCmdOption,
    project: path.join(__dirname, '../../../examples/tsconfig.json'),
  };
  const resolvedPaths = getResolvedPaths(nullableOption);

  const project = await getTsProject(resolvedPaths.project);
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
    types: types.pass,
  };
  const targetTypes = getTargetTypes({ project: project.pass, option });

  const schemas = targetTypes.exportedTypes.map((targetType) =>
    createJSONSchema({
      option: nullableOption,
      schemaConfig: undefined,
      type: targetType.type,
      filePath: targetType.filePath,
      typeName: targetType.identifier,
    }),
  );

  const records = schemas
    .filter(
      (schema): schema is TPickIPass<ReturnType<typeof createJSONSchema>> => schema.type === 'pass',
    )
    .map((schema) => createSchemaRecord({ schemaMetadata: schema.pass }));

  expect(records).toEqual(expectation);
});
