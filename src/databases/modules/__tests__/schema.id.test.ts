import { getBaseSchemaId } from '#/databases/modules/getBaseSchemaId';
import { getDtoName } from '#/databases/modules/getDtoName';
import { getSchemaId } from '#/databases/modules/getSchemaId';
import { replaceId } from '#/databases/modules/replaceId';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('replaceId', () => {
  it('use default value', () => {
    const id = replaceId('#/definitions/IProfessorEntity');
    expect(id).toEqual('IProfessorEntity');
  });

  it('use custom value', () => {
    const id = replaceId('#/custom/IProfessorEntity', '#/custom/');
    expect(id).toEqual('IProfessorEntity');
  });
});

describe('getBaseSchemaId', () => {
  it('use relative path schema id', () => {
    const r01 = getBaseSchemaId('#/definitions/IProfessorEntity', '/a/b/c/d/IProfessorEntity', {
      rootDir: '/a/b/c',
    });
    expect(r01).toEqual('#/d/IProfessorEntity');
  });

  it('use static schema id', () => {
    const r01 = getBaseSchemaId('#/definitions/IProfessorEntity', '/a/b/c/d/IProfessorEntity', {});
    expect(r01).toEqual('IProfessorEntity');
  });
});

describe('getSchemaId', () => {
  it('use relative path schema id', () => {
    const r01 = getSchemaId(
      '#/definitions/CE_MAJOR',
      [
        {
          name: 'CE_MAJOR',
          sourceFilePath: path.join(process.cwd(), 'examples', 'IProfessorEntity.ts'),
          moduleFilePath: path.join(process.cwd(), 'examples', 'const-enum', 'CE_MAJOR.ts'),
          isExternal: false,
          isNamespace: false,
        },
      ],
      {
        rootDir: path.join(process.cwd(), 'examples'),
      },
    );

    expect(r01).toEqual('#/const-enum/CE_MAJOR');
  });

  it('use relative path schema id', () => {
    const r01 = getSchemaId(
      '#/definitions/CE_MAJOR',
      [
        {
          name: 'CE_MAJOR',
          sourceFilePath: path.join(process.cwd(), 'examples', 'IProfessorEntity.ts'),
          moduleFilePath: path.join(process.cwd(), 'examples', 'const-enum', 'CE_MAJOR.ts'),
          isExternal: false,
          isNamespace: false,
        },
      ],
      {
        rootDir: path.join(process.cwd(), 'examples'),
      },
    );

    expect(r01).toEqual('#/const-enum/CE_MAJOR');
  });

  it('use relative path schema id, but external schema, not found import-info', () => {
    const r01 = getSchemaId(
      '#/definitions/I_AM_EXTERNAL',
      [
        {
          name: 'CE_MAJOR',
          sourceFilePath: path.join(process.cwd(), 'examples', 'IProfessorEntity.ts'),
          moduleFilePath: path.join(process.cwd(), 'examples', 'const-enum', 'CE_MAJOR.ts'),
          isExternal: false,
          isNamespace: false,
        },
      ],
      {
        rootDir: path.join(process.cwd(), 'examples'),
      },
    );

    expect(r01).toEqual('#/$ext/I_AM_EXTERNAL');
  });

  it('use relative path schema id, but external schema', () => {
    const r01 = getSchemaId(
      '#/definitions/CE_MAJOR',
      [
        {
          name: 'CE_MAJOR',
          sourceFilePath: path.join(process.cwd(), 'examples', 'IProfessorEntity.ts'),
          moduleFilePath: undefined,
          isExternal: true,
          isNamespace: false,
        },
      ],
      {
        rootDir: path.join(process.cwd(), 'examples'),
      },
    );

    expect(r01).toEqual('#/$ext/CE_MAJOR');
  });

  it('use relative path schema id, but external schema', () => {
    const r01 = getSchemaId(
      '#/definitions/CE_MAJOR',
      [
        {
          name: 'CE_MAJOR',
          sourceFilePath: path.join(process.cwd(), 'examples', 'IProfessorEntity.ts'),
          moduleFilePath: undefined,
          isExternal: true,
          isNamespace: false,
        },
      ],
      {
        rootDir: path.join(process.cwd(), 'examples'),
      },
    );

    expect(r01).toEqual('#/$ext/CE_MAJOR');
  });

  it('use static schema id', () => {
    const r01 = getSchemaId(
      '#/definitions/CE_MAJOR',
      [
        {
          name: 'CE_MAJOR',
          sourceFilePath: path.join(process.cwd(), 'examples', 'IProfessorEntity.ts'),
          moduleFilePath: undefined,
          isExternal: true,
          isNamespace: false,
        },
      ],
      {},
    );

    expect(r01).toEqual('CE_MAJOR');
  });
});

describe('getDtoName', () => {
  it('not replaced', () => {
    const r01 = getDtoName('#/CE_MAJOR', (name) => name);
    expect(r01).toEqual('#/CE_MAJOR');
  });

  it('replaced', () => {
    const r01 = getDtoName('CE_MAJOR', (name) => `$$${name}`);
    expect(r01).toEqual('$$CE_MAJOR');
  });
});
