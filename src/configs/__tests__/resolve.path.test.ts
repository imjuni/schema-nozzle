import { getResolvedPaths } from '#/configs/getResolvedPaths';
import path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';

process.env.USE_INIT_CWD = 'true';
const originPath = process.env.INIT_CWD!;

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
});

describe('getResolvedPaths', () => {
  it('normal', async () => {
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

  it('no output', async () => {
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

  it('relative path', async () => {
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

  it('relative rootDir', async () => {
    const r = getResolvedPaths({
      project: './tsconfig.json',
      output: '.',
      rootDir: '.',
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
      rootDir: path.join(originPath, 'examples'),
    });
  });

  it('absolute rootDir', async () => {
    const r = getResolvedPaths({
      project: './tsconfig.json',
      output: '.',
      rootDir: path.join(originPath, 'examples'),
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
      rootDir: path.join(originPath, 'examples'),
    });
  });
});
