import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import summarySchemaFiles, {
  addProjectFile,
  getSchemaFileContent,
  getSchemaListFilePath,
} from '#modules/summarySchemaFiles';
import * as env from '#modules/__tests__/env';
import 'jest';
import { getDirname } from 'my-node-fp';
import { isFail } from 'my-only-either';
import path from 'path';

const originPath = process.env.INIT_CWD!;

beforeEach(() => {
  process.env.INIT_CWD = originPath;
});

describe('getSchemaListFilePath', () => {
  test('undefined', async () => {
    const result = await getSchemaListFilePath();
    expect(result).toBeUndefined();
  });

  test('resolved', async () => {
    const f = path.join('.', 'examples', CE_DEFAULT_VALUE.LIST_FILE);
    const result = await getSchemaListFilePath(f);
    expect(result).toEqual(path.resolve(f));
  });

  test('default', async () => {
    process.env.INIT_CWD = path.resolve(path.join(process.env.INIT_CWD!, 'examples'));
    const f = path.join('.', 'examples', CE_DEFAULT_VALUE.LIST_FILE);
    const result = await getSchemaListFilePath();
    expect(result).toEqual(path.resolve(f));
  });
});

describe('getSchemaFileContent', () => {
  test('exist file', async () => {
    const resolvedPaths = getResolvedPaths({
      project: env.baseOption.project,
      output: env.baseOption.output,
    });
    const lines = await getSchemaFileContent(
      path.join(resolvedPaths.cwd, 'examples', CE_DEFAULT_VALUE.LIST_FILE),
    );
    expect(lines).toMatchObject(['*.ts']);
  });
});

describe('summarySchemaFiles', () => {
  test('addProjectFile', async () => {
    const resolvedPaths = getResolvedPaths({
      project: env.baseOption.project,
      output: env.baseOption.output,
    });

    resolvedPaths.cwd = path.join(await getDirname(resolvedPaths.project), 'examples');
    resolvedPaths.project = path.join(
      await getDirname(resolvedPaths.project),
      'examples',
      'tsconfig.json',
    );
    resolvedPaths.output = resolvedPaths.cwd;

    console.log(resolvedPaths);

    const p = await getTsProject({ tsConfigFilePath: resolvedPaths.project });
    if (isFail(p)) throw new Error('project load fail');

    const a = addProjectFile(resolvedPaths.cwd, p.pass);

    expect(a).toMatchObject([
      'I18nDto.ts',
      'IProfessorDto.ts',
      'IProfessorEntity.ts',
      'IReqReadStudentDto.ts',
      'ISlackMessage.ts',
      'IStudentDto.ts',
      'IStudentEntity.ts',
      'TGenericExample.ts',
      'TMAJOR.ts',
    ]);
  });
});

describe('summarySchemaFiles', () => {
  test('empty list file', async () => {
    const resolvedPaths = getResolvedPaths({
      project: env.baseOption.project,
      output: env.baseOption.output,
    });
    const ig = await summarySchemaFiles({ resolvedPaths });
    expect(ig.ignores('I18nDto.ts')).toBeFalsy();
  });

  test('empty list file -2', async () => {
    const resolvedPaths = getResolvedPaths({
      project: env.baseOption.project,
      output: env.baseOption.output,
    });

    const ig2 = await summarySchemaFiles({ resolvedPaths, option: { listFile: undefined } });
    expect(ig2.ignores('I18nDto.ts')).toBeFalsy();
  });

  test('file hit test', async () => {
    const resolvedPaths = getResolvedPaths({
      project: env.baseOption.project,
      output: env.baseOption.output,
    });
    const listFile = path.join(resolvedPaths.cwd, 'examples', CE_DEFAULT_VALUE.LIST_FILE);
    const ig = await summarySchemaFiles({ option: { listFile }, resolvedPaths });
    expect(ig.ignores(path.join('examples', 'I18nDto.ts'))).toBeTruthy();
  });
});
