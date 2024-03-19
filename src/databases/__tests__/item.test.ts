import { createDatabaseItem } from '#/databases/createDatabaseItem';
import path from 'node:path';
import { getImportInfoMap, getTypeScriptProject } from 'ts-morph-short';
import { describe, expect, it } from 'vitest';

const tsconfigDirPath = path.join(process.cwd(), 'examples');
const tsconfigFilePath = path.join(tsconfigDirPath, 'tsconfig.json');
const project = getTypeScriptProject(tsconfigFilePath);
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

describe('createDatabaseItem', () => {
  it('using rootDir, build by relative path', () => {
    const r01 = createDatabaseItem(
      {
        $kind: 'add-schema',
        project: tsconfigFilePath,
        projectDir: tsconfigDirPath,
        rootDirs: ['examples'],
      },
      [
        { filePath: 'examples/IProfessorEntity.ts', identifier: 'IProfessorEntity' },
        { filePath: 'examples/const-enum/CE_MAJOR.ts', identifier: 'CE_MAJOR' },
      ],
      schemas.IProfessorEntity,
      getImportInfoMap(project),
    );

    // console.log(JSON.stringify(r01, undefined, 2));
    expect(r01).toMatchObject({
      item: {
        id: '-IProfessorEntity',
        typeName: 'IProfessorEntity',
        filePath: 'IProfessorEntity.ts',
        $ref: ['-const-enum-CE_MAJOR'],
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
              $ref: '-const-enum-CE_MAJOR',
            },
          },
          required: ['id', 'name', 'age', 'joinAt', 'major'],
          additionalProperties: false,
          $id: '-IProfessorEntity',
          title: '#/IProfessorEntity',
        },
        rawSchema:
          '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"},"age":{"type":"number","description":"professor age33"},"joinAt":{"type":"string","format":"date-time"},"major":{"$ref":"-const-enum-CE_MAJOR"}},"required":["id","name","age","joinAt","major"],"additionalProperties":false,"$id":"-IProfessorEntity","title":"#/IProfessorEntity"}',
      },
      definitions: [
        {
          id: '-const-enum-CE_MAJOR',
          typeName: 'CE_MAJOR',
          filePath: 'const-enum/CE_MAJOR.ts',
          $ref: [],
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            $id: '-const-enum-CE_MAJOR',
            title: '#/const-enum/CE_MAJOR',
            type: 'string',
            enum: ['computer science', 'electrical'],
          },
          rawSchema:
            '{"$schema":"http://json-schema.org/draft-07/schema#","$id":"-const-enum-CE_MAJOR","title":"#/const-enum/CE_MAJOR","type":"string","enum":["computer science","electrical"]}',
        },
      ],
    });
  });
});
