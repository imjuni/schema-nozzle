import { getResolvedPaths } from '#/configs/getResolvedPaths';
import pathe from 'pathe';
import { describe, expect, it, vitest } from 'vitest';

describe('getResolvedPaths', () => {
  it('normal', async () => {
    const originPath = process.cwd();
    vitest.stubEnv('INIT_CWD', pathe.join(process.cwd(), 'examples'));

    const r = getResolvedPaths({
      rootDirs: [pathe.join(originPath, 'examples')],
      project: pathe.join(originPath, 'examples', 'tsconfig.json'),
      output: pathe.join(originPath, 'examples'),
    });

    expect(r).toMatchObject({
      project: pathe.join(originPath, 'examples', 'tsconfig.json'),
      projectDir: pathe.join(originPath, 'examples'),
      cwd: originPath,
      output: pathe.join(originPath, 'examples'),
      rootDirs: [pathe.join(originPath, 'examples')],
    });
  });

  it('relative path', async () => {
    const originPath = process.cwd();
    vitest.stubEnv('USE_INIT_CWD', 'true');
    vitest.stubEnv('INIT_CWD', pathe.join(originPath, 'examples'));

    const r = getResolvedPaths({
      project: './tsconfig.json',
      rootDirs: ['.'],
      output: '.',
    });

    expect(r).toMatchObject({
      project: pathe.join(originPath, 'examples', 'tsconfig.json'),
      output: pathe.join(originPath, 'examples'),
      cwd: pathe.join(originPath, 'examples'),
    });
  });

  it('absolute rootDir', async () => {
    const originPath = process.cwd();
    vitest.stubEnv('USE_INIT_CWD', 'true');
    vitest.stubEnv('INIT_CWD', pathe.join(originPath, 'examples'));

    const r = getResolvedPaths({
      project: './tsconfig.json',
      output: '.',
      rootDirs: [pathe.join(originPath, 'examples')],
    });

    expect(r).toMatchObject({
      project: pathe.join(originPath, 'examples', 'tsconfig.json'),
      output: pathe.join(originPath, 'examples'),
      cwd: pathe.join(originPath, 'examples'),
      rootDirs: [pathe.join(originPath, 'examples')],
    });
  });
});
