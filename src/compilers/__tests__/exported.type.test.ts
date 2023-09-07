import 'jest';
import { startSepRemove } from 'my-node-fp';
import path from 'path';
import getDiagnostics from 'src/compilers/getDiagnostics';
import getExportedFiles from 'src/compilers/getExportedFiles';
import getExportedTypes from 'src/compilers/getExportedTypes';
import getResolvedPaths from 'src/configs/getResolvedPaths';
import * as tsm from 'ts-morph';

process.env.USE_INIT_CWD = 'true';
const originPath = process.env.INIT_CWD!;
const data: { project: tsm.Project; resolvedPaths: ReturnType<typeof getResolvedPaths> } = {
  project: new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  }),
} as any;

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
});

describe('getExportedFiles', () => {
  test('normal', () => {
    const files = getExportedFiles(data.project);
    const refinedFiles = files.map((file) =>
      startSepRemove(file.replace(data.resolvedPaths.cwd, '')),
    );

    expect(refinedFiles).toMatchObject([
      'CE_MAJOR.ts',
      'I18nDto.ts',
      'IProfessorDto.ts',
      'IProfessorEntity.ts',
      'IReqReadStudentDto.ts',
      'ISlackMessage.ts',
      'IStudentDto.ts',
      'IStudentEntity.ts',
      'ITid.ts',
      'TGenericExample.ts',
    ]);
  });
});

describe('getExportedTypes', () => {
  test('normal', () => {
    const types = getExportedTypes(data.project);

    expect(types.map((type) => type.identifier)).toMatchObject([
      'CE_MAJOR',
      'I18nDto',
      'ILanguageDto',
      'IProfessorDto',
      'IProfessorEntity',
      'IReqReadStudentQuerystring',
      'IReqReadStudentParam',
      'ISlackMessageBotProfile',
      'ISlackMessageBody',
      'IStudentDto',
      'IStudentEntity',
      'ITid',
      'TGenericExample',
    ]);
  });
});

describe('getDiagnostics', () => {
  test('pass', () => {
    const r1 = getDiagnostics({ option: { skipError: true }, project: data.project });
    expect(r1.type).toEqual('pass');
  });

  test('pass - skipError false', () => {
    const r1 = getDiagnostics({ option: { skipError: false }, project: data.project });
    expect(r1.type).toEqual('pass');
  });

  describe('getDiagnostics - fail', () => {
    afterEach(() => {
      const sf = data.project.getSourceFile('diagonostic_fail.ts');

      if (sf != null) {
        data.project.removeSourceFile(sf);
      }
    });

    test('fail', () => {
      data.project.createSourceFile('diagonostic_fail.ts', 'const a = "1"; a = 3', {
        overwrite: true,
      });
      const r1 = getDiagnostics({ option: { skipError: false }, project: data.project });
      expect(r1.type).toEqual('fail');
    });

    test('fail - exception', () => {
      const spy = jest.spyOn(data.project, 'getPreEmitDiagnostics').mockImplementationOnce(() => {
        throw new Error('raise error');
      });

      data.project.createSourceFile('diagonostic_fail.ts', 'const a = "1"; a = 3', {
        overwrite: true,
      });
      const r1 = getDiagnostics({ option: { skipError: false }, project: data.project });
      spy.mockRestore();
      expect(r1.type).toEqual('fail');
    });
  });
});
