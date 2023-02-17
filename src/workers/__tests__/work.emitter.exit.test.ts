import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';

beforeAll(() => {
  jest.spyOn(process, 'exit').mockImplementation((_code?: number | undefined) => {
    throw new Error('Exit triggered');
  });

  jest.spyOn(process, 'send').mockImplementation((_data: unknown) => {
    return true;
  });
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('WorkEmitter - terminate', () => {
  test('terminate', () => {
    try {
      NozzleEmitter.terminate(0);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('terminate - undefined', () => {
    try {
      NozzleEmitter.terminate();
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('terminate - emit', () => {
    try {
      const w = new NozzleEmitter();
      w.emit(CE_WORKER_ACTION.TERMINATE);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });
});
