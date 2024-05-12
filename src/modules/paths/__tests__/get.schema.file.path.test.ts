import { getSchemaFilePath } from '#/modules/paths/getSchemaFilePath';
import fastCopy from 'fast-copy';
import { orThrow } from 'my-easy-fp';
import { getImportInfoMap, getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: {
  project: ReturnType<typeof getTypeScriptProject>;
  importInfoMap: ReturnType<typeof getImportInfoMap>;
} = {} as any;

describe('getSchemaFilePath', () => {
  beforeAll(() => {
    data.project = getTypeScriptProject($context.tsconfigFilePath);
    data.importInfoMap = getImportInfoMap(data.project);
  });

  it('external - by is-external flag', () => {
    const r01 = getSchemaFilePath({
      isExternal: true,
      typeName: 'IBaseOption',
      importInfo: undefined,
    });

    expect(r01).toEqual('external/IBaseOption');
  });

  it('external - by import-info not found', () => {
    const r01 = getSchemaFilePath({
      isExternal: false,
      typeName: 'IBaseOption',
      importInfo: undefined,
    });

    expect(r01).toEqual('external/IBaseOption');
  });

  it('external - by import-info module-file-path is undefined', () => {
    const importInfo = data.importInfoMap.get('IStudentEntity');
    const cloned = fastCopy(orThrow(importInfo));
    cloned.moduleFilePath = undefined;

    const r01 = getSchemaFilePath({
      isExternal: false,
      typeName: 'IStudentEntity',
      importInfo: cloned,
    });

    expect(r01).toEqual('external/IStudentEntity');
  });

  it('external - by import-info founded', () => {
    const importInfo = data.importInfoMap.get('IStudentEntity');
    const cloned = fastCopy(orThrow(importInfo));
    cloned.moduleFilePath = 'examples/type-prject/IStudentEntity';

    const r01 = getSchemaFilePath({
      isExternal: false,
      typeName: 'IStudentEntity',
      importInfo: cloned,
    });

    expect(r01).toEqual('examples/type-prject/IStudentEntity');
  });
});
