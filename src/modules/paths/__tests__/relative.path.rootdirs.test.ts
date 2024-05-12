import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getRelativePathByRootDirs', () => {
  it('relative path root-dirs parameters, and target directory is relative and same root-dirs', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs'],
      'getInitialOption',
      'src/configs',
    );

    expect(r01).toEqual('getInitialOption');
  });

  it('relative path root-dirs parameters, and target directory is relative and decscendent of root-dirs', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs'],
      'IBaseOption',
      'src/configs/interfaces',
    );

    expect(r01).toEqual('interfaces/IBaseOption');
  });

  it('relative path root-dirs parameters, but directory is same root-dirs', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs'],
      'getInitialOption',
      pathe.join(process.cwd(), 'src/configs'),
    );

    expect(r01).toEqual('getInitialOption');
  });

  it('relative path root-dirs parameters, but descendent directory is absolute', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs'],
      'IBaseOption',
      pathe.join(process.cwd(), 'src/configs/interfaces'),
    );

    expect(r01).toEqual('interfaces/IBaseOption');
  });

  it('relative path root-dirs parameters, but target directory are not descendent', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs/interfaces'],
      'getCwd',
      pathe.join(process.cwd(), 'src/tools'),
    );

    expect(r01).toEqual('../tools/getCwd');
  });
});
