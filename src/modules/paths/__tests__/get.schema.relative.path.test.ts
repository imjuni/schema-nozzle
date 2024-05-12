import { getSchemaRelativePath } from '#/modules/paths/getSchemaRelativePath';
import fastCopy from 'fast-copy';
import { orThrow } from 'my-easy-fp';
import { getImportInfoMap, getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: {
  project: ReturnType<typeof getTypeScriptProject>;
  importInfoMap: ReturnType<typeof getImportInfoMap>;
} = {} as any;

describe('getSchemaRelativePath', () => {
  beforeAll(() => {
    data.project = getTypeScriptProject($context.tsconfigFilePath);
    data.importInfoMap = getImportInfoMap(data.project);
  });

  it('external module by is-external flag', () => {
    const schemaPath = getSchemaRelativePath({
      isExternal: true,
      typeName: 'IBaseOption',
      rootDirs: [],
      importInfo: undefined,
    });

    expect(schemaPath).toEqual('external/IBaseOption');
  });

  it('external module by undefined import-info', () => {
    const schemaPath = getSchemaRelativePath({
      isExternal: false,
      typeName: 'IBaseOption',
      rootDirs: [],
      importInfo: undefined,
    });

    expect(schemaPath).toEqual('external/IBaseOption');
  });

  it('external module by import-info-map moulde-file-path is undefined', () => {
    const importInfo = data.importInfoMap.get('IStudentEntity');
    const cloned = fastCopy(orThrow(importInfo));
    cloned.moduleFilePath = undefined;

    const schemaPath = getSchemaRelativePath({
      isExternal: false,
      typeName: 'IBaseOption',
      rootDirs: [],
      importInfo: cloned,
    });

    expect(schemaPath).toEqual('external/IBaseOption');
  });

  it('external module by found import-info-map', () => {
    const importInfo = data.importInfoMap.get('IStudentEntity');

    const schemaPath = getSchemaRelativePath({
      isExternal: false,
      typeName: 'IStudentEntity',
      rootDirs: [$context.tsconfigDirPath],
      importInfo,
    });

    expect(schemaPath).toEqual('IStudentEntity');
  });
});
