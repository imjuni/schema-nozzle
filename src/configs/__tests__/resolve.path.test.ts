import { getResolvedPaths } from '#/configs/getResolvedPaths';
import path from 'node:path';
import { describe, expect, it, vitest } from 'vitest';

describe('getResolvedPaths', () => {
  it('normal', async () => {
    const originPath = process.cwd();
    vitest.stubEnv('INIT_CWD', path.join(process.cwd(), 'examples'));

    const r = getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      projectDir: path.join(originPath, 'examples'),
      cwd: originPath,
      output: path.join(originPath, 'examples'),
      rootDirs: undefined,
    });
  });

  it('no output', async () => {
    const originPath = path.join(process.cwd(), 'examples');
    vitest.stubEnv('INIT_CWD', path.join(process.cwd(), 'examples'));

    const r = getResolvedPaths({
      project: path.join(originPath, 'tsconfig.json'),
      output: undefined,
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'tsconfig.json'),
      projectDir: originPath,
      output: originPath,
      cwd: process.cwd(),
      rootDirs: undefined,
    });
  });

  it('relative path', async () => {
    const originPath = process.cwd();
    vitest.stubEnv('USE_INIT_CWD', 'true');
    vitest.stubEnv('INIT_CWD', path.join(originPath, 'examples'));

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
    const originPath = process.cwd();
    vitest.stubEnv('USE_INIT_CWD', 'true');
    vitest.stubEnv('INIT_CWD', path.join(originPath, 'examples'));

    const r = getResolvedPaths({
      project: './tsconfig.json',
      output: '.',
      rootDirs: ['.'],
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      projectDir: path.join(originPath, 'examples'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
      rootDirs: [path.join(originPath, 'examples')],
    });
  });

  it('absolute rootDir', async () => {
    const originPath = process.cwd();
    vitest.stubEnv('USE_INIT_CWD', 'true');
    vitest.stubEnv('INIT_CWD', path.join(originPath, 'examples'));

    const r = getResolvedPaths({
      project: './tsconfig.json',
      output: '.',
      rootDirs: [path.join(originPath, 'examples')],
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
      rootDirs: [path.join(originPath, 'examples')],
    });
  });
});
