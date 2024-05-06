import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getExportedFiles } from '#/compilers/getExportedFiles';
import { getExportedTypes } from '#/compilers/getExportedTypes';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { startSepRemove } from 'my-node-fp';
import pathe from 'pathe';
import type * as tsm from 'ts-morph';
import { getTypeScriptConfig, getTypeScriptProject } from 'ts-morph-short';
import { afterEach, beforeAll, describe, expect, it, vitest } from 'vitest';

const data: {
  project: tsm.Project;
  config: ReturnType<typeof getTypeScriptConfig>;
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
} = {
  project: undefined,
  config: undefined,
  resolvedPaths: undefined,
} as any;

describe('getExportedFiles', () => {
  beforeAll(() => {
    vitest.stubEnv('INIT_CWD', pathe.join(process.cwd(), 'examples'));

    data.project = getTypeScriptProject(pathe.join(process.cwd(), 'examples', 'tsconfig.json'));
    data.config = getTypeScriptConfig(pathe.join(process.cwd(), 'examples', 'tsconfig.json'));
    data.resolvedPaths = getResolvedPaths({
      rootDirs: [pathe.join(process.cwd(), 'examples')],
      project: pathe.join(process.cwd(), 'examples', 'tsconfig.json'),
      output: pathe.join(process.cwd(), 'examples'),
    });
  });

  it('export files', () => {
    const files = getExportedFiles(data.project);
    const refinedFiles = files.map((file) =>
      startSepRemove(file.replace(pathe.join(process.cwd(), 'examples'), '')),
    );

    expect(refinedFiles).toMatchObject([
      'I18nDto.ts',
      'IProfessorDto.ts',
      'IProfessorEntity.ts',
      'IReqReadStudentDto.ts',
      'ISlackMessage.ts',
      'IStudentDto.ts',
      'IStudentEntity.ts',
      'TGenericExample.ts',
      'TSimpleSetRequired.ts',
      'base/ITid.ts',
      'const-enum/CE_MAJOR.ts',
    ]);
  });
});

describe('getExportedTypes', () => {
  it('every file on tsconfig', () => {
    const types = getExportedTypes(data.project, data.config.fileNames);

    expect(types.map((type) => type.typeName)).toMatchObject([
      'I18nDto',
      'ILanguageDto',
      'IProfessorDto',
      'IProfessorEntity',
      'IReqReadStudentQuerystring',
      'IReqReadStudentParam',
      'IReqReadStudentIgnoreTest',
      'IReqReadStudentIgnoreAliasTest',
      'ISlackMessageBotProfile',
      'ISlackMessageBody',
      'IStudentDto',
      'IStudentEntity',
      'TGenericExample',
      'TSimpleSetRequired',
      'ITid',
      'CE_MAJOR',
    ]);
  });
});

describe('getDiagnostics', () => {
  it('pass', () => {
    const r1 = getDiagnostics({ options: { skipError: true }, project: data.project });
    expect(r1.type).toEqual('pass');
  });

  it('pass - skipError false', () => {
    const r1 = getDiagnostics({ options: { skipError: false }, project: data.project });
    expect(r1.type).toEqual('pass');
  });

  describe('getDiagnostics - fail', () => {
    afterEach(() => {
      const sf = data.project.getSourceFile('diagonostic_fail.ts');

      if (sf != null) {
        data.project.removeSourceFile(sf);
      }
    });

    it('fail', () => {
      data.project.createSourceFile('diagonostic_fail.ts', 'const a = "1"; a = 3', {
        overwrite: true,
      });
      const r1 = getDiagnostics({ options: { skipError: false }, project: data.project });
      expect(r1.type).toEqual('fail');
    });

    it('fail - exception', () => {
      const spy = vitest.spyOn(data.project, 'getPreEmitDiagnostics').mockImplementationOnce(() => {
        throw new Error('raise error');
      });

      data.project.createSourceFile('diagonostic_fail.ts', 'const a = "1"; a = 3', {
        overwrite: true,
      });
      const r1 = getDiagnostics({ options: { skipError: false }, project: data.project });
      spy.mockRestore();
      expect(r1.type).toEqual('fail');
    });
  });
});
