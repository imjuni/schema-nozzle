import 'jest';
import path from 'path';
import getResolvedPaths from 'src/configs/getResolvedPaths';

process.env.USE_INIT_CWD = 'true';
const originPath = process.env.INIT_CWD!;

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
});

describe('getResolvedPaths', () => {
  test('normal', async () => {
    const r = getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
    });
  });

  test('no output', async () => {
    const r = getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: undefined,
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
    });
  });

  test('relative path', async () => {
    const r = getResolvedPaths({
      project: './tsconfig.json',
      output: '.',
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
    });
  });
});
