import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import * as container from '#/modules/generator/NozzleGeneratorContainer';
import { generatorBootstrap as bootstrapGenerator } from '#/modules/generator/NozzleGeneratorContainer';
import { createJsonSchema } from '#/modules/generator/modules/createJsonSchema';
import path from 'node:path';
import { beforeAll, describe, expect, it, vitest } from 'vitest';

const tsconfigDir = path.join(process.cwd(), 'examples');
const tsconfigFilePath = path.join(tsconfigDir, 'tsconfig.json');

describe('create', () => {
  beforeAll(async () => {
    bootstrapGenerator({
      project: tsconfigFilePath,
      generatorOptionObject: await getSchemaGeneratorOption({
        $kind: 'add-schema',
        project: tsconfigFilePath,
        skipError: false,
      }),
    });
  });

  it('pass create-schema', () => {
    const schema = createJsonSchema('examples/IProfessorEntity.ts', 'IProfessorEntity');
    expect(schema).toMatchObject({
      type: 'pass',
      pass: {
        filePath: 'examples/IProfessorEntity.ts',
        exportedType: 'IProfessorEntity',
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
              description: 'professor age33',
            },
            joinAt: {
              type: 'string',
              format: 'date-time',
            },
            major: {
              $ref: '#/definitions/CE_MAJOR',
            },
          },
          required: ['id', 'name', 'age', 'joinAt', 'major'],
          additionalProperties: false,
          definitions: {
            CE_MAJOR: {
              type: 'string',
              enum: ['computer science', 'electrical'],
            },
          },
        },
      },
    });
  });

  it('exception', () => {
    vitest.spyOn(container, 'getGenerator').mockImplementationOnce(() => {
      throw new Error('intentional raise error');
    });

    const r01 = createJsonSchema('examples/IProfessorEntity.ts', 'IProfessorEntity');
    expect(r01).toMatchObject({ type: 'fail' });
  });
});
