import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import { makeSchemaGenerator } from '#/modules/generator/makeSchemaGenerator';
import { createJsonSchema } from '#/modules/generator/modules/createJsonSchema';
import pathe from 'pathe';
import { beforeAll, describe, expect, it } from 'vitest';

const tsconfigDir = pathe.join(process.cwd(), 'examples');
const tsconfigFilePath = pathe.join(tsconfigDir, 'tsconfig.json');

describe('create', () => {
  beforeAll(async () => {
    makeSchemaGenerator({
      project: tsconfigFilePath,
      generatorOptionObject: await getSchemaGeneratorOption({
        $kind: 'add-schema',
        useDefinitions: false,
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
});
