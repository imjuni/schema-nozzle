import getResolvedPaths from '#configs/getResolvedPaths';
import getWatchFiles from '#modules/getWatchFiles';
import 'jest';
import path from 'path';
import type * as tsm from 'ts-morph';
import ts from 'typescript';

const originPath = process.env.INIT_CWD!;
const data: {
  project: tsm.Project;
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
} = {} as any;

beforeEach(async () => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('getWatchFiles', () => {
  test('pass', () => {
    const files = getWatchFiles({ project: data.resolvedPaths.project });
    expect(files).toMatchObject(['**/*.ts']);
  });

  test('fail', () => {
    try {
      getWatchFiles({ project: `` });
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('exception', () => {
    try {
      jest.spyOn(ts, 'readConfigFile').mockImplementationOnce(() => {
        throw new Error('invalid');
      });

      getWatchFiles({ project: `` });
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});
