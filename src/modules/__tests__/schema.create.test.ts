import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import createJSONSchema from '#modules/createJSONSchema';
import 'jest';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import type { AsyncReturnType } from 'type-fest';

const originPath = process.env.INIT_CWD!;
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  option: AsyncReturnType<typeof getSchemaGeneratorOption>;
} = {} as any;

beforeAll(async () => {
  data.option = await getSchemaGeneratorOption({
    discriminator: 'add-schema',
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    skipError: false,
  });
});

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
});

describe('createJSONSchema', () => {
  test('normal', async () => {
    const schema = createJSONSchema({
      filePath: path.join(data.resolvedPaths.cwd, 'I18nDto.ts'),
      exportedType: 'ILanguageDto',
      generator: tjsg.createGenerator({ ...data.option }),
    });

    if (schema.type === 'fail') {
      throw schema.fail;
    }

    expect(schema.pass.schema).toMatchObject({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        $code: {
          type: 'string',
        },
        content: {
          type: 'string',
        },
      },
      required: ['id', '$code', 'content'],
      definitions: {},
    });
  });

  test('exception', async () => {
    const schema = createJSONSchema({
      filePath: path.join(data.resolvedPaths.cwd, 'I18nDto.ts'),
      exportedType: 'ILanguageDto2',
      generator: tjsg.createGenerator({ ...data.option, skipTypeCheck: false }),
    });

    expect(schema.type).toEqual('fail');
  });
});
