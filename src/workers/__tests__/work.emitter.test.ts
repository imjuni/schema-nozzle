import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import * as env from '#modules/__tests__/env';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import NozzleContext from '#workers/NozzleContext';
import NozzleEmitter from '#workers/NozzleEmitter';
import fastCopy from 'fast-copy';
import 'jest';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import * as tsm from 'ts-morph';

// const compilerOptions = {
//   lib: ['lib.es2021.d.ts', 'lib.dom.d.ts'],
//   module: 1,
//   target: 7,
//   strict: true,
//   esModuleInterop: true,
//   skipLibCheck: true,
//   forceConsistentCasingInFileNames: true,
//   moduleResolution: 2,
//   declaration: true,
//   composite: true,
//   incremental: true,
//   declarationMap: true,
//   sourceMap: true,
//   removeComments: true,
//   noImplicitAny: false,
//   importHelpers: false,
//   noImplicitReturns: true,
//   noFallthroughCasesInSwitch: true,
//   isolatedModules: true,
//   allowSyntheticDefaultImports: true,
//   experimentalDecorators: true,
//   emitDecoratorMetadata: true,
//   pretty: true,
// };

const originPath = process.cwd();
const ctx = new NozzleContext();
const data: {
  exit: jest.SpyInstance | undefined;
  send: jest.SpyInstance | undefined;
} = { exit: undefined, send: undefined };

beforeAll(async () => {
  ctx.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
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
  ctx.generatorOption = ctx.option.generatorOptionObject;
  ctx.generator = tjsg.createGenerator({
    ...ctx.option.generatorOptionObject,
    type: '*',
  });
});

beforeEach(async () => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
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
  ctx.generatorOption = ctx.option.generatorOptionObject;
  ctx.generator = tjsg.createGenerator({
    ...ctx.option.generatorOptionObject,
    type: '*',
  });

  data.exit = jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
    throw new Error('Exit triggered');
  });

  data.send = jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
    return true;
  });
});

afterEach(() => {
  if (data.exit != null) {
    data.exit.mockRestore();
  }

  if (data.send != null) {
    data.send.mockRestore();
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('WorkEmitter - project', () => {
  test('pass - option load emit', async () => {
    const w = new NozzleEmitter({ context: ctx });

    w.emit(CE_WORKER_ACTION.OPTION_LOAD, {
      option: ctx.option,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']);
  });

  test('pass - project emit', async () => {
    const w = new NozzleEmitter({ context: ctx });
    w.emit(CE_WORKER_ACTION.PROJECT_LOAD);
  });

  test('fail', async () => {
    try {
      const w = new NozzleEmitter({ context: ctx });
      ctx.option.project = '';

      await w.loadProject();
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('fail - 2', async () => {
    try {
      const w = new NozzleEmitter();
      ctx.option.project = '';

      w.emit(CE_WORKER_ACTION.PROJECT_LOAD);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('fail - 3', async () => {
    try {
      const w = new NozzleEmitter();
      await w.loadProject();
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('working', () => {
    const w = new NozzleEmitter();
    w.working({ command: CE_WORKER_ACTION.NOOP });
  });

  test('diagonostic', async () => {
    const w = new NozzleEmitter({ context: ctx });
    await w.diagonostic();
  });

  describe('diagonostic - exception', () => {
    afterEach(() => {
      const sourceFile = ctx.project.getSourceFile('diagonostic_fail.ts');

      if (sourceFile != null) {
        ctx.project.removeSourceFile(sourceFile);
      }

      ctx.option.skipError = true;
    });

    test('diagonostic - skipError false', async () => {
      try {
        const nctx = new NozzleContext();
        nctx.project = ctx.project;
        nctx.generatorOption = fastCopy(ctx.generatorOption);
        nctx.option = fastCopy(ctx.option);
        nctx.generator = tjsg.createGenerator(nctx.generatorOption);

        nctx.option.skipError = false;

        const w = new NozzleEmitter({ context: nctx });
        nctx.project.createSourceFile('diagonostic_fail.ts', 'const a = "1"; a = 3', {
          overwrite: true,
        });

        w.emit(CE_WORKER_ACTION.PROJECT_DIAGONOSTIC);
      } catch (caught) {
        expect(caught).toBeDefined();
      }
    });
  });
});
