import getExportedFiles from '#compilers/getExportedFiles';
import getExportedTypes from '#compilers/getExportedTypes';
import getResolvedPaths from '#configs/getResolvedPaths';
import 'jest';
import { startSepRemove } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

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
      'IReqReadStudentDto',
      'ISlackMessageBotProfile',
      'ISlackMessageBody',
      'IStudentDto',
      'IStudentEntity',
      'TGenericExample',
    ]);
  });
});
