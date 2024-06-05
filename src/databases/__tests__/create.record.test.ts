import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { createRecord } from '#/databases/createRecord';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import type { createJsonSchema } from '#/modules/generators/createJsonSchema';
import fs from 'fs';
import type { TPickPass } from 'my-only-either';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: {
  project: ReturnType<typeof getTypeScriptProject>;
  schema: TPickPass<ReturnType<typeof createJsonSchema>>['schema'];
} = {
  project: undefined,
  schema: undefined,
} as any;

describe('createRecord', () => {
  beforeAll(() => {
    data.project = getTypeScriptProject($context.tsconfigFilePath);
    data.schema = {
      filePath: pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
      exportedType: 'IProfessorEntity',
      schema: {
        $schema: 'http://json-schema.org/draft-08/schema#',
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
    };

    makeStatementInfoMap(
      data.project,
      data.project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath().toString()),
    );
  });

  it('definitions with path that have not a definitions in scheam', () => {
    const r01 = createRecord({
      draft: 8,
      escapeChar: '_',
      rootDirs: [$context.tsconfigDirPath],
      encodeRefs: false,
      jsVar: false,
      schema: {
        filePath: pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
        exportedType: 'IProfessorEntity',
        schema: { ...data.schema.schema, definitions: undefined },
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
          filePath: pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
          relativePath: 'IProfessorEntity',
          schema: {
            $schema: 'http://json-schema.org/draft-08/schema#',
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
            definitions: undefined,
            $id: '#/$defs/IProfessorEntity',
            title: '#/$defs/IProfessorEntity',
          },
        },
      ],
      refs: [],
    });
  });

  it('definitions with path that have a definitions in scheam', () => {
    const r01 = createRecord({
      draft: 8,
      escapeChar: '_',
      rootDirs: [$context.tsconfigDirPath],
      encodeRefs: false,
      jsVar: false,
      schema: {
        filePath: pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
        exportedType: 'IProfessorEntity',
        schema: data.schema.schema,
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
          filePath: pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
          relativePath: 'IProfessorEntity',
          schema: {
            $schema: 'http://json-schema.org/draft-08/schema#',
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
            $id: '#/$defs/IProfessorEntity',
            title: '#/$defs/IProfessorEntity',
          },
        },
        {
          id: '#/$defs/const-enum/CE_MAJOR',
          typeName: 'CE_MAJOR',
          filePath: pathe.join($context.tsconfigDirPath, 'const-enum', 'CE_MAJOR.ts'),
          relativePath: 'const-enum/CE_MAJOR',
          schema: {
            $schema: 'http://json-schema.org/draft-08/schema#',
            $id: '#/$defs/const-enum/CE_MAJOR',
            title: 'CE_MAJOR',
            type: 'string',
            enum: ['computer science', 'electrical'],
          },
        },
      ],
      refs: [
        {
          id: '#/$defs/IProfessorEntity',
          refId: '#/$defs/const-enum/CE_MAJOR',
        },
      ],
    });
  });
});
