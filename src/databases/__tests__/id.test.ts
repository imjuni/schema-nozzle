import getResolvedPaths from '#/configs/getResolvedPaths';
import getBaseSchemaId from '#/databases/modules/getBaseSchemaId';
import getDtoName from '#/databases/modules/getDtoName';
import getSchemaId from '#/databases/modules/getSchemaId';
import isRelativeDtoPath from '#/databases/modules/isRelativeDtoPath';
import * as env from '#/modules/__tests__/env';
import 'jest';
import path from 'path';
import type { IFileImportInfo } from 'ts-morph-short';

const originPath = process.env.INIT_CWD!;
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  importInfos: IFileImportInfo[];
  importExternal: IFileImportInfo[];
} = {} as any;

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
  data.importInfos = [
    {
      name: 'CE_MAJOR',
      sourceFilePath: path.join(process.cwd(), '/examples/const-enum/CE_MAJOR.ts'),
      moduleFilePath: path.join(process.cwd(), '/examples/const-enum/CE_MAJOR.ts'),
      isExternal: false,
      isNamespace: false,
    },
    {
      name: 'I18nDto',
      sourceFilePath: path.join(process.cwd(), '/examples/IProfessorDto.ts'),
      moduleFilePath: path.join(process.cwd(), '/examples/I18nDto.ts'),
      isExternal: false,
      isNamespace: false,
    },
    {
      name: 'IStudentDto',
      sourceFilePath: path.join(process.cwd(), '/examples/IProfessorDto.ts'),
      moduleFilePath: path.join(process.cwd(), '/examples/IStudentDto.ts'),
      isExternal: false,
      isNamespace: false,
    },
    {
      name: 'IStudentEntity',
      sourceFilePath: path.join(process.cwd(), '/examples/IProfessorDto.ts'),
      moduleFilePath: path.join(process.cwd(), '/examples/IStudentEntity.ts'),
      isExternal: false,
      isNamespace: false,
    },
    {
      name: 'TGenericExample',
      sourceFilePath: path.join(process.cwd(), '/examples/IProfessorDto.ts'),
      moduleFilePath: path.join(process.cwd(), '/examples/TGenericExample.ts'),
      isExternal: false,
      isNamespace: false,
    },
  ];
  data.importExternal = [
    {
      name: 'Block',
      sourceFilePath: path.join(process.cwd(), '/examples/ISlackMessage.ts'),
      moduleFilePath: path.join(process.cwd(), '/node_modules/@slack/web-api/dist/index.d.ts'),
      isExternal: true,
      isNamespace: false,
    },
    {
      name: 'KnownBlock',
      sourceFilePath: path.join(process.cwd(), '/examples/ISlackMessage.ts'),
      moduleFilePath: path.join(process.cwd(), '/node_modules/@slack/web-api/dist/index.d.ts'),
      isExternal: true,
      isNamespace: false,
    },
    {
      name: 'MessageAttachment',
      sourceFilePath: path.join(process.cwd(), '/examples/ISlackMessage.ts'),
      moduleFilePath: path.join(process.cwd(), '/node_modules/@slack/web-api/dist/index.d.ts'),
      isExternal: true,
      isNamespace: false,
    },
  ];
});

describe('isRelativeDtoPath', () => {
  it('multiple-case', () => {
    const r01 = isRelativeDtoPath({});
    expect(r01).toBeFalsy();
    const r02 = isRelativeDtoPath({ includePath: false });
    expect(r02).toBeFalsy();
    const r03 = isRelativeDtoPath({ includePath: true });
    expect(r03).toBeFalsy();
    const r04 = isRelativeDtoPath({ rootDir: './examples' });
    expect(r04).toBeFalsy();
    const r05 = isRelativeDtoPath({ rootDir: './examples', includePath: true });
    expect(r05).toBeTruthy();
  });
});

describe('getSchemaId', () => {
  it('pass - include-path false', () => {
    const inp = 'iamdto';
    const id = getSchemaId(inp, [], env.addCmdOption);
    expect(id).toEqual(inp);
  });

  it('fail - include-path true but root-dir null', () => {
    const inp = 'iamdto';
    const id = getSchemaId(inp, [], { ...env.addCmdOption, includePath: true, rootDir: undefined });
    expect(id).toEqual(inp);
  });

  it('pass - include-path false definitions cleansing', () => {
    const inp = '#/definitions/iamdto';
    const id = getSchemaId(inp, [], env.addCmdOption);
    expect(id).toEqual('iamdto');
  });

  it('pass - include-path true', () => {
    const rootDir = './examples';
    const inp = 'IProfessorDto';
    const id = getSchemaId(inp, [], { ...env.addCmdOption, includePath: true, rootDir });
    expect(id).toEqual('#/external/IProfessorDto');
  });

  it('pass - include-path true + #', () => {
    const rootDir = './examples';
    const inp = '#/IProfessorDto';
    const id = getSchemaId(inp, [], { ...env.addCmdOption, includePath: true, rootDir });
    expect(id).toEqual('#/IProfessorDto');
  });

  it('pass - include-path true - in import-info', () => {
    const rootDir = './examples';
    const inp = 'IStudentDto';
    const id = getSchemaId(inp, data.importInfos, {
      ...env.addCmdOption,
      includePath: true,
      rootDir,
    });
    expect(id).toEqual('#/IStudentDto');
  });

  it('pass - include-path true - in subdirectory import-info', () => {
    const rootDir = './examples';
    const inp = 'CE_MAJOR';
    const id = getSchemaId(inp, data.importInfos, {
      ...env.addCmdOption,
      includePath: true,
      rootDir,
    });
    expect(id).toEqual('#/const-enum/CE_MAJOR');
  });

  it('pass - include-path true - external module', () => {
    const rootDir = './examples';
    const inp = 'MessageAttachment';
    const id = getSchemaId(inp, data.importExternal, {
      ...env.addCmdOption,
      includePath: true,
      rootDir,
    });
    expect(id).toEqual('#/external/MessageAttachment');
  });

  it('pass - include-path true - external module + #', () => {
    const rootDir = './examples';
    const inp = 'MessageAttachment';
    const id = getSchemaId(inp, data.importExternal, {
      ...env.addCmdOption,
      includePath: true,
      rootDir,
    });
    expect(id).toEqual('#/external/MessageAttachment');
  });

  it('pass - include-path true - external module + #', () => {
    const rootDir = './examples';
    const inp = '#/external/MessageAttachment';
    const id = getSchemaId(inp, data.importExternal, {
      ...env.addCmdOption,
      includePath: true,
      rootDir,
    });
    expect(id).toEqual('#/external/MessageAttachment');
  });
});

describe('getDtoName', () => {
  it('pass', () => {
    const r01 = getDtoName('#/test', () => '');
    expect(r01).toEqual('#/test');

    const r02 = getDtoName('test', (n) => `#/external/${n}`);
    expect(r02).toEqual('#/external/test');
  });
});

describe('getBaseSchemaId', () => {
  it('pass - include-path', () => {
    const rootDir = './examples';

    const id = getBaseSchemaId(
      'CE_MAJOR',
      path.join(process.cwd(), '/examples/const-enum/CE_MAJOR.ts'),
      {
        ...env.addCmdOption,
        includePath: true,
        rootDir,
      },
    );

    expect(id).toEqual('#/const-enum/CE_MAJOR');
  });

  it('pass - wihtout include-path', () => {
    const rootDir = './examples';

    const id = getBaseSchemaId(
      'CE_MAJOR',
      path.join(process.cwd(), '/examples/const-enum/CE_MAJOR.ts'),
      {
        ...env.addCmdOption,
        includePath: false,
        rootDir,
      },
    );

    expect(id).toEqual('CE_MAJOR');
  });
});
