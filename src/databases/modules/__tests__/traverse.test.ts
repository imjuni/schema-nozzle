import { makeStatementImportInfoMap } from '#/compilers/makeStatementImportInfoMap';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { traverser } from '#/databases/modules/traverser';
import type { AnySchemaObject } from 'ajv';
import fastCopy from 'fast-copy';
import pathe from 'pathe';
import type * as tsm from 'ts-morph';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: {
  tsconfigFilePath: string;
  tsconfigDirPath: string;
  project: tsm.Project;
  schema: AnySchemaObject;
} = {} as any;

describe('traverser', () => {
  beforeAll(() => {
    data.tsconfigDirPath = pathe.join(process.cwd(), 'examples');
    data.tsconfigFilePath = pathe.join(data.tsconfigDirPath, 'tsconfig.example.json');
    data.project = getTypeScriptProject(data.tsconfigFilePath);

    data.schema = {
      IProfessorEntity: {
        filePath: pathe.join(data.tsconfigDirPath, 'IProfessorEntity.ts'),
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

    makeStatementImportInfoMap(data.project);
  });

  it('replaced', () => {
    const cloned = fastCopy(data.schema.IProfessorEntity) as AnySchemaObject;

    traverser({
      ...cloned,
      $$options: {
        style: CE_SCHEMA_ID_GENERATION_STYLE.ID,
        escapeChar: '_',
        rootDirs: [data.tsconfigDirPath],
      },
    });

    expect(cloned).toMatchObject({
      filePath: pathe.join(data.tsconfigDirPath, 'IProfessorEntity.ts'),
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
            $ref: 'external/CE_MAJOR',
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
