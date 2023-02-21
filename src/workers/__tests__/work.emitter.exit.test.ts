import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';

afterAll(() => {
  jest.clearAllMocks();
});

describe('WorkEmitter - terminate', () => {
  test('terminate', () => {
    jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
      throw new Error('Exit triggered');
    });

    try {
      NozzleEmitter.terminate(0);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('terminate - undefined', () => {
    jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
      throw new Error('Exit triggered');
    });

    try {
      NozzleEmitter.terminate();
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('terminate - emit', () => {
    jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
      throw new Error('Exit triggered');
    });

    try {
      const w = new NozzleEmitter();
      w.emit(CE_WORKER_ACTION.TERMINATE);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });
});
