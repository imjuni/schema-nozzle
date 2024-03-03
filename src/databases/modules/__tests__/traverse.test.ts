import { traverser } from '#/databases/modules/traverser';
import fastCopy from 'fast-copy';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const schemas = {
  IProfessorEntity: {
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
};

describe('traverser', () => {
  it('replaced', () => {
    const cloned = fastCopy(schemas.IProfessorEntity);

    traverser(
      cloned,
      [
        {
          name: 'CE_MAJOR',
          sourceFilePath: path.join(process.cwd(), 'examples', 'IProfessorEntity.ts'),
          moduleFilePath: path.join(process.cwd(), 'examples', 'const-enum', 'CE_MAJOR.ts'),
          isExternal: false,
          isNamespace: false,
        },
      ],
      { rootDir: 'examples' },
    );

    expect(cloned).toMatchObject({
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
            $ref: '#/const-enum/CE_MAJOR',
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
    });
  });
});
