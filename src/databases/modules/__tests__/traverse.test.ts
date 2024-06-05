import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { traverser } from '#/databases/modules/traverser';
import type { AnySchemaObject } from 'ajv';
import fastCopy from 'fast-copy';
import pathe from 'pathe';
import type * as tsm from 'ts-morph';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: {
  project: tsm.Project;
  schema: {
    IProfessorEntity: AnySchemaObject;
    IStudentDto: AnySchemaObject;
  };
} = {
  schema: {},
} as any;

describe('traverser', () => {
  beforeAll(() => {
    data.project = getTypeScriptProject($context.tsconfigFilePath);
    data.schema.IProfessorEntity = {
      filePath: pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
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
    };

    data.schema.IStudentDto = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        nick: {
          type: 'string',
          description: 'nick :)',
        },
        name: {
          $ref: 'I18nDto',
        },
        description: {
          $ref: '#/definitions/TSimpleSetRequired%3CI18nDto%2C%22used%22%3E',
        },
        age: {
          type: 'number',
        },
        major: {
          $ref: 'CE_MAJOR',
        },
        joinAt: {
          type: 'string',
          format: 'date-time',
        },
      },
      required: ['id', 'nick', 'name', 'description', 'age', 'major', 'joinAt'],
      $id: 'IStudentDto',
      title: 'IStudentDto',
      definitions: {
        'TSimpleSetRequired%3CI18nDto%2C%22used%22%3E': {
          $schema: 'http://json-schema.org/draft-07/schema#',
          $id: 'TSimpleSetRequired%3CI18nDto%2C%22used%22%3E',
          title: 'TSimpleSetRequired%3CI18nDto%2C%22used%22%3E',
          type: 'object',
          properties: {
            used: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'i18n resource use on',
              minItems: 1,
              maxItems: 10,
            },
            id: {
              type: 'string',
              description: 'i18n resource id',
            },
            language: {
              type: 'string',
              description: 'iso639-1 language code',
              minLength: 2,
              maxLength: 5,
            },
            content: {
              type: 'string',
              description: 'i18n resource content',
            },
          },
          required: ['content', 'id', 'language'],
        },
      },
    };

    makeStatementInfoMap(
      data.project,
      data.project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath().toString()),
    );
  });

  it('replace id, dont encoded refs', () => {
    const cloned = fastCopy(data.schema.IProfessorEntity);

    traverser({
      ...cloned,
      $$options: {
        keys: { id: '$id', def: 'definitions' },
        style: CE_SCHEMA_ID_GENERATION_STYLE.ID,
        escapeChar: '_',
        jsVar: false,
        encodeRefs: false,
        rootDirs: [$context.tsconfigDirPath],
      },
    });

    expect(cloned).toMatchObject({
      filePath: pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
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
            $ref: 'CE_MAJOR',
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

  it('replace id, encoded refs', () => {
    const cloned = fastCopy(data.schema.IStudentDto);

    traverser({
      ...cloned,
      $$options: {
        keys: { id: '$id', def: 'definitions' },
        style: CE_SCHEMA_ID_GENERATION_STYLE.ID,
        escapeChar: '_',
        jsVar: false,
        encodeRefs: true,
        rootDirs: [$context.tsconfigDirPath],
      },
    });

    // fs.writeFileSync('test.json', JSON.stringify(cloned, undefined, 2));
    expect(cloned).toMatchObject({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        nick: {
          type: 'string',
          description: 'nick :)',
        },
        name: {
          $ref: 'I18nDto',
        },
        description: {
          $ref: 'TSimpleSetRequired%3CI18nDto%2C%22used%22%3E',
        },
        age: {
          type: 'number',
        },
        major: {
          $ref: 'CE_MAJOR',
        },
        joinAt: {
          type: 'string',
          format: 'date-time',
        },
      },
      required: ['id', 'nick', 'name', 'description', 'age', 'major', 'joinAt'],
      $id: 'IStudentDto',
      title: 'IStudentDto',
      definitions: {
        'TSimpleSetRequired%3CI18nDto%2C%22used%22%3E': {
          $schema: 'http://json-schema.org/draft-07/schema#',
          $id: 'TSimpleSetRequired%3CI18nDto%2C%22used%22%3E',
          title: 'TSimpleSetRequired%3CI18nDto%2C%22used%22%3E',
          type: 'object',
          properties: {
            used: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'i18n resource use on',
              minItems: 1,
              maxItems: 10,
            },
            id: {
              type: 'string',
              description: 'i18n resource id',
            },
            language: {
              type: 'string',
              description: 'iso639-1 language code',
              minLength: 2,
              maxLength: 5,
            },
            content: {
              type: 'string',
              description: 'i18n resource content',
            },
          },
          required: ['content', 'id', 'language'],
        },
      },
    });
  });
});
