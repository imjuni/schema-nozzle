import { NozzleEmitter } from '#/workers/NozzleEmitter';
import type { TMasterToWorkerMessage } from '#/workers/interfaces/TMasterToWorkerMessage';
import consola from 'consola';
import { isError } from 'my-easy-fp';

export async function worker() {
  const emitter: NozzleEmitter = new NozzleEmitter();

  process.on('message', (payload: TMasterToWorkerMessage) => {
    try {
      consola.trace(`worker message-01: ${typeof payload}-${payload.command}`);

      if ('data' in payload) {
        emitter.emit(payload.command, payload.data);
      } else {
        emitter.emit(payload.command);
      }
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      consola.trace(err.message);
      consola.trace(err.stack);
    }
  });
}
