import * as env from '#modules/__tests__/env';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';

beforeEach(() => {
  jest.spyOn(process, 'exit').mockImplementation((code?: number | undefined) => {
    // eslint-disable-next-line no-console
    console.log(code);
    throw new Error('Exit triggered');
  });
});

describe('WorkEmitter', () => {
  test('pass', async () => {
    const w = new NozzleEmitter();

    await w.loadProject({ project: env.baseOption.project });
    expect(w.project).toBeTruthy();
  });

  test('fail', async () => {
    try {
      const w = new NozzleEmitter();
      await w.loadProject({ project: '' });
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('terminate', () => {
    try {
      NozzleEmitter.terminate(0);
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('terminate - undefined', () => {
    try {
      NozzleEmitter.terminate();
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('working', () => {
    const w = new NozzleEmitter();
    w.working({ command: CE_WORKER_ACTION.NOOP, data: undefined });
  });
});
