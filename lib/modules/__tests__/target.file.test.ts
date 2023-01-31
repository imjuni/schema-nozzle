import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import { getTargetFileContent, getTargetFilePath, getTargetFiles } from '#modules/getTargetFiles';
import getCwd from '#tools/getCwd';
import 'jest';
import path from 'path';

const originPath = process.env.INIT_CWD!;

beforeEach(() => {
  process.env.INIT_CWD = originPath;
});

describe('getTargetFilePath', () => {
  test('undefined', async () => {
    const result = await getTargetFilePath();
    expect(result).toBeUndefined();
  });

  test('resolved', async () => {
    const f = path.join('.', 'examples', CE_DEFAULT_VALUE.LIST_FILE);
    const result = await getTargetFilePath(f);
    expect(result).toEqual(path.resolve(f));
  });

  test('default', async () => {
    process.env.INIT_CWD = path.resolve(path.join(process.env.INIT_CWD!, 'examples'));
    const f = path.join('.', 'examples', CE_DEFAULT_VALUE.LIST_FILE);
    const result = await getTargetFilePath();
    expect(result).toEqual(path.resolve(f));
  });
});

describe('getTargetFileContent', () => {
  test('exist file', async () => {
    const cwd = getCwd(process.env);
    const lines = await getTargetFileContent(
      path.join(cwd, 'examples', CE_DEFAULT_VALUE.LIST_FILE),
    );
    expect(lines).toMatchObject(['*.ts']);
  });
});

describe('getTargetFiles', () => {
  test('empty list file', async () => {
    const ig = await getTargetFiles({});
    expect(ig.ignores('I18nDto.ts')).toBeFalsy();
  });

  test('file hit test', async () => {
    const cwd = getCwd(process.env);
    const listFile = path.join(cwd, 'examples', CE_DEFAULT_VALUE.LIST_FILE);
    const ig = await getTargetFiles({ listFile });
    expect(ig.ignores(path.join('examples', 'I18nDto.ts'))).toBeTruthy();
  });
});
