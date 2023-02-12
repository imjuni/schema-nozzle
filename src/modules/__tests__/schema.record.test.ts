import type getExportedTypes from '#compilers/getExportedTypes';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import { CE_OUTPUT_FORMAT } from '#configs/interfaces/CE_OUTPUT_FORMAT';
import createJSONSchema from '#modules/createJSONSchema';
import createSchemaRecord from '#modules/createSchemaRecord';
import getData from '#tools/__tests__/getData';
import 'jest';
import 'jsonc-parser';
import path from 'path';
import * as tsm from 'ts-morph';
import type { AsyncReturnType, LastArrayElement } from 'type-fest';

const originPath = process.env.INIT_CWD!;
const data: {
  project: tsm.Project;
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  generatorOption: AsyncReturnType<typeof getSchemaGeneratorOption>;
  exportedTypes: Pick<
    LastArrayElement<ReturnType<typeof getExportedTypes>>,
    'identifier' | 'filePath'
  >[];
} = {} as any;

beforeAll(async () => {
  data.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
  data.generatorOption = await getSchemaGeneratorOption({
    discriminator: 'add-schema',
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    skipError: true,
  });
});

beforeEach(async () => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });

  data.exportedTypes = [
    ...(await getData<(typeof data)['exportedTypes']>(path.join(__dirname, 'data/002.json'))),
  ].map((exportedType) => ({
    ...exportedType,
    filePath: path.join(originPath, 'examples', exportedType.filePath),
  }));
});

describe('createSchemaRecord', () => {
  test('without definitions', async () => {
    const schemaEither = createJSONSchema(
      path.join(originPath, 'examples', 'CE_MAJOR.ts'),
      'CE_MAJOR',
      data.generatorOption,
    );

    if (schemaEither.type !== 'pass') {
      throw new Error('schema generation fail');
    }

    const reply = await createSchemaRecord(
      { discriminator: 'add-schema', format: CE_OUTPUT_FORMAT.JSON },
      data.resolvedPaths,
      data.exportedTypes,
      schemaEither.pass,
    );
    expect(reply).toMatchObject(
      await getData<ReturnType<typeof createSchemaRecord>>(path.join(__dirname, 'data/006.json')),
    );
  });

  test('with definitions', async () => {
    const schemaEither = createJSONSchema(
      path.join(originPath, 'examples', 'IStudentDto.ts'),
      'IStudentDto',
      data.generatorOption,
    );

    if (schemaEither.type !== 'pass') {
      throw new Error('schema generation fail');
    }

    const reply = await createSchemaRecord(
      { discriminator: 'add-schema', format: CE_OUTPUT_FORMAT.JSON },
      data.resolvedPaths,
      data.exportedTypes,
      schemaEither.pass,
    );

    expect(reply).toMatchObject(
      await getData<ReturnType<typeof createSchemaRecord>>(path.join(__dirname, 'data/003.json')),
    );
  });

  test('import', async () => {
    const schemaEither = createJSONSchema(
      path.join(originPath, 'examples', 'ISlackMessage.ts'),
      'ISlackMessageBody',
      data.generatorOption,
    );

    if (schemaEither.type !== 'pass') {
      throw new Error('schema generation fail');
    }

    const reply = await createSchemaRecord(
      { discriminator: 'add-schema', format: CE_OUTPUT_FORMAT.JSON },
      data.resolvedPaths,
      data.exportedTypes,
      schemaEither.pass,
    );

    expect(reply).toMatchObject(
      await getData<ReturnType<typeof createSchemaRecord>>(path.join(__dirname, 'data/005.json')),
    );
  });
});
