import { makeStatementImportInfoMap } from '#/compilers/makeStatementImportInfoMap';
import { createRecord } from '#/databases/createRecord';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import type { AnySchemaObject } from 'ajv';
import fs from 'fs';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: {
  tsconfigDirPath: string;
  tsconfigFilePath: string;
  project: ReturnType<typeof getTypeScriptProject>;
  schema: AnySchemaObject;
} = {
  project: undefined,
  tsconfigDirPath: '',
  tsconfigFilePath: '',
  schema: undefined,
} as any;

describe('createDatabaseItem', () => {
  beforeAll(() => {
    data.tsconfigDirPath = pathe.join(process.cwd(), 'examples');
    data.tsconfigFilePath = pathe.join(data.tsconfigDirPath, 'tsconfig.json');
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

  it('using rootDir, build by relative path', () => {
    const r01 = createRecord({
      escapeChar: '_',
      rootDirs: [data.tsconfigDirPath],
      schema: {
        filePath: pathe.join(data.tsconfigDirPath, 'IProfessorEntity.ts'),
        exportedType: 'IProfessorEntity',
        schema: data.schema,
      },
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    if (r01 === undefined) {
      fs.writeFileSync('test.json', JSON.stringify(r01, undefined, 2));
    }

    expect(r01).toMatchObject({
      schemas: [
        {
          id: '#/$defs/IProfessorEntity',
          typeName: 'IProfessorEntity',
          filePath: pathe.join(data.tsconfigDirPath, 'IProfessorEntity.ts'),
          relativePath: 'IProfessorEntity.ts',
          schema: {
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
                    $ref: '#/$defs/const-enum/CE_MAJOR',
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
            $id: '#/$defs/IProfessorEntity',
            title: '#/$defs/IProfessorEntity',
          },
        },
      ],
      refs: [],
    });
  });
});
