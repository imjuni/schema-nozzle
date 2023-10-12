import getResolvedPaths from '#/configs/getResolvedPaths';
import getSchemaGeneratorOption from '#/configs/getSchemaGeneratorOption';
import * as dfp from '#/databases/getDatabaseFilePath';
import * as env from '#/modules/__tests__/env';
import getWatchFiles from '#/modules/getWatchFiles';
import NozzleContext from '#/workers/NozzleContext';
import 'jest';
import path from 'path';

const originPath = process.cwd();
process.env.USE_INIT_CWD = 'true';
process.env.INIT_CWD = path.join(originPath, 'examples');
const ctx = new NozzleContext();

beforeAll(async () => {
  ctx.option = {
    ...env.addCmdOption,
    ...getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
    }),
    generatorOptionObject: await getSchemaGeneratorOption({
      discriminator: 'add-schema',
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      generatorOption: undefined,
      skipError: env.addCmdOption.skipError,
    }),
  };
});

describe('getWatchFiles', () => {
  test('pass', async () => {
    const filePaths = [
      { origin: path.join(ctx.option.cwd, 'a.ts'), refined: 'a.ts' },
      { origin: path.join(ctx.option.cwd, 'b.ts'), refined: 'b.ts' },
      { origin: path.join(ctx.option.cwd, 'c.ts'), refined: 'c.ts' },
    ];
    const files = await getWatchFiles(filePaths, ctx.option);

    expect(files).toMatchObject([
      path.join(ctx.option.cwd, 'a.ts'),
      path.join(ctx.option.cwd, 'b.ts'),
      path.join(ctx.option.cwd, 'c.ts'),
    ]);
  });

  test('pass - no listfile', async () => {
    const filePaths = [
      { origin: path.join(ctx.option.cwd, 'a.ts'), refined: 'a.ts' },
      { origin: path.join(ctx.option.cwd, 'b.ts'), refined: 'b.ts' },
      { origin: path.join(ctx.option.cwd, 'c.ts'), refined: 'c.ts' },
    ];

    const files = await getWatchFiles(filePaths, {
      ...ctx.option,
      cwd: `${ctx.option.cwd}a`,
      listFile: undefined,
    });

    expect(files).toMatchObject([
      path.join(ctx.option.cwd, 'a.ts'),
      path.join(ctx.option.cwd, 'b.ts'),
      path.join(ctx.option.cwd, 'c.ts'),
    ]);
  });

  test('fail - exception', async () => {
    const spy = jest.spyOn(dfp, 'default').mockImplementationOnce(() => {
      throw new Error('raise error');
    });

    const filePaths = [
      { origin: path.join(ctx.option.cwd, 'a.ts'), refined: 'a.ts' },
      { origin: path.join(ctx.option.cwd, 'b.ts'), refined: 'b.ts' },
      { origin: path.join(ctx.option.cwd, 'c.ts'), refined: 'c.ts' },
    ];

    try {
      await getWatchFiles(filePaths, {
        ...ctx.option,
        cwd: `${ctx.option.cwd}a`,
        listFile: undefined,
      });
    } catch (err) {
      spy.mockRestore();
      expect(err).toBeTruthy();
    }
  });
});
