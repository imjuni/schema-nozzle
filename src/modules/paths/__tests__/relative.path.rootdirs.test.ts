import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getRelativePathByRootDirs', () => {
  it('second descendent', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs/interfaces'],
      pathe.join(process.cwd(), 'src/configs/interfaces/IBaseOption.ts'),
    );

    expect(r01).toEqual('IBaseOption.ts');
  });

  it('same directory', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs/interfaces'],
      pathe.join(process.cwd(), 'src/cli'),
    );

    expect(r01).toEqual('');
  });

  it('not descendent', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs/interfaces'],
      pathe.join(process.cwd(), 'src/tools/getCwd.ts'),
    );

    expect(r01).toEqual('../tools/getCwd.ts');
  });
});
