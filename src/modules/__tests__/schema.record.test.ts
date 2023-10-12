import type getExportedTypes from '#/compilers/getExportedTypes';
import getResolvedPaths from '#/configs/getResolvedPaths';
import getSchemaGeneratorOption from '#/configs/getSchemaGeneratorOption';
import { CE_OUTPUT_FORMAT } from '#/configs/interfaces/CE_OUTPUT_FORMAT';
import createDatabaseItem from '#/databases/createDatabaseItem';
import createJSONSchema from '#/modules/createJSONSchema';
import getData from '#/tools/__tests__/test-tools/getData';
import 'jest';
import 'jsonc-parser';
import path from 'path';
import { createGenerator } from 'ts-json-schema-generator';
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

describe('createDatabaseItem', () => {
  test('without definitions', async () => {
    const schema = createJSONSchema({
      filePath: path.join(originPath, 'examples', 'const-enum', 'CE_MAJOR.ts'),
      exportedType: 'CE_MAJOR',
      option: data.generatorOption,
    });

    if (schema.type !== 'pass') {
      throw new Error('schema generation fail');
    }

    const reply = createDatabaseItem(
      data.project,
      {
        discriminator: 'add-schema',
        format: CE_OUTPUT_FORMAT.JSON,
        project: data.resolvedPaths.project,
      },
      data.exportedTypes,
      schema.pass,
    );
    expect(reply).toMatchObject(
      await getData<ReturnType<typeof createDatabaseItem>>(path.join(__dirname, 'data/006.json')),
    );
  });

  test('with definitions', async () => {
    const schema = createJSONSchema({
      filePath: path.join(originPath, 'examples', 'IStudentDto.ts'),
      exportedType: 'IStudentDto',
      generator: createGenerator(data.generatorOption),
    });

    if (schema.type !== 'pass') {
      throw new Error('schema generation fail');
    }

    const reply = createDatabaseItem(
      data.project,
      {
        discriminator: 'add-schema',
        format: CE_OUTPUT_FORMAT.JSON,
        project: data.resolvedPaths.project,
      },
      data.exportedTypes,
      schema.pass,
    );

    expect(reply).toMatchObject(
      await getData<ReturnType<typeof createDatabaseItem>>(path.join(__dirname, 'data/003.json')),
    );
  });

  test('import', async () => {
    const schema = createJSONSchema({
      filePath: path.join(originPath, 'examples', 'ISlackMessage.ts'),
      exportedType: 'ISlackMessageBody',
      option: data.generatorOption,
    });

    if (schema.type !== 'pass') {
      throw new Error('schema generation fail');
    }

    const reply = createDatabaseItem(
      data.project,
      {
        discriminator: 'add-schema',
        format: CE_OUTPUT_FORMAT.JSON,
        project: data.resolvedPaths.project,
      },
      data.exportedTypes,
      schema.pass,
    );

    expect(reply).toMatchObject(
      await getData<ReturnType<typeof createDatabaseItem>>(path.join(__dirname, 'data/005.json')),
    );
  });
});
