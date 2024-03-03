import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';
import path from 'path';
import type { IFileImportInfo } from 'ts-morph-short';
import { beforeEach, describe, expect, it } from 'vitest';

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
    const r02 = isRelativeDtoPath({ rootDir: './examples' });
    expect(r02).toBeTruthy();
    const r03 = isRelativeDtoPath({ rootDir: undefined });
    expect(r03).toBeFalsy();
  });
});
